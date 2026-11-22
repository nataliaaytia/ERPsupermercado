/** Fecha local de hoy en formato YYYY-MM-DD. */
export function fechaHoy(): string {
  const fecha = new Date();
  return [
    fecha.getFullYear(),
    String(fecha.getMonth() + 1).padStart(2, '0'),
    String(fecha.getDate()).padStart(2, '0'),
  ].join('-');
}

/** Suma días a una fecha YYYY-MM-DD y devuelve el mismo formato. */
export function sumarDias(fecha: string, dias: number): string {
  const resultado = new Date(`${fecha}T12:00:00`);
  resultado.setDate(resultado.getDate() + dias);
  return [
    resultado.getFullYear(),
    String(resultado.getMonth() + 1).padStart(2, '0'),
    String(resultado.getDate()).padStart(2, '0'),
  ].join('-');
}

const formatoFecha = new Intl.DateTimeFormat('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' });
const formatoFechaHora = new Intl.DateTimeFormat('es-BO', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

/** Muestra una fecha (YYYY-MM-DD o ISO) como dd/mm/aaaa. */
export function formatearFecha(valor: string): string {
  const fecha = new Date(valor.length === 10 ? `${valor}T12:00:00` : valor);
  return Number.isNaN(fecha.getTime()) ? valor : formatoFecha.format(fecha);
}

export function formatearFechaHora(valor: string): string {
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime()) ? valor : formatoFechaHora.format(fecha);
}
