import { useState } from "react";
import type { DatosRequisicion, Requisicion } from "./tipos";
import { revisarRequisicion } from "./revisionRequisicion";
import { requisicionesEjemplo } from "./requisicionesEjemplo";

export function useRequisiciones() {
  const [requisiciones, setRequisiciones] =
    useState<Requisicion[]>(requisicionesEjemplo);

  const registrarRequisicion = (datos: DatosRequisicion): Requisicion => {
    const nueva: Requisicion = {
      id: `REQ-${String(requisiciones.length + 1).padStart(4, "0")}`,
      fecha: new Date().toLocaleDateString("es-BO"),
      productos: datos.productos.map((producto) => ({
        nombre: producto.nombre.trim(),
        cantidad: Number(producto.cantidad),
      })),
      motivo: datos.motivo.trim(),
      estado: "Pendiente",
    };
    setRequisiciones((actuales) => [nueva, ...actuales]);
    return nueva;
  };

  const validar = (id: string) => {
    setRequisiciones((actuales) =>
      actuales.map((requisicion) => {
        if (requisicion.id !== id) return requisicion;
        const validacion = revisarRequisicion(requisicion);
        return {
          ...requisicion,
          validacion,
          estado: validacion.errores.length > 0 ? "Rechazada" : "Validada",
        };
      }),
    );
  };

  return { requisiciones, registrarRequisicion, validar };
}
