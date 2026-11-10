import {
    actualizarCompras,
    obtenerCompras,
} from "../requisicionesCotizaciones/almacenCompras";
import type {
    EventoMercaderiaDisponible,
    ResultadoDisponibilidad,
} from "./tiposDisponibilidad";

const publicacionesActivas = new Set<string>();

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
            correlationId: crearIdEvento(validacion.idRecepcion),
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

function esRegistro(
    valor: unknown,
): valor is Record<string, unknown> {
    return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

function validarResultadoDisponibilidad(
    entrada: unknown,
): ResultadoDisponibilidad {
    if (!esRegistro(entrada)) {
        throw new Error("El resultado recibido no tiene un formato válido.");
    }

    const {
        correlationId,
        recepcionId,
        fechaResultado,
        estadoProcesamiento,
        motivoRechazo,
    } = entrada;

    if (typeof correlationId !== "string" || !correlationId.trim()) {
        throw new Error("El resultado debe incluir un correlationId válido.");
    }
    if (!Number.isSafeInteger(recepcionId) || Number(recepcionId) <= 0) {
        throw new Error("El resultado debe incluir un recepcionId válido.");
    }
    if (
        typeof fechaResultado !== "string" ||
        !fechaResultado.trim() ||
        !Number.isFinite(Date.parse(fechaResultado))
    ) {
        throw new Error("El resultado debe incluir una fecha válida.");
    }
    if (
        estadoProcesamiento !== "Confirmada" &&
        estadoProcesamiento !== "Rechazada"
    ) {
        throw new Error("El estado de procesamiento recibido no es válido.");
    }
    if (motivoRechazo !== undefined && typeof motivoRechazo !== "string") {
        throw new Error("El motivo del rechazo debe ser texto.");
    }
    if (
        estadoProcesamiento === "Rechazada" &&
        (typeof motivoRechazo !== "string" || !motivoRechazo.trim())
    ) {
        throw new Error("El rechazo debe incluir el motivo informado.");
    }

    return {
        correlationId: correlationId.trim(),
        recepcionId: Number(recepcionId),
        fechaResultado,
        estadoProcesamiento,
        ...(typeof motivoRechazo === "string"
            ? { motivoRechazo: motivoRechazo.trim() }
            : {}),
    };
}

function mismoResultado(
    primero: ResultadoDisponibilidad,
    segundo: ResultadoDisponibilidad,
): boolean {
    return (
        primero.correlationId === segundo.correlationId &&
        primero.recepcionId === segundo.recepcionId &&
        primero.fechaResultado === segundo.fechaResultado &&
        primero.estadoProcesamiento === segundo.estadoProcesamiento &&
        primero.motivoRechazo === segundo.motivoRechazo
    );
}

export function registrarResultadoDisponibilidad(
    entrada: unknown,
): void {
    const resultado = validarResultadoDisponibilidad(entrada);

    actualizarCompras(actual => {
        const eventos = actual.eventosMercaderiaDisponible.filter(
            item =>
                (item.correlationId ?? item.idEvento) ===
                resultado.correlationId,
        );
        if (eventos.length === 0) {
            throw new Error(
                "No existe un evento publicado con el correlationId recibido.",
            );
        }
        if (eventos.length !== 1) {
            throw new Error(
                "El correlationId corresponde a varios eventos y requiere revisión.",
            );
        }
        const [evento] = eventos;
        if (evento.estadoPublicacion !== "Publicado") {
            throw new Error(
                "No se puede procesar un resultado para un evento no publicado.",
            );
        }
        if (evento.idRecepcion !== resultado.recepcionId) {
            throw new Error(
                "El recepcionId recibido no corresponde al evento publicado.",
            );
        }
        if (evento.resultadoProcesamiento) {
            if (
                mismoResultado(evento.resultadoProcesamiento, resultado)
            ) {
                return actual;
            }
            throw new Error(
                "El evento ya tiene un resultado distinto registrado.",
            );
        }

        return {
            ...actual,
            eventosMercaderiaDisponible:
                actual.eventosMercaderiaDisponible.map(item =>
                    item.idEvento === evento.idEvento
                        ? { ...item, resultadoProcesamiento: resultado }
                        : item,
                ),
        };
    });
}

function actualizarEstadoPublicacion(
    idEvento: string,
    actualizacion: Partial<
        Pick<
            EventoMercaderiaDisponible,
            | "estadoPublicacion"
            | "referenciaPublicacion"
            | "errorPublicacion"
            | "fechaUltimoIntento"
        >
    > & {
        numeroIntento?: number;
        resultadoIntento?: "En curso" | "Publicado" | "Error";
        mensajeIntento?: string;
        referenciaIntento?: string;
    },
): void {
    actualizarCompras(actual =>
        actual.eventosMercaderiaDisponible.some(
            evento => evento.idEvento === idEvento,
        )
            ? {
                  ...actual,
                  eventosMercaderiaDisponible:
                      actual.eventosMercaderiaDisponible.map(evento => {
                          if (evento.idEvento !== idEvento) return evento;

                          const {
                              numeroIntento,
                              resultadoIntento,
                              mensajeIntento,
                              referenciaIntento,
                              ...cambiosEvento
                          } = actualizacion;
                          const intentos = evento.intentosPublicacion ?? [];
                          let intentosActualizados = intentos;
                          if (
                              numeroIntento !== undefined &&
                              resultadoIntento !== undefined
                          ) {
                              const existeIntento = intentos.some(
                                  intento =>
                                      intento.numero === numeroIntento,
                              );
                              intentosActualizados = existeIntento
                                  ? intentos.map(intento =>
                                        intento.numero === numeroIntento
                                            ? {
                                                  ...intento,
                                                  resultado: resultadoIntento,
                                                  mensaje: mensajeIntento,
                                                  referenciaPublicacion:
                                                      referenciaIntento,
                                              }
                                            : intento,
                                    )
                                  : [
                                        ...intentos,
                                        {
                                            numero: numeroIntento,
                                            fechaIntento:
                                                cambiosEvento.fechaUltimoIntento ??
                                                new Date().toISOString(),
                                            resultado: resultadoIntento,
                                            ...(mensajeIntento
                                                ? { mensaje: mensajeIntento }
                                                : {}),
                                            ...(referenciaIntento
                                                ? {
                                                      referenciaPublicacion:
                                                          referenciaIntento,
                                                  }
                                                : {}),
                                        },
                                    ];
                          }

                          return {
                              ...evento,
                              ...cambiosEvento,
                              intentosPublicacion: intentosActualizados,
                          };
                      }),
              }
            : actual,
    );
}

export function recuperarPublicacionesInterrumpidas(): void {
    const eventosInterrumpidos =
        obtenerCompras().eventosMercaderiaDisponible.filter(
            evento =>
                evento.estadoPublicacion === "Publicando" &&
                !publicacionesActivas.has(evento.idEvento),
        );

    for (const evento of eventosInterrumpidos) {
        const ultimoIntento = evento.intentosPublicacion?.reduce<
            number | undefined
        >(
            (ultimo, intento) =>
                ultimo === undefined || intento.numero > ultimo
                    ? intento.numero
                    : ultimo,
            undefined,
        );
        const numeroIntento = ultimoIntento ?? 1;
        const mensaje =
            "El envío se interrumpió antes de registrar su resultado. El resultado remoto es incierto; el reintento conserva la clave de idempotencia.";

        actualizarEstadoPublicacion(evento.idEvento, {
            estadoPublicacion: "Error",
            errorPublicacion: mensaje,
            fechaUltimoIntento:
                evento.fechaUltimoIntento ??
                evento.fechaConfirmacionDisponibilidad,
            numeroIntento,
            resultadoIntento: "Error",
            mensajeIntento: mensaje,
        });
    }
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
    if (
        evento.estadoPublicacion !== "Pendiente" &&
        evento.estadoPublicacion !== "Error" &&
        evento.estadoPublicacion !== "Pendiente de configuración"
    ) {
        throw new Error("El estado del evento no permite intentar su envío.");
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

    const numeroIntento =
        (evento.intentosPublicacion?.reduce(
            (maximo, intento) => Math.max(maximo, intento.numero),
            0,
        ) ?? 0) + 1;
    const fechaIntento = new Date().toISOString();
    publicacionesActivas.add(idEvento);
    try {
        actualizarEstadoPublicacion(idEvento, {
            estadoPublicacion: "Publicando",
            fechaUltimoIntento: fechaIntento,
            errorPublicacion: undefined,
            numeroIntento,
            resultadoIntento: "En curso",
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
                numeroIntento,
                resultadoIntento: "Error",
                mensajeIntento: mensaje,
            });
            return;
        }

        if (!respuesta.ok) {
            const mensaje = `El publicador respondió HTTP ${respuesta.status}.`;
            actualizarEstadoPublicacion(idEvento, {
                estadoPublicacion: "Error",
                errorPublicacion: mensaje,
                numeroIntento,
                resultadoIntento: "Error",
                mensajeIntento: mensaje,
            });
            return;
        }

        const referenciaPublicacion =
            respuesta.headers.get("x-message-id") ?? undefined;
        actualizarEstadoPublicacion(idEvento, {
            estadoPublicacion: "Publicado",
            referenciaPublicacion,
            errorPublicacion: undefined,
            numeroIntento,
            resultadoIntento: "Publicado",
            referenciaIntento: referenciaPublicacion,
        });
    } finally {
        publicacionesActivas.delete(idEvento);
    }
}
