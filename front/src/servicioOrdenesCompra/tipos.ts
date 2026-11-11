 // NATALIA - SCRUM 523

import type { ProductoReferencia } from "../requisicionesCotizaciones/tipos";

export interface CompromisoEntrega {
  idCompromiso: number;
  fechaEntrega: string;
  cantidad: number;
  estado: string;
  observacion: string;
}

export interface DetalleOrdenCompra {
  idDetalle: number;
  producto: ProductoReferencia;
  cantidad: number;
  precio: number;
  subtotal: number;
  compromisos?: CompromisoEntrega[];
}

export interface CondicionesLogisticas {
  destino: string;
  horario: string;
  responsableEntrega: string;
}

// SCRUM-522 - Historial de estados de órdenes de compra

export interface HistorialEstadoOrden {
  estadoAnterior: string;
  estadoNuevo: string;
  usuario: string;
  fecha: string;
  observacion: string;
}

// SCRUM-519 - Registro de envíos simulados al proveedor

export type EstadoEnvioOrden = "Exitoso" | "Fallido";

export interface RegistroEnvioOrden {
  idIntento: number;
  fecha: string;
  proveedor: string;
  canal: string;
  estado: EstadoEnvioOrden;
  mensaje: string;
}

// SCRUM-520 - Registro de respuesta del proveedor

export type EstadoRespuestaProveedor =
  | "Confirmada"
  | "Rechazada";

export interface RespuestaProveedor {
  estado: EstadoRespuestaProveedor;
  referencia: string;
  fecha: string;
  observacion: string;
}

export interface OrdenCompra {
  idOrden: number;
  idOfertaOrigen?: number;
  numero: string;
  fecha: string;
  estado: string;
  total: number;
  observacion: string;
  condicionesLogisticas?: CondicionesLogisticas;
  detalles: DetalleOrdenCompra[];

  // SCRUM-522 - Registro cronológico de cambios de estado
  historialEstados?: HistorialEstadoOrden[];

  // SCRUM-519 - Historial de intentos de envío
  historialEnvios?: RegistroEnvioOrden[];

  // SCRUM-520 - Confirmación o rechazo del proveedor
  respuestaProveedor?: RespuestaProveedor;
}

export interface DatosCompromisoEntrega {
  idOrden: number;
  idDetalle: number;
  fechaEntrega: string;
  cantidad: string;
  observacion: string;
}

// SCRUM 525

export interface LineaRecepcionValidada {
  idDetalleOrden: number;
  cantidadRecibida: number;
  cantidadAceptada: number;
}

export interface RecepcionValidada {
  idRecepcion: number;
  idOrden: number;
  estado: "Validada";
  detalles: LineaRecepcionValidada[];
  fechaValidacion?: string;
  esEjemplo?: boolean;
}
