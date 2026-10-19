import type { DatosRequisicion } from "./tipos";

export interface ErroresProducto {
  nombre?: string;
  cantidad?: string;
}

export interface ErroresRequisicion {
  productos: Record<number, ErroresProducto>;
  motivo?: string;
  general?: string;
}

export const hayErrores = (errores: ErroresRequisicion) =>
  Boolean(
    errores.general || errores.motivo || Object.keys(errores.productos).length,
  );

export function validarRequisicion(datos: DatosRequisicion): ErroresRequisicion {
  const errores: ErroresRequisicion = { productos: {} };
  if (datos.productos.length === 0)
    errores.general = "Agrega al menos un producto.";

  const vistos = new Set<string>();
  datos.productos.forEach((producto) => {
    const error: ErroresProducto = {};
    const nombre = producto.nombre.trim().toLowerCase();
    if (nombre.length < 3)
      error.nombre = "Escribe el nombre del producto (mínimo 3 letras).";
    else if (vistos.has(nombre))
      error.nombre = "Este producto ya está en la lista.";
    vistos.add(nombre);

    const texto = producto.cantidad.trim();
    const cantidad = Number(texto);
    if (!/^\d+$/.test(texto) || cantidad < 1)
      error.cantidad = "Ingresa una cantidad entera mayor a 0.";
    else if (cantidad > 10000) error.cantidad = "La cantidad máxima es 10000.";

    if (error.nombre || error.cantidad) errores.productos[producto.id] = error;
  });

  const motivo = datos.motivo.trim();
  if (motivo.length < 10)
    errores.motivo = "Explica el motivo en al menos 10 caracteres.";
  else if (motivo.length > 300)
    errores.motivo = "El motivo puede tener máximo 300 caracteres.";

  return errores;
}
