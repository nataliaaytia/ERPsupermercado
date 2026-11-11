import { useEffect, useSyncExternalStore } from "react";
import type { DatosRequisicion } from "./tipos";
import {
  despacharCompras,
  fechaHoy,
  obtenerCompras,
  suscribirCompras,
} from "./almacenCompras";

export { fechaHoy } from "./almacenCompras";

export function useRequisiciones() {
  const estado = useSyncExternalStore(
    suscribirCompras,
    obtenerCompras,
  );

  useEffect(() => {
    if (!estado.mensaje || estado.errorCarga) return;

    const temporizador = window.setTimeout(() => {
      despacharCompras({ tipo: "limpiarMensaje" });
    }, 3500);

    return () => window.clearTimeout(temporizador);
  }, [estado.mensaje, estado.errorCarga]);

  return {
    ...estado,
    dispatch: despacharCompras,

    registrarRequisicion: (datos: DatosRequisicion) =>
      despacharCompras({
        tipo: "crear",
        datos,
        hoy: fechaHoy(),
      }),

    validar: (id: number) =>
      despacharCompras({
        tipo: "aprobar",
        id,
      }),

    anular: (id: number) =>
      despacharCompras({
        tipo: "anular",
        id,
      }),
  };
}