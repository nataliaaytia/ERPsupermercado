import {
  actualizarCompras,
  obtenerCompras,
} from "../../../estado/almacenCompras";
import { conexion } from "../../../servicios/api/configuracion";
import * as api from "./ordenesApi";
import { finalizarOperacion } from "./operacionApi";

import type {
  OrdenCompra,
} from "../tipos";

function validarBorrador(orden: OrdenCompra): void {
  if (orden.estado !== "Borrador") {
    throw new Error(
      "Solo se puede solicitar aprobación de una orden en borrador."
    );
  }

  if (!orden.detalles.length) {
    throw new Error(
      "La orden debe contener al menos un producto."
    );
  }

  const productos = new Set<number>();

  for (const detalle of orden.detalles) {
    if (
      !Number.isSafeInteger(detalle.cantidad) ||
      detalle.cantidad <= 0 ||
      !Number.isFinite(detalle.precio) ||
      detalle.precio <= 0 ||
      !Number.isFinite(detalle.subtotal) ||
      detalle.subtotal < 0
    ) {
      throw new Error(
        "La orden contiene productos con cantidades o importes inválidos."
      );
    }

    if (productos.has(detalle.producto.idProducto)) {
      throw new Error(
        "La orden contiene productos duplicados."
      );
    }

    productos.add(detalle.producto.idProducto);
  }

  const totalCalculado = orden.detalles.reduce(
    (total, detalle) => total + detalle.subtotal,
    0
  );

  if (
    !Number.isFinite(orden.total) ||
    orden.total <= 0 ||
    Math.abs(totalCalculado - orden.total) > 0.01
  ) {
    throw new Error(
      "El total de la orden no coincide con sus productos."
    );
  }
}

export async function solicitarAprobacionOrden(
  idOrden: number,
  usuario: string
): Promise<void> {
  const responsable = usuario.trim();

  if (!responsable) {
    throw new Error(
      "Debes identificar al usuario que solicita la aprobación."
    );
  }

  if (conexion.ordenes) {
    const orden = obtenerCompras().ordenes.find(
      (item) => item.idOrden === idOrden
    );

    if (!orden) {
      throw new Error("No se encontró la orden de compra.");
    }

    validarBorrador(orden);

    const respuesta = await api.solicitarAprobacion(idOrden);
    await finalizarOperacion(
      respuesta?.mensaje ?? "La orden fue enviada a aprobación."
    );
    return;
  }

  actualizarCompras((actual) => {
    const orden = actual.ordenes.find(
      (item) => item.idOrden === idOrden
    );

    if (!orden) {
      throw new Error(
        "No se encontró la orden de compra."
      );
    }

    validarBorrador(orden);

    const fecha = new Date().toISOString();

    return {
      ...actual,
      ordenes: actual.ordenes.map((item) =>
        item.idOrden === idOrden
          ? {
              ...item,
              estado: "Pendiente de aprobación",
              historialEstados: [
                ...(item.historialEstados ?? []),
                {
                  estadoAnterior: "Borrador",
                  estadoNuevo: "Pendiente de aprobación",
                  usuario: responsable,
                  fecha,
                  observacion: "Solicitud de aprobación registrada.",
                },
              ],
            }
          : item
      ),
    };
  });
}
