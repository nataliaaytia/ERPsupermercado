import { actualizarCompras } from "../requisicionesCotizaciones/almacenCompras";
import type {
    ErrorRespuestaContabilidad,
    ResultadoContabilidadEntrante,
    ResultadoOrdenCompraContabilidad,
} from "./tiposEventoContabilidad";

function esRegistro(valor: unknown): valor is Record<string, unknown> {
    return (
        typeof valor === "object" &&
        valor !== null &&
        !Array.isArray(valor)
    );
}

function validarResultado(
    entrada: unknown,
): ResultadoContabilidadEntrante {
    if (!esRegistro(entrada)) {
        throw new Error("La respuesta de Contabilidad no tiene un formato válido.");
    }

    const {
        idEvento,
        correlationId,
        idOrden,
        fechaResultado,
        estadoProcesamiento,
        idCompromisoContable,
        motivoRechazo,
    } = entrada;

    if (typeof idEvento !== "string" || !idEvento.trim()) {
        throw new Error("La respuesta debe incluir el idEvento original.");
    }
    if (
        typeof correlationId !== "string" ||
        !correlationId.trim()
    ) {
        throw new Error("La respuesta debe incluir un correlationId válido.");
    }
    if (!Number.isSafeInteger(idOrden) || Number(idOrden) <= 0) {
        throw new Error("La respuesta debe incluir un idOrden válido.");
    }
    if (
        typeof fechaResultado !== "string" ||
        !fechaResultado.trim() ||
        !Number.isFinite(Date.parse(fechaResultado))
    ) {
        throw new Error("La respuesta debe incluir una fecha válida.");
    }
    if (
        estadoProcesamiento !== "CompromisoRegistrado" &&
        estadoProcesamiento !== "Rechazado"
    ) {
        throw new Error("El estado de procesamiento de Contabilidad no es válido.");
    }
    if (
        idCompromisoContable !== undefined &&
        (typeof idCompromisoContable !== "string" ||
            !idCompromisoContable.trim())
    ) {
        throw new Error("El identificador del compromiso contable no es válido.");
    }
    if (motivoRechazo !== undefined && typeof motivoRechazo !== "string") {
        throw new Error("El motivo del rechazo debe ser texto.");
    }
    if (
        estadoProcesamiento === "Rechazado" &&
        (typeof motivoRechazo !== "string" || !motivoRechazo.trim())
    ) {
        throw new Error("El rechazo debe incluir un motivo.");
    }

    return {
        idEvento: idEvento.trim(),
        correlationId: correlationId.trim(),
        idOrden: Number(idOrden),
        fechaResultado,
        estadoProcesamiento,
        ...(typeof idCompromisoContable === "string"
            ? { idCompromisoContable: idCompromisoContable.trim() }
            : {}),
        ...(typeof motivoRechazo === "string"
            ? { motivoRechazo: motivoRechazo.trim() }
            : {}),
    };
}

function mismoResultado(
    primero: ResultadoContabilidadEntrante,
    segundo: ResultadoContabilidadEntrante,
): boolean {
    return (
        primero.idEvento === segundo.idEvento &&
        primero.correlationId === segundo.correlationId &&
        primero.idOrden === segundo.idOrden &&
        primero.fechaResultado === segundo.fechaResultado &&
        primero.estadoProcesamiento === segundo.estadoProcesamiento &&
        primero.idCompromisoContable ===
            segundo.idCompromisoContable &&
        primero.motivoRechazo === segundo.motivoRechazo
    );
}

