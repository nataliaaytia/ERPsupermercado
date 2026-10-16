
export interface SolicitudCotizacion {
  id: string;
  descripcion: string;
}

export const cotizacionesEjemplo: SolicitudCotizacion[] = [
  {
    id: "COT-0001",
    descripcion: "Adquisición de productos de limpieza",
  },
  {
    id: "COT-0002",
    descripcion: "Reposición de productos de abarrotes",
  },
];
