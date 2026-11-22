import {
    actualizarCompras,
    obtenerCompras,
} from "../../../estado/almacenCompras";
import { conexion } from "../../../servicios/api/configuracion";
import { recargar } from "../../../servicios/sincronizacion";
import type { ResolucionDevolucion, TipoResolucionDevolucion } from "../tipos/devolucion";
import {
    listarDevolucionesDeLinea,
    registrarDevolucionApi,
    resolverDevolucionApi,
} from "./recepcionApi";

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

/**
 * Con la conexión activa: genera la devolución en el servidor si todavía no
 * existe y registra su resolución. Devuelve el mensaje del servidor.
 */
async function resolverDevolucionServidor(
    datos: DatosResolucionDevolucion,
    evidencia: string,
    detalleCompromiso: string | undefined,
): Promise<string> {
    const actual = obtenerCompras();
    if (actual.resolucionesDevoluciones.some(item => item.idDevolucion === datos.idDevolucion)) {
        throw new Error("Esta devolución ya tiene una resolución registrada.");
    }

    const devolucion = consultarDevoluciones(actual).find(
        item => item.idDevolucion === datos.idDevolucion,
    );
    if (!devolucion) {
        throw new Error("La devolución no existe o no tiene cantidades rechazadas.");
    }

    const idDetalle = actual.recepcionesRegistradas
        .find(item => item.idRecepcion === devolucion.idRecepcion)
        ?.detalles.find(linea => linea.idDetalleOrden === devolucion.idDetalleOrden)
        ?.idDetalleRecepcion;
    if (idDetalle === undefined) {
        throw new Error("La recepción no está actualizada. Recarga la página e inténtalo de nuevo.");
    }

    const existentes = await listarDevolucionesDeLinea(idDetalle);
    let registrada = existentes[0];
    if (!registrada) {
        const motivoInspeccion = actual.inspeccionesCalidad
            .find(item => item.idRecepcion === devolucion.idRecepcion)
            ?.detalles.find(linea => linea.idDetalleOrden === devolucion.idDetalleOrden)
            ?.motivoRechazo;
        registrada = await registrarDevolucionApi({
            idDetalle,
            motivo: motivoInspeccion?.trim() || "Mercadería rechazada en la inspección de calidad",
        });
    } else if (registrada.estado !== "GENERADA") {
        await recargar("recepcion");
        throw new Error("Esta devolución ya tiene una resolución registrada.");
    }

    const respuesta = await resolverDevolucionApi({
        idDevolucion: registrada.idDevolucion,
        tipoResolucion: datos.tipo === "retiro" ? "RETIRO" : "COMPROMISO_REPOSICION",
        evidencia,
        ...(datos.tipo === "reposicion" && detalleCompromiso
            ? { observacion: detalleCompromiso }
            : {}),
    });

    // Se conserva el detalle completo de esta sesión; la recarga lo reconoce.
    const resolucion: ResolucionDevolucion = {
        idDevolucion: devolucion.idDevolucion,
        tipo: datos.tipo,
        evidencia,
        fechaRegistro: new Date().toISOString(),
        ...(datos.tipo === "reposicion" && detalleCompromiso ? { detalleCompromiso } : {}),
    };
    actualizarCompras(estado => ({
        ...estado,
        resolucionesDevoluciones: [...estado.resolucionesDevoluciones, resolucion],
    }));
    await recargar("recepcion");
    return respuesta.mensaje?.trim() || "Resolución de la devolución registrada.";
}

/**
 * Registra el retiro o el compromiso de reposición de una devolución.
 * Con la conexión activa lo guarda en el servidor y devuelve su mensaje.
 */
export async function registrarResolucionDevolucion(
    datos: DatosResolucionDevolucion,
): Promise<string | undefined> {
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

    if (conexion.recepcion) {
        return resolverDevolucionServidor(datos, evidencia, detalleCompromiso);
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
