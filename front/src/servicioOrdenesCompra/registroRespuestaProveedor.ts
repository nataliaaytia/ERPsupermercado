
import { actualizarCompras } from "../requisicionesCotizaciones/almacenCompras";
import type {
  EstadoRespuestaProveedor,
  RespuestaProveedor,
} from "./tipos";

interface DatosRespuestaProveedor {
  idOrden: number;
  estado: EstadoRespuestaProveedor;
  referencia: string;
  fecha: string;
  observacion: string;
}

export function registrarRespuestaProveedor({
  idOrden,
  estado,
  referencia,
  fecha,
  observacion,
}: DatosRespuestaProveedor): void {
  const referenciaLimpia = referencia.trim();
  const observacionLimpia = observacion.trim();

  if (estado !== "Confirmada" && estado !== "Rechazada") {
    throw new Error("La respuesta del proveedor no es válida.");
  }

  if (!referenciaLimpia) {
    throw new Error("La referencia del proveedor es obligatoria.");
  }

  if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    throw new Error("Debes ingresar una fecha válida.");
  }

  const fechaSeleccionada = new Date(`${fecha}T12:00:00`);

  if (
    Number.isNaN(fechaSeleccionada.getTime()) ||
    [
      fechaSeleccionada.getFullYear(),
      String(fechaSeleccionada.getMonth() + 1).padStart(2, "0"),
      String(fechaSeleccionada.getDate()).padStart(2, "0"),
    ].join("-") !== fecha
  ) {
    throw new Error("La fecha ingresada no es válida.");
  }

  const hoy = new Date();
  hoy.setHours(23, 59, 59, 999);

  if (fechaSeleccionada > hoy) {
    throw new Error("La fecha de respuesta no puede ser futura.");
  }

  actualizarCompras((actual) => {
    const orden = actual.ordenes.find(
      (item) => item.idOrden === idOrden
    );

    if (!orden) {
      throw new Error("No se encontró la orden de compra.");
    }

    if (orden.respuestaProveedor) {
      throw new Error(
        "Esta orden ya tiene una respuesta registrada. No se permiten respuestas duplicadas."
      );
    }

    if (orden.estado !== "Enviada") {
      throw new Error(
        "Solo se puede registrar una respuesta para una orden enviada."
      );
    }

    const respuesta: RespuestaProveedor = {
      estado,
      referencia: referenciaLimpia,
      fecha,
      observacion: observacionLimpia,
    };

    return {
      ...actual,
      ordenes: actual.ordenes.map((item) => {
        if (item.idOrden !== idOrden) {
          return item;
        }

        return {
          ...item,
          estado,
          respuestaProveedor: respuesta,
          historialEstados: [
            ...(item.historialEstados ?? []),
            {
              estadoAnterior: "Enviada",
              estadoNuevo: estado,
              usuario: "Comprador",
              fecha: new Date().toISOString(),
              observacion:
                `Respuesta del proveedor registrada. ` +
                `Referencia: ${referenciaLimpia}. ` +
                `Fecha de respuesta: ${fecha}.` +
                (observacionLimpia
                  ? ` Observación: ${observacionLimpia}`
                  : ""),
            },
          ],
        };
      }),
    };
  });
}
