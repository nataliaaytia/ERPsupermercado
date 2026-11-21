const formatoMoneda = new Intl.NumberFormat('es-BO', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Importe en bolivianos, p. ej. "Bs 1.250,50". */
export function moneda(valor: number): string {
  return `Bs ${formatoMoneda.format(valor)}`;
}

/** Redondea a 2 decimales evitando errores de coma flotante. */
export function redondear(valor: number): number {
  return Math.round((valor + Number.EPSILON) * 100) / 100;
}

/** Código con prefijo y ceros a la izquierda, p. ej. codigo('REQ', 7) → "REQ-0007". */
export function codigo(prefijo: string, id: number): string {
  return `${prefijo}-${String(id).padStart(4, '0')}`;
}
