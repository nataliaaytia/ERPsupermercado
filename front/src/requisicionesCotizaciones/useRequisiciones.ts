import { useCallback, useEffect, useReducer } from "react";

import { estadoInicial } from "./modeloCompras";

import type { AccionCompras, EstadoCompras } from "./modeloCompras";

import { reducirComprasConHistorial } from "./historialRequisiciones";

import type { DatosRequisicion } from "./tipos";

const CLAVE_COMPRAS = "erp-compras-estado";

const cargarEstado = (inicial: EstadoCompras): EstadoCompras => {
  try {
    const guardado = localStorage.getItem(CLAVE_COMPRAS);

    if (!guardado) {
      return inicial;
    }

    const datos: unknown = JSON.parse(guardado);

    if (typeof datos !== "object" || datos === null || Array.isArray(datos)) {
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

    const alertasInventarioGuardadas = Array.isArray(estado.alertasInventario)
      ? estado.alertasInventario
      : [];

    return {
      ...inicial,
      requisiciones: estado.requisiciones,
      solicitudes: estado.solicitudes,
      ofertas: estado.ofertas,
      alertasInventario: alertasInventarioGuardadas,
      mensaje: "",
    };
  } catch (error) {
    console.error("No se pudo recuperar el estado de compras:", error);

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
  const [estado, enviar] = useReducer(
    reducirComprasConHistorial,
    estadoInicial,
    cargarEstado,
  );

  const dispatch = useCallback((accion: AccionCompras) => {
    enviar({
      accion,
      fecha: new Date().toISOString(),
    });
  }, []);

  useEffect(() => {
    if (!estado.mensaje) return;

    const temporizador = window.setTimeout(() => {
      dispatch({
        tipo: "limpiarMensaje",
      });
    }, 3500);

    return () => {
      window.clearTimeout(temporizador);
    };
  }, [estado, dispatch]);

  useEffect(() => {
    try {
      const datos = {
        requisiciones: estado.requisiciones,
        solicitudes: estado.solicitudes,
        ofertas: estado.ofertas,
        alertasInventario: estado.alertasInventario,
      };

      localStorage.setItem(CLAVE_COMPRAS, JSON.stringify(datos));
    } catch (error) {
      console.error("No se pudo guardar el estado de compras:", error);
    }
  }, [
    estado.requisiciones,
    estado.solicitudes,
    estado.ofertas,
    estado.alertasInventario,
  ]);

  return {
    ...estado,
    dispatch,

    registrarRequisicion: (datos: DatosRequisicion) =>
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