function registrarError(
    entrada: unknown,
    fallo: unknown,
    idMensajePubSub?: string,
): void {
    const datos = esRegistro(entrada) ? entrada : {};
    const registro: ErrorRespuestaContabilidad = {
        ...(typeof datos.idEvento === "string" && datos.idEvento.trim()
            ? { idEvento: datos.idEvento.trim() }
            : {}),
        ...(typeof datos.correlationId === "string" &&
        datos.correlationId.trim()
            ? { correlationId: datos.correlationId.trim() }
            : {}),
        ...(Number.isSafeInteger(datos.idOrden) &&
        Number(datos.idOrden) > 0
            ? { idOrden: Number(datos.idOrden) }
            : {}),
        ...(idMensajePubSub ? { idMensajePubSub } : {}),
        fechaRecepcion: new Date().toISOString(),
        error:
            fallo instanceof Error
                ? fallo.message
                : "No se pudo procesar la respuesta de Contabilidad.",
    };

    actualizarCompras(actual => {
        const errores = actual.erroresRespuestasContabilidad ?? [];
        if (
            idMensajePubSub &&
            errores.some(
                item => item.idMensajePubSub === idMensajePubSub,
            )
        ) {
            return actual;
        }

        return {
            ...actual,
            erroresRespuestasContabilidad: [...errores, registro],
        };
    });
}

export function registrarResultadoOrdenCompraContabilidad(
    entrada: unknown,
    metadatos: { idMensajePubSub?: string } = {},
): void {
    const idMensajePubSub = metadatos.idMensajePubSub?.trim();
    let resultado: ResultadoContabilidadEntrante;

    try {
        resultado = validarResultado(entrada);
    } catch (fallo) {
        registrarError(entrada, fallo, idMensajePubSub);
        throw fallo;
    }

    try {
        actualizarCompras(actual => {
            const eventos = actual.eventosOrdenCompraContabilidad.filter(
                evento => evento.idEvento === resultado.idEvento,
            );
            if (eventos.length === 0) {
                throw new Error(
                    "No existe un evento original con el idEvento recibido.",
                );
            }
            if (eventos.length !== 1) {
                throw new Error(
                    "El idEvento corresponde a varios eventos y requiere revisión.",
                );
            }

            const [evento] = eventos;
            if (evento.correlationId !== resultado.correlationId) {
                throw new Error(
                    "El correlationId recibido no corresponde al evento original.",
                );
            }
            if (evento.idOrden !== resultado.idOrden) {
                throw new Error(
                    "El idOrden recibido no corresponde al evento original.",
                );
            }
            if (evento.estadoPublicacion !== "Publicado") {
                throw new Error(
                    "No se puede procesar una respuesta para un evento no publicado.",
                );
            }

            if (idMensajePubSub) {
                const mensajeProcesado =
                    actual.eventosOrdenCompraContabilidad.find(
                        item =>
                            item.resultadoContabilidad?.idMensajePubSub ===
                            idMensajePubSub,
                    );
                if (mensajeProcesado) {
                    if (
                        mensajeProcesado.idEvento === resultado.idEvento &&
                        mensajeProcesado.resultadoContabilidad &&
                        mismoResultado(
                            mensajeProcesado.resultadoContabilidad,
                            resultado,
                        )
                    ) {
                        return actual;
                    }
                    throw new Error(
                        "El ID de mensaje Pub/Sub ya fue procesado para otro resultado.",
                    );
                }
            }

            if (evento.resultadoContabilidad) {
                if (
                    mismoResultado(
                        evento.resultadoContabilidad,
                        resultado,
                    )
                ) {
                    return actual;
                }
                throw new Error(
                    "El evento ya tiene un resultado distinto de Contabilidad registrado.",
                );
            }

            const resultadoGuardado: ResultadoOrdenCompraContabilidad = {
                ...resultado,
                fechaRecepcion: new Date().toISOString(),
                ...(idMensajePubSub ? { idMensajePubSub } : {}),
            };

            return {
                ...actual,
                eventosOrdenCompraContabilidad:
                    actual.eventosOrdenCompraContabilidad.map(item =>
                        item.idEvento === evento.idEvento
                            ? {
                                  ...item,
                                  resultadoContabilidad: resultadoGuardado,
                              }
                            : item,
                    ),
            };
        });
    } catch (fallo) {
        registrarError(entrada, fallo, idMensajePubSub);
        throw fallo;
    }
}
