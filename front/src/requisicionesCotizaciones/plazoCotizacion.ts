
export type EstadoPlazo =
  | "abierta"
  | "proxima"
  | "ultimo-dia"
  | "vencida";

export interface ResultadoPlazoCotizacion {
  estado: EstadoPlazo;
  diasRestantes: number;
  puedeRegistrar: boolean;
}

function convertirFechaUTC(fecha: string): number {
  const [anio, mes, dia] = fecha.slice(0, 10).split("-").map(Number);
  return Date.UTC(anio, mes - 1, dia);
}

export function calcularPlazoCotizacion(
  fechaLimite: string,
  hoy: string,
): ResultadoPlazoCotizacion {
  const diferencia =
    convertirFechaUTC(fechaLimite) - convertirFechaUTC(hoy);

  const diasRestantes = Math.round(diferencia / 86400000);

  if (diasRestantes < 0) {
    return {
      estado: "vencida",
      diasRestantes: 0,
      puedeRegistrar: false,
    };
  }

  if (diasRestantes === 0) {
    return {
      estado: "ultimo-dia",
      diasRestantes: 0,
      puedeRegistrar: true,
    };
  }

  if (diasRestantes <= 2) {
    return {
      estado: "proxima",
      diasRestantes,
      puedeRegistrar: true,
    };
  }

  return {
    estado: "abierta",
    diasRestantes,
    puedeRegistrar: true,
  };
}

export function formatearFechaCotizacion(fecha: string): string {
  const [anio, mes, dia] = fecha.slice(0, 10).split("-");
  return `${dia}/${mes}/${anio}`;
}
