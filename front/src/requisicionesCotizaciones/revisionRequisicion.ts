import type {
  Requisicion,
  ResultadoValidacion,
} from "./tipos";

export function revisarRequisicion(
  r: Requisicion,
): ResultadoValidacion {
  const errores: string[] = [];
  const advertencias: string[] = [];

  if (!r.solicitante.trim()) {
    errores.push("Falta el solicitante.");
  }

  if (!["Baja", "Media", "Alta"].includes(r.prioridad)) {
    errores.push("Prioridad inválida.");
  }

  if (!r.detalles.length) {
    errores.push("Agrega al menos un producto.");
  }

  const vistos = new Set<number>();

  r.detalles.forEach((d, i) => {
    if (
      !Number.isSafeInteger(d.producto.idProducto) ||
      d.producto.idProducto < 1
    ) {
      errores.push(`Producto ${i + 1}: ID inválido.`);
    }

    if (vistos.has(d.producto.idProducto)) {
      errores.push(`Producto ${i + 1}: ID repetido.`);
    }

    vistos.add(d.producto.idProducto);

    if (d.producto.descripcion.trim().length < 3) {
      errores.push(`Producto ${i + 1}: nombre inválido.`);
    }

    if (
      !Number.isSafeInteger(d.cantidad) ||
      d.cantidad < 1 ||
      d.cantidad > 10000
    ) {
      errores.push(
        `Producto ${i + 1}: cantidad entre 1 y 10000.`,
      );
    } else if (d.cantidad > 1000) {
      advertencias.push(
        `Producto ${i + 1}: confirma la cantidad ${d.cantidad}.`,
      );
    }
  });

  const observacion = r.observacion.trim();

  if (
    observacion.length < 10 ||
    observacion.length > 300
  ) {
    errores.push(
      "La observación debe tener entre 10 y 300 caracteres.",
    );
  } else if (observacion.length < 25) {
    advertencias.push(
      "Conviene explicar mejor la observación.",
    );
  }

  return { errores, advertencias };
}