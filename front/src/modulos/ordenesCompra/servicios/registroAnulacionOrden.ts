
import {
  actualizarCompras,
  obtenerCompras,
} from "../../../estado/almacenCompras";
import { conexion } from "../../../servicios/api/configuracion";
import type { OrdenCompra } from "../tipos";
import * as api from "./ordenesApi";
import { finalizarOperacion } from "./operacionApi";

const ESTADOS_ANULABLES = [
  "Borrador",
  "Pendiente de aprobación",
  "Aprobada",
  "Enviada",
  "Confirmada",
  "Rechazada",
];

export function tieneRecepcionRegistrada(
  idOrden: number
): boolean {
  const compras = obtenerCompras();

  return (
    compras.recepcionesRegistradas.some(
      (recepcion) => recepcion.idOrden === idOrden
    ) ||
    compras.recepcionesValidadas.some(
      (recepcion) => recepcion.idOrden === idOrden
    )
  );
}

export function puedeAnularOrden(
  orden: OrdenCompra
): boolean {
  return (
    ESTADOS_ANULABLES.includes(orden.estado) &&
    !orden.anulacion &&
    !tieneRecepcionRegistrada(orden.idOrden)
  );
}

export async function anularOrdenCompra(
  idOrden: number,
  motivo: string
): Promise<void> {
  const motivoLimpio = motivo.trim();

  if (!motivoLimpio) {
    throw new Error(
      "Debes ingresar el motivo de anulación."
    );
  }

  if (conexion.ordenes) {
    const resultado = await api.anular(idOrden, motivoLimpio);
    const sesion = api.usuarioActual();

    // El servidor no permite consultar la anulación: se guarda en el almacén.
    actualizarCompras((actual) => ({
      ...actual,
      ordenes: actual.ordenes.map((item) =>
        item.idOrden === idOrden
          ? {
              ...item,
              anulacion: {
                motivo: resultado?.motivoAnulacion ?? motivoLimpio,
                fecha: resultado?.fechaAnulacion ?? new Date().toISOString(),
                usuario: sesion.nombre || "Comprador",
              },
            }
          : item
      ),
    }));

    await finalizarOperacion(
      `La orden ${resultado?.numero ?? ""} fue anulada.`.replace("  ", " ")
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

    if (
      orden.anulacion ||
      orden.estado === "Anulada"
    ) {
      throw new Error(
        "Esta orden ya fue anulada."
      );
    }

    if (!ESTADOS_ANULABLES.includes(orden.estado)) {
      throw new Error(
        "La orden no se encuentra en un estado anulable."
      );
    }

    const tieneRecepcion =
      actual.recepcionesRegistradas.some(
        (recepcion) => recepcion.idOrden === idOrden
      ) ||
      actual.recepcionesValidadas.some(
        (recepcion) => recepcion.idOrden === idOrden
      );

    if (tieneRecepcion) {
      throw new Error(
        "No se puede anular la orden porque tiene una recepción de mercadería registrada."
      );
    }

    const fecha = new Date().toISOString();
    const usuario = "Comprador";

    return {
      ...actual,
      ordenes: actual.ordenes.map((item) => {
        if (item.idOrden !== idOrden) {
          return item;
        }

        return {
          ...item,
          estado: "Anulada",
          anulacion: {
            motivo: motivoLimpio,
            fecha,
            usuario,
          },
          historialEstados: [
            ...(item.historialEstados ?? []),
            {
              estadoAnterior: item.estado,
              estadoNuevo: "Anulada",
              usuario,
              fecha,
              observacion:
                `Orden anulada. Motivo: ${motivoLimpio}`,
            },
          ],
        };
      }),
    };
  });
}
