import { actualizarCompras, obtenerCompras } from "../../../estado/almacenCompras";
import { conexion } from "../../../servicios/api/configuracion";
import { recargar } from "../../../servicios/sincronizacion";
import { confirmarAutorizacionApi } from "./recepcionApi";
import type { RecepcionValidada } from "../../ordenesCompra/tipos";
import { calcularSaldosEntrega } from "../../ordenesCompra/servicios/utilidadesSeguimientoEntregas";

export interface DatosConfirmacionRecepcion {
    idRecepcion: number;
    detalles: {
        idDetalleOrden: number;
        cantidadAceptada: number;
    }[];
    /** Con la conexión activa: quién autoriza y una observación opcional. */
    usuarioAutorizador?: string;
    observacion?: string;
}

/**
 * Con la conexión activa el servidor autoriza las cantidades conformes de la
 * inspección (no las que se escriban en el formulario).
 */
async function confirmarRecepcionApi(
    datos: DatosConfirmacionRecepcion,
): Promise<string> {
    const actual = obtenerCompras();
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
    if (
        !actual.inspeccionesCalidad.some(
            item =>
                item.idRecepcion === recepcion.idRecepcion &&
                item.idOrden === recepcion.idOrden,
        )
    ) {
        throw new Error(
            "Primero registra la inspección de calidad de esta recepción.",
        );
    }

    const usuarioAutorizador = datos.usuarioAutorizador?.trim();
    const observacion = datos.observacion?.trim();
    const respuesta = await confirmarAutorizacionApi({
        idRecepcion: recepcion.idRecepcion,
        ...(usuarioAutorizador ? { usuarioAutorizador } : {}),
        ...(observacion ? { observacion } : {}),
    });
    await recargar("recepcion");
    return respuesta.mensaje?.trim() ||
        `La recepción ${recepcion.documento} quedó validada: ${respuesta.totalUnidadesAutorizadas} unidades aceptadas.`;
}

/**
 * Confirma las cantidades aceptadas de una recepción (revisión final).
 * Con la conexión activa la autoriza en el servidor y devuelve su mensaje.
 */
export async function confirmarRecepcion(
    datos: DatosConfirmacionRecepcion,
): Promise<string | undefined> {
    if (conexion.recepcion) return confirmarRecepcionApi(datos);

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
            fechaValidacion: new Date().toISOString(),
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
