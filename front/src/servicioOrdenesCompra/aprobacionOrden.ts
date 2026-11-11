
import {
  actualizarCompras,
  obtenerCompras,
} from "../requisicionesCotizaciones/almacenCompras";

// Aprobar una orden pendiente y registrar el cambio de estado.
export function aprobarOrdenCompra(idOrden: number): void {
  const estadoActual = obtenerCompras();

  if (estadoActual.errorCarga) {
    throw new Error(estadoActual.errorCarga);
  }

  const orden = estadoActual.ordenes.find(
    (item) => item.idOrden === idOrden
  );

  if (!orden) {
    throw new Error("No se encontró la orden de compra.");
  }

  if (orden.estado !== "Pendiente de aprobación") {
    throw new Error(
      "Solo se pueden aprobar órdenes pendientes de aprobación."
    );
  }

  if (!orden.detalles.length) {
    throw new Error(
      "No se puede aprobar una orden sin productos."
    );
  }

  actualizarCompras((actual) => ({
    ...actual,
    ordenes: actual.ordenes.map((item) =>
      item.idOrden === idOrden
        ? {
            ...item,
            estado: "Aprobada",
            historialEstados: [
              ...(item.historialEstados ?? []),
              {
                estadoAnterior: item.estado,
                estadoNuevo: "Aprobada",
                usuario: "Jefe de compras",
                fecha: new Date().toISOString(),
                observacion: "Orden aprobada para envío al proveedor.",
              },
            ],
          }
        : item
    ),
  }));
}
