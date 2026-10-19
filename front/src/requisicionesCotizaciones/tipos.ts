export interface ProductoFormulario {
  id: number; // ID de la fila del formulario, no del producto.
  idProducto: string;
  nombre: string;
  cantidad: string;
  observacion: string;
}

export type Prioridad = "Baja" | "Media" | "Alta";

export type EstadoRequisicion =
  | "Pendiente"
  | "Aprobada"
  | "Anulada";

// Datos capturados por la interfaz.
export interface DatosRequisicion {
  solicitante: string;
  prioridad: Prioridad;
  motivo: string;
  productos: ProductoFormulario[];
}

// Referencia mínima al producto del catálogo.
// No reemplaza la entidad completa de tu módulo de catálogo.
export interface ProductoReferencia {
  idProducto: number;
  descripcion: string;
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
}

export interface SolicitudCotizacion {
  idSolicitud: number;
  requisicion: number;
  fecha: string;
  fechaLimite: string;
  estado: "Generada" | "Enviada" | "Cancelada";

  // Proveedores invitados; todavía no son ofertas recibidas.
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
  detalles: DetalleOferta[];
}