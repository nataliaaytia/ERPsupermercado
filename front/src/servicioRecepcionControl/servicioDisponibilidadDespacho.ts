import {
    actualizarCompras,
    obtenerCompras,
} from "../requisicionesCotizaciones/almacenCompras";
import type { EventoMercaderiaDisponible } from "./tiposDisponibilidad";

function crearIdEvento(idRecepcion: number): string {
    return `MERCADERIA-DISPONIBLE-${idRecepcion}`;
}

export function confirmarDisponibilidad(
    idRecepcion: number,
): EventoMercaderiaDisponible {
    let eventoCreado: EventoMercaderiaDisponible | undefined;

    actualizarCompras(actual => {
        const validaciones = actual.recepcionesValidadas.filter(
            item => item.idRecepcion === idRecepcion,
        );
        if (validaciones.length !== 1) {
            throw new Error(
                validaciones.length === 0
                    ? "Solo se puede confirmar disponibilidad de una recepción validada."
                    : "La recepción tiene validaciones duplicadas y requiere revisión.",
            );
        }
        const validacion = validaciones[0];

        if (validacion.estado !== "Validada") {
            throw new Error(
                "Solo se puede confirmar disponibilidad de una recepción validada.",
            );
        }
        if (validacion.esEjemplo) {
            throw new Error(
                "Las recepciones de ejemplo no se publican como disponibilidad real.",
            );
        }
        if (
            !actual.recepcionesRegistradas.some(
                recepcion =>
                    recepcion.idRecepcion === validacion.idRecepcion &&
                    recepcion.idOrden === validacion.idOrden,
            )
        ) {
            throw new Error(
                "La recepción validada no tiene un registro asociado.",
            );
        }

        if (
            actual.eventosMercaderiaDisponible.some(
                evento => evento.idRecepcion === idRecepcion,
            )
        ) {
            throw new Error(
                "La disponibilidad de esta recepción ya fue confirmada.",
            );
        }

        const orden = actual.ordenes.find(
            item => item.idOrden === validacion.idOrden,
        );
        if (!orden) {
            throw new Error("No se encontró la orden de compra de la recepción.");
        }

        const detalles = validacion.detalles
            .map(detalle => {
                if (
                    !Number.isSafeInteger(detalle.cantidadRecibida) ||
                    detalle.cantidadRecibida <= 0 ||
                    !Number.isSafeInteger(detalle.cantidadAceptada) ||
                    detalle.cantidadAceptada < 0 ||
                    detalle.cantidadAceptada > detalle.cantidadRecibida
                ) {
                    throw new Error(
                        "La recepción contiene cantidades validadas inválidas.",
                    );
                }
                return detalle;
            })
            .filter(detalle => detalle.cantidadAceptada > 0)
            .map(detalle => {
                const linea = orden.detalles.find(
                    item => item.idDetalle === detalle.idDetalleOrden,
                );
                if (!linea) {
                    throw new Error(
                        `No se encontró la línea ${detalle.idDetalleOrden} en la orden.`,
                    );
                }

                return {
                    idDetalleOrden: detalle.idDetalleOrden,
                    producto:
                        linea.producto.descripcion.trim() ||
                        "Producto no disponible",
                    cantidadAceptada: detalle.cantidadAceptada,
                    cantidadDisponible: detalle.cantidadAceptada,
                };
            });

        if (detalles.length === 0) {
            throw new Error(
                "La recepción no tiene cantidades aceptadas disponibles para despacho.",
            );
        }

        eventoCreado = {
            idEvento: crearIdEvento(validacion.idRecepcion),
            tipoEvento: "MercaderiaDisponible",
            idRecepcion: validacion.idRecepcion,
            idOrden: validacion.idOrden,
            fechaValidacion:
                validacion.fechaValidacion ??
                null,
            fechaConfirmacionDisponibilidad: new Date().toISOString(),
            detalles,
            estadoPublicacion: "Pendiente",
        };

        return {
            ...actual,
            eventosMercaderiaDisponible: [
                ...actual.eventosMercaderiaDisponible,
                eventoCreado,
            ],
        };
    });

    if (!eventoCreado) {
        throw new Error("No se pudo registrar el evento de disponibilidad.");
    }

    return eventoCreado;
}

function actualizarEstadoPublicacion(
    idEvento: string,
    actualizacion: Partial<
        Pick<
            EventoMercaderiaDisponible,
            "estadoPublicacion" | "referenciaPublicacion" | "errorPublicacion"
        >
    >,
): void {
    actualizarCompras(actual =>
        actual.eventosMercaderiaDisponible.some(
            evento => evento.idEvento === idEvento,
        )
            ? {
                  ...actual,
                  eventosMercaderiaDisponible:
                      actual.eventosMercaderiaDisponible.map(evento =>
                          evento.idEvento === idEvento
                              ? { ...evento, ...actualizacion }
                              : evento,
                      ),
              }
            : actual,
    );
}

export async function publicarDisponibilidadAsincronamente(
    idEvento: string,
): Promise<void> {
    const evento = obtenerCompras().eventosMercaderiaDisponible.find(
        item => item.idEvento === idEvento,
    );
    if (!evento) {
        throw new Error("No se encontró el evento de disponibilidad.");
    }
    if (evento.estadoPublicacion === "Publicado") {
        return;
    }
    if (evento.estadoPublicacion === "Publicando") {
        return;
    }

    const endpoint = import.meta.env.VITE_MERCADERIA_DISPONIBLE_API?.trim();
    if (!endpoint) {
        actualizarEstadoPublicacion(idEvento, {
            estadoPublicacion: "Pendiente de configuración",
            errorPublicacion:
                "Configura VITE_MERCADERIA_DISPONIBLE_API para conectar el publicador de Entregas/Despachos.",
        });
        return;
    }

    actualizarEstadoPublicacion(idEvento, {
        estadoPublicacion: "Publicando",
        errorPublicacion: undefined,
    });

    let respuesta: Response;
    try {
        respuesta = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Idempotency-Key": evento.idEvento,
            },
            body: JSON.stringify(evento),
        });
    } catch (fallo) {
        const mensaje =
            fallo instanceof Error
                ? fallo.message
                : "No se pudo conectar con Entregas/Despachos.";
        actualizarEstadoPublicacion(idEvento, {
            estadoPublicacion: "Error",
            errorPublicacion: mensaje,
        });
        return;
    }

    if (!respuesta.ok) {
        actualizarEstadoPublicacion(idEvento, {
            estadoPublicacion: "Error",
            errorPublicacion: `El publicador respondió HTTP ${respuesta.status}.`,
        });
        return;
    }

    actualizarEstadoPublicacion(idEvento, {
        estadoPublicacion: "Publicado",
        referenciaPublicacion:
            respuesta.headers.get("x-message-id") ?? undefined,
        errorPublicacion: undefined,
    });
}
