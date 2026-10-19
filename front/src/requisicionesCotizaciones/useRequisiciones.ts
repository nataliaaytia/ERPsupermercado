import { useReducer } from "react";
import {
  estadoInicial,
  reducirCompras,
} from "./modeloCompras";
import type { DatosRequisicion } from "./tipos";

export const fechaHoy = () => {
  const d = new Date();

  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
};

export function useRequisiciones() {
  const [estado, dispatch] = useReducer(
    reducirCompras,
    estadoInicial,
  );

  return {
    ...estado,
    dispatch,

    registrarRequisicion: (
      datos: DatosRequisicion,
    ) =>
      dispatch({
        tipo: "crear",
        datos,
        hoy: fechaHoy(),
      }),

    validar: (id: number) =>
      dispatch({
        tipo: "aprobar",
        id,
      }),

    anular: (id: number) =>
      dispatch({
        tipo: "anular",
        id,
      }),
  };
}