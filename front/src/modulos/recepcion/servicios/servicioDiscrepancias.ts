import { actualizarCompras, notificarMensaje, obtenerCompras, siguienteId } from "../../../estado/almacenCompras";
import { conexion } from "../../../servicios/api/configuracion";
import { recargar } from "../../../servicios/sincronizacion";
import type { DatosDiscrepancia } from "../tipos/discrepancia";
import { motivoDiscrepanciaProducto, registrarDiscrepanciaApi } from "./recepcionApi";

/** Registra la discrepancia en el servidor y devuelve el mensaje para el usuario. */
async function registrarDiscrepanciaServidor(datos: DatosDiscrepancia): Promise<string> {
    const recepcion = obtenerCompras().recepcionesRegistradas.find(
        item => item.idRecepcion === datos.idRecepcion,
    );
    if (!recepcion) {
        throw new Error("La recepción seleccionada no existe.");
    }

    const idDetalle = recepcion.detalles.find(
        linea => linea.idDetalleOrden === datos.idDetalleOrden,
    )?.idDetalleRecepcion;
    if (idDetalle === undefined) {
        throw new Error("La recepción no está actualizada. Recarga la página e inténtalo de nuevo.");
    }

    const cantidad = datos.cantidadDiscrepante ?? 0;
    if (!Number.isSafeInteger(cantidad) || cantidad < 1) {
        throw new Error("Ingresa una cantidad entera mayor que cero.");
    }

    let tipoDiferencia: string;
    let motivo = datos.descripcion;
    if (datos.tipo === "producto") {
        tipoDiferencia = "PRODUCTO_INCORRECTO";
        motivo = motivoDiscrepanciaProducto(datos.productoRecibido, datos.descripcion);
    } else if (datos.sentido === "exceso") {
        tipoDiferencia = "EXCESO";
    } else if (datos.sentido === "faltante") {
        tipoDiferencia = "FALTANTE";
    } else {
        throw new Error("Indica si la diferencia es un faltante o un exceso.");
    }

    const respuesta = await registrarDiscrepanciaApi({ idDetalle, tipoDiferencia, cantidad, motivo });
    await recargar("recepcion");
    return respuesta.estado === "PENDIENTE_RESOLUCION"
        ? "Discrepancia registrada. El exceso queda pendiente de resolución y no permitirá cerrar la orden."
        : "Discrepancia registrada. Puedes gestionar la devolución de lo rechazado.";
}

/**
 * Registra una diferencia de cantidad o de producto detectada en una recepción.
 * Con la conexión activa la guarda en el servidor y muestra su resultado.
 */
export async function registrarDiscrepancia(datos: DatosDiscrepancia): Promise<void> {
    if (conexion.recepcion) {
        notificarMensaje(await registrarDiscrepanciaServidor(datos), "exito");
        return;
    }

    actualizarCompras(actual => {
        const recepcion = actual.recepcionesRegistradas.find(
            item => item.idRecepcion === datos.idRecepcion,
        );

        if (!recepcion) {
            throw new Error("La recepción seleccionada no existe.");
        }

        return {
            ...actual,
            discrepancias: [
                ...actual.discrepancias,
                {
                    ...datos,
                    idDiscrepancia: siguienteId(
                        actual.discrepancias.map(item => item.idDiscrepancia),
                    ),
                    idOrden: recepcion.idOrden,
                    fechaRegistro: new Date().toISOString(),
                },
            ],
            mensaje: "Discrepancia registrada. Puedes gestionar la devolución de lo rechazado.",
            tipoMensaje: "exito",
        };
    });
}
