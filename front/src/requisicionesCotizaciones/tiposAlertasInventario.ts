
export interface AlertaReposicion {
  idEvento: string;
  idProducto: number;
  nombreProducto: string;
  cantidadActual: number;
  stockMinimo: number;
  cantidadSugerida: number;
  fechaPublicacion: string;
}

export interface RegistroRecepcionAlerta {
  idEvento: string;
  idProducto: number;
  nombreProducto: string;
  cantidadActual: number;
  stockMinimo: number;
  cantidadSugerida: number;
  fechaPublicacion: string;
  fechaRecepcion: string;
  estado: "Recibida" | "Procesada" | "Rechazada";
  mensaje: string;
}
export interface RegistroProcesamientoCompra {
  idEvento: string;
  idProducto: number;
  nombreProducto: string;
  fechaIntento: string;
  resultado: "Procesado" | "Duplicado" | "Rechazado";
  mensaje: string;
  idRequisicion?: number;
}
