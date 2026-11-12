import { actualizarCompras } from "../requisicionesCotizaciones/almacenCompras";
import type {
    DatosInspeccionCalidad,
    InspeccionCalidadRecepcion,
} from "./tiposInspeccion";

export function registrarInspeccionCalidad(
    datos: DatosInspeccionCalidad,
): void {
    actualizarCompras(actual => {
        const recepciones = actual.recepcionesRegistradas.filter(
            recepcion => recepcion.idRecepcion === datos.idRecepcion,
        );
        if (recepciones.length !== 1) {
            throw new Error(
                recepciones.length === 0
                    ? "No se encontró la recepción que se desea inspeccionar."
                    : "La recepción tiene identificadores duplicados y requiere revisión.",
            );
        }

        const recepcion = recepciones[0];
        if (
            recepcion.estado !== "Pendiente de inspección" &&
            recepcion.estado !== "En inspección"
        ) {
            throw new Error(
                "La recepción ya no está disponible para inspección.",
            );
        }
        if (
            actual.recepcionesValidadas.some(
                validacion =>
                    validacion.idRecepcion === recepcion.idRecepcion &&
                    validacion.idOrden === recepcion.idOrden,
            )
        ) {
            throw new Error(
                "No se puede inspeccionar una recepción ya validada.",
            );
        }
        if (
            actual.inspeccionesCalidad.some(
                inspeccion =>
                    inspeccion.idRecepcion === recepcion.idRecepcion &&
                    inspeccion.idOrden === recepcion.idOrden,
            )
        ) {
            throw new Error(
                "La recepción ya tiene una inspección de calidad registrada.",
            );
        }
        if (
            recepcion.detalles.length === 0 ||
            datos.detalles.length !== recepcion.detalles.length
        ) {
            throw new Error(
                "Debes registrar el resultado de inspección de todas las líneas recibidas.",
            );
        }

        const lineasInspeccionadas = new Set<number>();
        const detalles = recepcion.detalles.map(linea => {
            const resultados = datos.detalles.filter(
                detalle => detalle.idDetalleOrden === linea.idDetalleOrden,
            );
            if (
                resultados.length !== 1 ||
                lineasInspeccionadas.has(linea.idDetalleOrden)
            ) {
                throw new Error(
                    "Cada línea recibida debe aparecer exactamente una vez en la inspección.",
                );
            }

            const resultado = resultados[0];
            const motivoRechazo = resultado.motivoRechazo?.trim();
            if (
                !Number.isSafeInteger(linea.cantidadRecibida) ||
                linea.cantidadRecibida <= 0 ||
                !Number.isSafeInteger(resultado.cantidadConforme) ||
                resultado.cantidadConforme < 0 ||
                !Number.isSafeInteger(resultado.cantidadRechazada) ||
                resultado.cantidadRechazada < 0
            ) {
                throw new Error(
                    `La línea ${linea.idDetalleOrden} debe tener cantidades enteras iguales o mayores que cero.`,
                );
            }
            if (
                resultado.cantidadConforme + resultado.cantidadRechazada !==
                linea.cantidadRecibida
            ) {
                throw new Error(
                    `En la línea ${linea.idDetalleOrden}, conformes y rechazadas deben sumar las ${linea.cantidadRecibida} unidades recibidas.`,
                );
            }
            if (resultado.cantidadRechazada > 0 && !motivoRechazo) {
                throw new Error(
                    `Indica el motivo del rechazo para la línea ${linea.idDetalleOrden}.`,
                );
            }

            lineasInspeccionadas.add(linea.idDetalleOrden);
            return {
                idDetalleOrden: linea.idDetalleOrden,
                cantidadRecibida: linea.cantidadRecibida,
                cantidadConforme: resultado.cantidadConforme,
                cantidadRechazada: resultado.cantidadRechazada,
                ...(resultado.cantidadRechazada > 0 && motivoRechazo
                    ? { motivoRechazo }
                    : {}),
            };
        });

        if (lineasInspeccionadas.size !== datos.detalles.length) {
            throw new Error(
                "La inspección incluye líneas que no pertenecen a la recepción.",
            );
        }

        const siguienteId =
            actual.inspeccionesCalidad.reduce(
                (maximo, inspeccion) =>
                    Math.max(maximo, inspeccion.idInspeccion),
                0,
            ) + 1;
        const inspeccion: InspeccionCalidadRecepcion = {
            idInspeccion: siguienteId,
            idRecepcion: recepcion.idRecepcion,
            idOrden: recepcion.idOrden,
            fechaInspeccion: new Date().toISOString(),
            detalles,
        };

        return {
            ...actual,
            inspeccionesCalidad: [...actual.inspeccionesCalidad, inspeccion],
        };
    });
}
