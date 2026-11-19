import {
    actualizarCompras,
    obtenerCompras,
} from "../requisicionesCotizaciones/almacenCompras";
import type {
    EventoOrdenCompraConfirmada,
    IntentoPublicacionContabilidad,
} from "./tiposEventoContabilidad";

const publicacionesActivas = new Set<string>();

function crearPayloadEvento(
    evento: EventoOrdenCompraConfirmada,
): Omit<
    EventoOrdenCompraConfirmada,
    | "estadoPublicacion"
    | "intentosPublicacion"
    | "fechaUltimoIntento"
    | "referenciaPublicacion"
    | "errorPublicacion"
> {
    return {
        idEvento: evento.idEvento,
        tipoEvento: evento.tipoEvento,
        correlationId: evento.correlationId,
        fechaEvento: evento.fechaEvento,
        idOrden: evento.idOrden,
        numeroOrden: evento.numeroOrden,
        fechaOrden: evento.fechaOrden,
        referenciaProveedor: evento.referenciaProveedor,
        fechaConfirmacionProveedor:
            evento.fechaConfirmacionProveedor,
        proveedor: evento.proveedor,
        total: evento.total,
        detalles: evento.detalles,
    };
}

function actualizarPublicacion(
    idEvento: string,
    cambios: Partial<
        Pick<
            EventoOrdenCompraConfirmada,
            | "estadoPublicacion"
            | "fechaUltimoIntento"
            | "referenciaPublicacion"
            | "errorPublicacion"
        >
    >,
    intento?: IntentoPublicacionContabilidad,
): void {
    actualizarCompras(actual => {
        if (
            !actual.eventosOrdenCompraContabilidad.some(
                evento => evento.idEvento === idEvento,
            )
        ) {
            throw new Error(
                "No se encontró el evento contable de la orden.",
            );
        }

        return {
            ...actual,
            eventosOrdenCompraContabilidad:
                actual.eventosOrdenCompraContabilidad.map(evento => {
                    if (evento.idEvento !== idEvento) return evento;

                    if (!intento) {
                        return { ...evento, ...cambios };
                    }

                    const intentos = evento.intentosPublicacion ?? [];
                    const existeIntento = intentos.some(
                        item => item.numero === intento.numero,
                    );

                    return {
                        ...evento,
                        ...cambios,
                        intentosPublicacion: existeIntento
                            ? intentos.map(item =>
                                  item.numero === intento.numero
                                      ? {
                                            ...item,
                                            ...intento,
                                        }
                                      : item,
                              )
                            : [...intentos, intento],
                    };
                }),
        };
    });
}

export function recuperarPublicacionesContabilidadInterrumpidas(): void {
    const interrumpidos =
        obtenerCompras().eventosOrdenCompraContabilidad.filter(
            evento =>
                evento.estadoPublicacion === "Publicando" &&
                !publicacionesActivas.has(evento.idEvento),
        );

    for (const evento of interrumpidos) {
        const ultimoIntento = evento.intentosPublicacion.reduce(
            (maximo, intento) => Math.max(maximo, intento.numero),
            0,
        );
        const numeroIntento = ultimoIntento || 1;
        const fechaIntento =
            evento.fechaUltimoIntento ?? new Date().toISOString();
        const mensaje =
            "El envío se interrumpió antes de registrar su resultado. El resultado remoto es incierto; se conserva la clave de idempotencia.";

        actualizarPublicacion(
            evento.idEvento,
            {
                estadoPublicacion: "Error",
                errorPublicacion: mensaje,
            },
            {
                numero: numeroIntento,
                fechaIntento,
                resultado: "Error",
                mensaje,
            },
        );
    }
}

export async function publicarOrdenConfirmadaAContabilidad(
    idEvento: string,
): Promise<void> {
    const evento = obtenerCompras().eventosOrdenCompraContabilidad.find(
        item => item.idEvento === idEvento,
    );

    if (!evento) {
        throw new Error("No se encontró el evento contable de la orden.");
    }
    if (
        evento.estadoPublicacion === "Publicado" ||
        evento.estadoPublicacion === "Publicando"
    ) {
        return;
    }
    if (
        evento.estadoPublicacion !== "Pendiente" &&
        evento.estadoPublicacion !== "Error" &&
        evento.estadoPublicacion !== "Pendiente de configuración"
    ) {
        throw new Error(
            "El estado del evento no permite intentar su publicación.",
        );
    }

    const endpoint =
        import.meta.env.VITE_ORDEN_COMPRA_CONTABILIDAD_API?.trim();
    if (!endpoint) {
        actualizarPublicacion(idEvento, {
            estadoPublicacion: "Pendiente de configuración",
            errorPublicacion:
                "Configura VITE_ORDEN_COMPRA_CONTABILIDAD_API para conectar el publicador de Contabilidad.",
        });
        return;
    }

    const numeroIntento =
        evento.intentosPublicacion.reduce(
            (maximo, intento) => Math.max(maximo, intento.numero),
            0,
        ) + 1;
    const fechaIntento = new Date().toISOString();
    const intento: IntentoPublicacionContabilidad = {
        numero: numeroIntento,
        fechaIntento,
        resultado: "En curso",
    };

    publicacionesActivas.add(idEvento);
    try {
        actualizarPublicacion(
            idEvento,
            {
                estadoPublicacion: "Publicando",
                fechaUltimoIntento: fechaIntento,
                errorPublicacion: undefined,
            },
            intento,
        );

        let respuesta: Response;
        try {
            respuesta = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Idempotency-Key": evento.idEvento,
                },
                body: JSON.stringify(crearPayloadEvento(evento)),
            });
        } catch (fallo) {
            const mensaje =
                fallo instanceof Error
                    ? fallo.message
                    : "No se pudo conectar con Contabilidad.";
            actualizarPublicacion(
                idEvento,
                {
                    estadoPublicacion: "Error",
                    errorPublicacion: mensaje,
                },
                { ...intento, resultado: "Error", mensaje },
            );
            return;
        }

        if (!respuesta.ok) {
            const mensaje = `El publicador de Contabilidad respondió HTTP ${respuesta.status}.`;
            actualizarPublicacion(
                idEvento,
                {
                    estadoPublicacion: "Error",
                    errorPublicacion: mensaje,
                },
                { ...intento, resultado: "Error", mensaje },
            );
            return;
        }

        const referenciaPublicacion =
            respuesta.headers.get("x-message-id") ?? undefined;
        actualizarPublicacion(
            idEvento,
            {
                estadoPublicacion: "Publicado",
                referenciaPublicacion,
                errorPublicacion: undefined,
            },
            {
                ...intento,
                resultado: "Publicado",
                ...(referenciaPublicacion
                    ? { referenciaPublicacion }
                    : {}),
            },
        );
    } finally {
        publicacionesActivas.delete(idEvento);
    }
}
