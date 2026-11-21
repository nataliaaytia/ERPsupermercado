import {
    actualizarCompras,
} from "../../../estado/almacenCompras";
import type { OrdenCompra, RecepcionValidada } from "../tipos";

export function calcularSaldosEntrega(
    orden: OrdenCompra,
    recepciones: readonly RecepcionValidada[],
) {
    const cantidades = new Map<
        number,
        { aceptadas: number; rechazadas: number }
    >();

    for (const recepcion of recepciones) {
        if (
            recepcion.idOrden !== orden.idOrden ||
            recepcion.estado !== "Validada"
        ) {
            continue;
        }

        for (const detalle of recepcion.detalles) {
            const actual = cantidades.get(detalle.idDetalleOrden) ?? {
                aceptadas: 0,
                rechazadas: 0,
            };

            cantidades.set(detalle.idDetalleOrden, {
                aceptadas: actual.aceptadas + detalle.cantidadAceptada,
                rechazadas:
                    actual.rechazadas +
                    detalle.cantidadRecibida -
                    detalle.cantidadAceptada,
            });
        }
    }

    return orden.detalles.map(linea => {
        const { aceptadas, rechazadas } = cantidades.get(linea.idDetalle) ?? {
            aceptadas: 0,
            rechazadas: 0,
        };

        return {
            idDetalle: linea.idDetalle,
            producto: linea.producto.descripcion,
            ordenadas: linea.cantidad,
            aceptadas,
            rechazadas,
            pendientes: Math.max(0, linea.cantidad - aceptadas),
        };
    });
}

export function incorporarRecepcionValidada(
    recepcion: RecepcionValidada,
): void {
    actualizarCompras(actual => {
        const orden = actual.ordenes.find(
            item => item.idOrden === recepcion.idOrden,
        );

        if (
            !orden ||
            recepcion.estado !== "Validada" ||
            !Number.isSafeInteger(recepcion.idRecepcion) ||
            recepcion.idRecepcion <= 0
        ) {
            throw new Error(
                "La recepción validada no corresponde a una orden disponible.",
            );
        }

        const ids = new Set<number>();

        if (
            !recepcion.detalles.length ||
            recepcion.detalles.some(detalle => {
                if (
                    ids.has(detalle.idDetalleOrden) ||
                    !orden.detalles.some(
                        linea => linea.idDetalle === detalle.idDetalleOrden,
                    ) ||
                    !Number.isSafeInteger(detalle.cantidadRecibida) ||
                    !Number.isSafeInteger(detalle.cantidadAceptada) ||
                    detalle.cantidadAceptada < 0 ||
                    detalle.cantidadRecibida < detalle.cantidadAceptada
                ) {
                    return true;
                }

                ids.add(detalle.idDetalleOrden);
                return false;
            })
        ) {
            throw new Error("Revisa las líneas y las cantidades de la recepción.");
        }

        return {
            ...actual,
            recepcionesValidadas: [
                ...actual.recepcionesValidadas.filter(
                    item =>
                        item.idOrden !== recepcion.idOrden ||
                        item.idRecepcion !== recepcion.idRecepcion,
                ),
                recepcion,
            ],
        };
    });
}
