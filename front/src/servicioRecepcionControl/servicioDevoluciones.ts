import {
    actualizarCompras,
    obtenerCompras,
} from "../requisicionesCotizaciones/almacenCompras";
import type { ResolucionDevolucion, TipoResolucionDevolucion } from "./tiposDevolucion";

export interface DatosResolucionDevolucion {
    idDevolucion: string;
    tipo: TipoResolucionDevolucion;
    evidencia: string;
    detalleCompromiso?: string;
}

function idDevolucion(idRecepcion: number, idDetalleOrden: number): string {
    return `DEV-${idRecepcion}-${idDetalleOrden}`;
}

export function consultarDevoluciones(
    compras: ReturnType<typeof obtenerCompras> = obtenerCompras(),
) {
    const resolucionesPorId = new Map(
        compras.resolucionesDevoluciones.map(resolucion => [
            resolucion.idDevolucion,
            resolucion,
        ]),
    );

    return compras.recepcionesValidadas.flatMap(validacion => {
        if (validacion.esEjemplo) return [];

        const recepcion = compras.recepcionesRegistradas.find(
            item =>
                item.idRecepcion === validacion.idRecepcion &&
                item.idOrden === validacion.idOrden,
        );
        const orden = compras.ordenes.find(
            item => item.idOrden === validacion.idOrden,
        );
        const oferta = compras.ofertas.find(
            item => item.idOferta === orden?.idOfertaOrigen,
        );
        const proveedor = oferta?.proveedor.razonSocial;

        return validacion.detalles.flatMap(detalle => {
            const cantidadDevuelta =
                detalle.cantidadRecibida - detalle.cantidadAceptada;
            if (cantidadDevuelta <= 0) return [];

            const key = idDevolucion(
                validacion.idRecepcion,
                detalle.idDetalleOrden,
            );
            const producto = orden?.detalles.find(
                item => item.idDetalle === detalle.idDetalleOrden,
            )?.producto.descripcion;

            return [{
                idDevolucion: key,
                idRecepcion: validacion.idRecepcion,
                idOrden: validacion.idOrden,
                idDetalleOrden: detalle.idDetalleOrden,
                documentoRecepcion: recepcion?.documento ?? "Documento no disponible",
                fechaRecepcion: recepcion?.fecha ?? "",
                numeroOrden: orden?.numero ?? `Orden ${validacion.idOrden}`,
                producto: producto?.trim() || "Producto no disponible",
                cantidadDevuelta,
                proveedor: proveedor?.trim() || "Proveedor no disponible",
                resolucion: resolucionesPorId.get(key),
            }];
        });
    });
}

export function registrarResolucionDevolucion(
    datos: DatosResolucionDevolucion,
): void {
    const evidencia = datos.evidencia.trim();
    if (!evidencia) {
        throw new Error("Ingresa la evidencia de la resolución.");
    }

    if (datos.tipo !== "retiro" && datos.tipo !== "reposicion") {
        throw new Error("Selecciona retiro o compromiso de reposición.");
    }

    const detalleCompromiso = datos.detalleCompromiso?.trim();
    if (datos.tipo === "reposicion" && !detalleCompromiso) {
        throw new Error(
            "Describe el compromiso de reposición, incluyendo la cantidad y la fecha acordada.",
        );
    }

    actualizarCompras(actual => {
        if (
            actual.resolucionesDevoluciones.some(
                resolucion => resolucion.idDevolucion === datos.idDevolucion,
            )
        ) {
            throw new Error("Esta devolución ya tiene una resolución registrada.");
        }

        const devolucion = consultarDevoluciones(actual).find(
            item => item.idDevolucion === datos.idDevolucion,
        );
        if (!devolucion) {
            throw new Error(
                "La devolución no existe o no tiene cantidades rechazadas.",
            );
        }

        const resolucion: ResolucionDevolucion = {
            idDevolucion: devolucion.idDevolucion,
            tipo: datos.tipo,
            evidencia,
            fechaRegistro: new Date().toISOString(),
            ...(datos.tipo === "reposicion" && detalleCompromiso
                ? { detalleCompromiso }
                : {}),
        };

        return {
            ...actual,
            resolucionesDevoluciones: [
                ...actual.resolucionesDevoluciones,
                resolucion,
            ],
        };
    });
}
