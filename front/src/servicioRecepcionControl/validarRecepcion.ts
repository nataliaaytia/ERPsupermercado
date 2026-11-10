import { actualizarCompras } from "../requisicionesCotizaciones/almacenCompras";
import type { RecepcionValidada } from "../servicioOrdenesCompra/tipos";
import { calcularSaldosEntrega } from "../servicioOrdenesCompra/utilidadesSeguimientoEntregas";

export interface DatosConfirmacionRecepcion {
    idRecepcion: number;
    detalles: {
        idDetalleOrden: number;
        cantidadAceptada: number;
    }[];
}

export function confirmarRecepcion(
    datos: DatosConfirmacionRecepcion,
): void {
    actualizarCompras(actual => {
        const recepcion = actual.recepcionesRegistradas.find(
            item => item.idRecepcion === datos.idRecepcion,
        );

        if (!recepcion) {
            throw new Error("La recepción seleccionada ya no está disponible.");
        }

        if (
            actual.recepcionesValidadas.some(
                item =>
                    item.idRecepcion === recepcion.idRecepcion &&
                    item.idOrden === recepcion.idOrden,
            )
        ) {
            throw new Error("Esta recepción ya fue confirmada.");
        }

        const orden = actual.ordenes.find(
            item => item.idOrden === recepcion.idOrden,
        );

        if (!orden) {
            throw new Error("No se encontró la orden asociada a la recepción.");
        }

        if (
            recepcion.detalles.length === 0 ||
            datos.detalles.length !== recepcion.detalles.length
        ) {
            throw new Error("Debes revisar todas las líneas de la recepción.");
        }

        const saldos = calcularSaldosEntrega(
            orden,
            actual.recepcionesValidadas,
        );

        const idsRevisados = new Set<number>();
        const detalles = recepcion.detalles.map(detalleRecepcion => {
            const linea = orden.detalles.find(
                item => item.idDetalle === detalleRecepcion.idDetalleOrden,
            );
            const confirmacion = datos.detalles.find(
                item =>
                    item.idDetalleOrden === detalleRecepcion.idDetalleOrden,
            );
            const saldo = saldos.find(
                item => item.idDetalle === detalleRecepcion.idDetalleOrden,
            );

            if (
                !linea ||
                !Number.isSafeInteger(linea.cantidad) ||
                linea.cantidad <= 0 ||
                !saldo ||
                !confirmacion ||
                idsRevisados.has(detalleRecepcion.idDetalleOrden) ||
                !Number.isSafeInteger(detalleRecepcion.cantidadRecibida) ||
                detalleRecepcion.cantidadRecibida <= 0 ||
                !Number.isSafeInteger(confirmacion.cantidadAceptada) ||
                confirmacion.cantidadAceptada < 0 ||
                confirmacion.cantidadAceptada > detalleRecepcion.cantidadRecibida
            ) {
                throw new Error(
                    "Revisa las líneas y las cantidades aceptadas de la recepción.",
                );
            }

            const cantidadDisponible = saldo.pendientes;
            if (confirmacion.cantidadAceptada > cantidadDisponible) {
                throw new Error(
                    `La línea ${linea.idDetalle} supera la cantidad pendiente de la orden (${cantidadDisponible}).`,
                );
            }

            idsRevisados.add(detalleRecepcion.idDetalleOrden);

            return {
                idDetalleOrden: detalleRecepcion.idDetalleOrden,
                cantidadRecibida: detalleRecepcion.cantidadRecibida,
                cantidadAceptada: confirmacion.cantidadAceptada,
            };
        });

        const validacion: RecepcionValidada = {
            idRecepcion: recepcion.idRecepcion,
            idOrden: recepcion.idOrden,
            estado: "Validada",
            detalles,
        };

        return {
            ...actual,
            recepcionesValidadas: [
                ...actual.recepcionesValidadas,
                validacion,
            ],
        };
    });
}
