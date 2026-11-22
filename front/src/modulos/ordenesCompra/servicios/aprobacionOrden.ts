
import {
  actualizarCompras,
  obtenerCompras,
} from "../../../estado/almacenCompras";
import { conexion } from "../../../servicios/api/configuracion";
import * as api from "./ordenesApi";
import { finalizarOperacion } from "./operacionApi";

// Aprobar una orden pendiente y registrar el cambio de estado.
export async function aprobarOrdenCompra(idOrden: number): Promise<void> {
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

  if (conexion.ordenes) {
    const usuario = api.usuarioActual().usuario;

    if (!usuario) {
      throw new Error("Inicia sesión para aprobar la orden.");
    }

    await api.aprobar(idOrden, usuario);
    await finalizarOperacion(`La orden ${orden.numero} fue aprobada.`);
    return;
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
