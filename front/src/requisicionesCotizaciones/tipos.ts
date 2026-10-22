
export interface ProductoFormulario {
  id: number;
  nombre: string;
  cantidad: string;
  observacion: string;
}

export type Prioridad = "Baja" | "Media" | "Alta";

export interface ProductoReferencia {
  idProducto: number;
  descripcion: string;
}

export type EstadoRequisicion =
  | "Pendiente"
  | "Aprobada"
  | "Anulada"
  | "Cancelada";

export interface DatosRequisicion {
  solicitante: string;
  prioridad: Prioridad;
  motivo: string;
  productos: ProductoFormulario[];
}

export interface DetalleRequisicion {
  idDetalle: number;
  producto: ProductoReferencia;
  cantidad: number;
  observacion: string;
}

export interface ResultadoValidacion {
  errores: string[];
  advertencias: string[];
}

export interface Requisicion {
  idRequisicion: number;
  fecha: string;
  prioridad: Prioridad;
  estado: EstadoRequisicion;
  solicitante: string;
  observacion: string;
  detalles: DetalleRequisicion[];
  validacion?: ResultadoValidacion;
  historial?: RegistroHistorialRequisicion[];
}

export interface SolicitudCotizacion {
  idSolicitud: number;
  requisicion: number;
  fecha: string;
  fechaLimite: string;
  estado: "Generada" | "Enviada" | "Cerrada" | "Cancelada";
  proveedoresIds: number[];
}

export interface ProveedorReferencia {
  idProveedor: number;
  razonSocial: string;
  nitRuc: string;
  estado: string;
}

export interface DetalleOferta {
  idDetalle: number;
  producto: ProductoReferencia;
  precio: number;
  plazoEntrega: number;
}

export interface OfertaProveedor {
  idOferta: number;
  proveedor: ProveedorReferencia;
  solicitud: number;
  fecha: string;
  validez: string;
  estado: "Registrada" | "Seleccionada" | "Rechazada";
  descuento: number;
  condicionesEntrega: string;
  detalles: DetalleOferta[];
}

export interface CambioHistorialRequisicion {
  campo: string;
  anterior: string;
  actual: string;
}

export interface RegistroHistorialRequisicion {
  idRegistro: number;
  fecha: string;
  accion: string;
  cambios: CambioHistorialRequisicion[];
}
