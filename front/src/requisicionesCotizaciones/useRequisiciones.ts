import { useEffect, useReducer } from "react";

import {
  estadoInicial,
  reducirCompras,
} from "./modeloCompras";

import type { DatosRequisicion } from "./tipos";

const CLAVE_COMPRAS = "erp-compras-estado";

type EstadoCompras = typeof estadoInicial;

const cargarEstado = (
  inicial: EstadoCompras,
): EstadoCompras => {
  try {
    const guardado = localStorage.getItem(CLAVE_COMPRAS);

    if (!guardado) {
      return inicial;
    }

    const datos: unknown = JSON.parse(guardado);

    if (
      typeof datos !== "object" ||
      datos === null ||
      Array.isArray(datos)
    ) {
      return inicial;
    }

    const estado = datos as Partial<EstadoCompras>;

    if (
      !Array.isArray(estado.requisiciones) ||
      !Array.isArray(estado.solicitudes) ||
      !Array.isArray(estado.ofertas)
    ) {
      return inicial;
    }

    return {
      ...inicial,
      requisiciones: estado.requisiciones,
      solicitudes: estado.solicitudes,
      ofertas: estado.ofertas,
      mensaje: "",
    };
  } catch (error) {
    console.error(
      "No se pudo recuperar el estado de compras:",
      error,
    );

    return inicial;
  }
};

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
    cargarEstado,
  );

  // Ocultar el mensaje después de 3,5 segundos.
  useEffect(() => {
    if (!estado.mensaje) return;

    const temporizador = window.setTimeout(() => {
      dispatch({ tipo: "limpiarMensaje" });
    }, 3500);

    return () => {
      window.clearTimeout(temporizador);
    };
  }, [estado, dispatch]);

  // Conservar los datos al recargar la página.
  useEffect(() => {
    try {
      const datos = {
        requisiciones: estado.requisiciones,
        solicitudes: estado.solicitudes,
        ofertas: estado.ofertas,
      };

      localStorage.setItem(
        CLAVE_COMPRAS,
        JSON.stringify(datos),
      );
    } catch (error) {
      console.error(
        "No se pudo guardar el estado de compras:",
        error,
      );
    }
  }, [
    estado.requisiciones,
    estado.solicitudes,
    estado.ofertas,
  ]);

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