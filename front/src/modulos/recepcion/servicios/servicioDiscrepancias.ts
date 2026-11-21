import { actualizarCompras, siguienteId } from "../../../estado/almacenCompras";
import type { DatosDiscrepancia } from "../tipos/discrepancia";

/** Registra una diferencia de cantidad o de producto detectada en una recepción. */
export function registrarDiscrepancia(datos: DatosDiscrepancia): void {
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
