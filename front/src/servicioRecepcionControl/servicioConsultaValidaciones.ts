import { obtenerCompras } from "../requisicionesCotizaciones/almacenCompras";
import type { RecepcionValidada } from "../servicioOrdenesCompra/tipos";

export interface DetalleValidacionConsultable {
    idDetalleOrden: number;
    producto: string;
    cantidadRecibida: number;
    cantidadAceptada: number;
    cantidadRechazada: number;
    cantidadAutorizada: number;
}

export interface ValidacionRecepcionConsultable {
    idRecepcion: number;
    idOrden: number;
    documento: string | null;
    fecha: string | null;
    estado: "Validada";
    detalles: DetalleValidacionConsultable[];
}

function claveValidacion(validacion: Pick<RecepcionValidada, "idOrden" | "idRecepcion">): string {
    return `${validacion.idOrden}:${validacion.idRecepcion}`;
}

export function consultarValidacionesRecepcion(): ValidacionRecepcionConsultable[] {
    const compras = obtenerCompras();
    const validacionesUnicas = new Map<string, RecepcionValidada>();

    for (const validacion of compras.recepcionesValidadas) {
        if (validacion.estado === "Validada") {
            validacionesUnicas.set(claveValidacion(validacion), validacion);
        }
    }

    return [...validacionesUnicas.values()].map(validacion => {
        const recepcion = compras.recepcionesRegistradas.find(
            item =>
                item.idRecepcion === validacion.idRecepcion &&
                item.idOrden === validacion.idOrden,
        );
        const orden = compras.ordenes.find(
            item => item.idOrden === validacion.idOrden,
        );

        const detalles = validacion.detalles.map(detalle => {
            if (
                !Number.isSafeInteger(detalle.cantidadRecibida) ||
                detalle.cantidadRecibida < 0 ||
                !Number.isSafeInteger(detalle.cantidadAceptada) ||
                detalle.cantidadAceptada < 0 ||
                detalle.cantidadAceptada > detalle.cantidadRecibida
            ) {
                throw new Error(
                    `La validación de la recepción ${validacion.idRecepcion} contiene cantidades inválidas.`,
                );
            }

            const producto = orden?.detalles.find(
                item => item.idDetalle === detalle.idDetalleOrden,
            )?.producto.descripcion;

            return {
                idDetalleOrden: detalle.idDetalleOrden,
                producto: producto?.trim() || "Producto no disponible",
                cantidadRecibida: detalle.cantidadRecibida,
                cantidadAceptada: detalle.cantidadAceptada,
                cantidadRechazada:
                    detalle.cantidadRecibida - detalle.cantidadAceptada,
                cantidadAutorizada: detalle.cantidadAceptada,
            };
        });

        return {
            idRecepcion: validacion.idRecepcion,
            idOrden: validacion.idOrden,
            documento: recepcion?.documento ?? null,
            fecha: recepcion?.fecha ?? null,
            estado: "Validada" as const,
            detalles,
        };
    });
}

export function consultarCantidadesAutorizadas(
    idOrden: number,
): DetalleValidacionConsultable[] {
    return consultarValidacionesRecepcion()
        .filter(validacion => validacion.idOrden === idOrden)
        .flatMap(validacion => validacion.detalles);
}
