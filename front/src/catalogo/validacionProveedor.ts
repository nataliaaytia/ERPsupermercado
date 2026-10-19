import type { DatosProveedor } from "./tipos";

export type ErroresProveedor = Partial<Record<keyof DatosProveedor, string>>;

export const normalizarProveedor = (datos: DatosProveedor): DatosProveedor => ({
  nitRuc: datos.nitRuc.trim(),
  razonSocial: datos.razonSocial.trim(),
  direccion: datos.direccion.trim(),
  telefono: datos.telefono.trim(),
  correo: datos.correo.trim().toLowerCase(),
});

export function validarProveedor(
  datos: DatosProveedor,
  nitsExistentes: string[] = [],
): ErroresProveedor {
  const errores: ErroresProveedor = {};
  if (!/^\d+$/.test(datos.nitRuc))
    errores.nitRuc = "Ingresa un NIT/RUC compuesto por números.";
  else if (nitsExistentes.includes(datos.nitRuc))
    errores.nitRuc = "Ya existe un proveedor con este NIT/RUC.";
  if (datos.razonSocial.length < 4)
    errores.razonSocial = "Ingresa una razón social de al menos 4 caracteres.";
  if (datos.direccion.length < 6)
    errores.direccion = "Ingresa una dirección de al menos 6 caracteres.";
  if (
    !/^[+\d\s()-]+$/.test(datos.telefono) ||
    datos.telefono.replace(/\D/g, "").length < 7
  )
    errores.telefono = "Ingresa un teléfono válido con al menos 7 dígitos.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo))
    errores.correo = "Ingresa un correo electrónico válido.";
  return errores;
}
