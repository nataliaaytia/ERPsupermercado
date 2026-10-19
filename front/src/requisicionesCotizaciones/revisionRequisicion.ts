import type { Requisicion, ResultadoValidacion } from "./tipos";

export function revisarRequisicion(
  requisicion: Requisicion,
): ResultadoValidacion {
  const errores: string[] = [];
  const advertencias: string[] = [];

  if (requisicion.productos.length === 0)
    errores.push("La requisición no tiene productos.");

  const vistos = new Set<string>();
  requisicion.productos.forEach((producto, indice) => {
    const numero = indice + 1;
    const nombre = producto.nombre.trim().toLowerCase();

    if (nombre.length < 3)
      errores.push(`Producto ${numero}: falta el nombre (mínimo 3 letras).`);
    else if (vistos.has(nombre))
      errores.push(`Producto ${numero}: "${producto.nombre}" está repetido.`);
    vistos.add(nombre);

    if (!Number.isInteger(producto.cantidad) || producto.cantidad < 1)
      errores.push(
        `Producto ${numero}: la cantidad debe ser un número entero mayor a 0.`,
      );
    else if (producto.cantidad > 1000)
      advertencias.push(
        `Producto ${numero}: la cantidad (${producto.cantidad}) es muy alta, confirma que es correcta.`,
      );
  });

  const motivo = requisicion.motivo.trim();
  if (motivo.length < 10)
    errores.push("El motivo debe tener al menos 10 caracteres.");
  else if (motivo.length < 25)
    advertencias.push("El motivo es muy corto, conviene explicarlo mejor.");

  if (requisicion.productos.length > 10)
    advertencias.push("La requisición tiene más de 10 productos.");

  return { errores, advertencias };
}
