
import { actualizarCompras } from "../requisicionesCotizaciones/almacenCompras";

export function devolverOrdenParaCorreccion(
  idOrden: number,
  motivo: string,
  usuario: string
): void {
  const observacion = motivo.trim();
  const responsable = usuario.trim();

  if (!observacion) {
    throw new Error("Debes ingresar un motivo de devolución.");
  }

  if (!responsable) {
    throw new Error("Debes identificar al usuario que realiza la devolución.");
  }

  actualizarCompras((actual) => {
    const orden = actual.ordenes.find(
      (item) => item.idOrden === idOrden
    );

    if (!orden) {
      throw new Error("No se encontró la orden de compra.");
    }

    if (orden.estado !== "Pendiente de aprobación") {
      throw new Error(
        "Solo se pueden devolver órdenes pendientes de aprobación."
      );
    }

    const fecha = new Date().toISOString();

    return {
      ...actual,
      ordenes: actual.ordenes.map((item) =>
        item.idOrden === idOrden
          ? {
              ...item,
              estado: "Borrador",
              historialEstados: [
                ...(item.historialEstados ?? []),
                {
                  estadoAnterior: "Pendiente de aprobación",
                  estadoNuevo: "Borrador",
                  usuario: responsable,
                  fecha,
                  observacion,
                },
              ],
            }
          : item
      ),
    };
  });
}
