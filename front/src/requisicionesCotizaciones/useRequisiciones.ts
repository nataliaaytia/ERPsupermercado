import { useState } from "react";
import type { DatosRequisicion, Requisicion } from "./tipos";

export function useRequisiciones() {
  const [requisiciones, setRequisiciones] = useState<Requisicion[]>([]);

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

  return { requisiciones, registrarRequisicion };
}
