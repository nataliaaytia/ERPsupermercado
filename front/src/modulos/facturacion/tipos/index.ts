export type EstadoFactura =
  | 'Registrada'
  | 'Validada'
  | 'Con inconsistencias'
  | 'Enviada a pagos'
  | 'Rechazada';

export interface DetalleFactura {
  idDetalleOrden: number;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

/** Comparación de una línea: orden de compra vs. recepción vs. factura. */
export interface LineaMatching {
  idDetalleOrden: number;
  descripcion: string;
  cantidadOrdenada: number;
  cantidadAceptada: number;
  cantidadFacturada: number;
  precioOrden: number;
  precioFacturado: number;
  conforme: boolean;
  observacion: string;
}

export interface ResultadoMatching {
  fecha: string;
  conforme: boolean;
  totalOrden: number;
  totalFacturado: number;
  lineas: LineaMatching[];
  observaciones: string[];
}

export interface Factura {
  idFactura: number;
  numeroFactura: string;
  idOrden: number;
  idProveedor: number;
  razonSocialProveedor: string;
  nitProveedor: string;
  fechaEmision: string;
  fechaRegistro: string;
  condicionPago: string;
  detalles: DetalleFactura[];
  total: number;
  estado: EstadoFactura;
  resultadoMatching?: ResultadoMatching;
  fechaVencimiento?: string;
  fechaEnvioPagos?: string;
}

export interface DatosRegistroFactura {
  numeroFactura: string;
  idOrden: number;
  fechaEmision: string;
  condicionPago: string;
  detalles: { idDetalleOrden: number; cantidad: string; precioUnitario: string }[];
}
