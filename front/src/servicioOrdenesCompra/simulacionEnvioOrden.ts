
import { actualizarCompras } from "../requisicionesCotizaciones/almacenCompras";
import type {
  OrdenCompra,
  RegistroEnvioOrden,
} from "./tipos";

// SCRUM-519 / SCRUM-570
// Simulación local: no se envían correos ni documentos reales.

export type ResultadoSimulacionEnvio = "Exitoso" | "Fallido";

export interface DatosSimulacionEnvio {
  idOrden: number;
  proveedor: string;
  canal: string;
  resultado: ResultadoSimulacionEnvio;
}

export function simularEnvioOrden(
  datos: DatosSimulacionEnvio
): RegistroEnvioOrden {
  const proveedor = datos.proveedor.trim();
  const canal = datos.canal.trim();

  if (!proveedor || proveedor === "No disponible") {
    throw new Error("La orden no tiene un proveedor válido.");
  }

  if (!canal) {
    throw new Error("Debes seleccionar un canal de envío.");
  }

  if (
    datos.resultado !== "Exitoso" &&
    datos.resultado !== "Fallido"
  ) {
    throw new Error("El resultado de la simulación no es válido.");
  }

  let registroCreado: RegistroEnvioOrden | null = null;

  actualizarCompras((actual) => {
    const orden = actual.ordenes.find(
      (item: OrdenCompra) => item.idOrden === datos.idOrden
    );

    if (!orden) {
      throw new Error("No se encontró la orden de compra.");
    }

    const historial = orden.historialEnvios ?? [];

    // Evitar duplicar envíos exitosos.
    if (
      historial.some(
        (intento) => intento.estado === "Exitoso"
      )
    ) {
      throw new Error(
        "Esta orden ya tiene un envío exitoso. No se permite duplicarlo."
      );
    }

    if (orden.estado !== "Aprobada") {
      throw new Error(
        "Solo se pueden enviar órdenes aprobadas."
      );
    }

    const idIntento =
      historial.reduce(
        (maximo, intento) =>
          Math.max(maximo, intento.idIntento),
        0
      ) + 1;

    const fecha = new Date().toISOString();
    const envioExitoso = datos.resultado === "Exitoso";

    const nuevoRegistro: RegistroEnvioOrden = {
      idIntento,
      fecha,
      proveedor,
      canal,
      estado: datos.resultado,
      mensaje: envioExitoso
        ? "Envío simulado correctamente. No se realizó un envío real."
        : "El envío simulado falló. Puedes volver a intentarlo.",
    };

    registroCreado = nuevoRegistro;

    return {
      ...actual,
      ordenes: actual.ordenes.map((item: OrdenCompra) =>
        item.idOrden === orden.idOrden
          ? {
              ...item,

              // Guardar el historial de intentos.
              historialEnvios: [
                ...historial,
                nuevoRegistro,
              ],

              // Solo un envío exitoso cambia el estado.
              estado: envioExitoso
                ? "Enviada"
                : item.estado,

              // Registrar el cambio de estado.
              historialEstados: envioExitoso
                ? [
                    ...(item.historialEstados ?? []),
                    {
                      estadoAnterior: item.estado,
                      estadoNuevo: "Enviada",
                      usuario: "Comprador",
                      fecha,
                      observacion:
                        `Envío simulado exitoso al proveedor ${proveedor} ` +
                        `mediante ${canal}.`,
                    },
                  ]
                : item.historialEstados,
            }
          : item
      ),
    };
  });

  if (!registroCreado) {
    throw new Error(
      "No se pudo registrar la simulación del envío."
    );
  }

  return registroCreado;
}