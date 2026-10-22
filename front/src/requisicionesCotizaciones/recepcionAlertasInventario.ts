import type { AlertaReposicion } from "./tiposAlertasInventario";

/**
 * Simula la recepción asíncrona de una alerta publicada
 * por el sistema de Inventarios.
 *
 * IMPORTANTE:
 * Esta función es una simulación local. No se conecta
 * a un backend ni a un sistema de mensajería real.
 */
export function recibirAlertaAsincronamente(
  alerta: AlertaReposicion,
): Promise<AlertaReposicion> {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      resolve(alerta);
    }, 0);
  });
}
