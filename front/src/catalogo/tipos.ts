export type EstadoProveedor = "Activo" | "Inactivo" | "Pendiente" | "Observado";
export interface Documento {
  idDocumento: number;
  tipoDocumento: string;
  numeroDocumento: string;
  fechaVencimiento: string;
  archivo: string;
  estadoValidacion: "Válido" | "Vencido" | "Pendiente";
}
export interface ProductoCatalogo {
  idProducto: number;
  sku: string;
  nombre: string;
  categoria: string;
  descripcion: string;
  precioPactado: number;
  tiempoEntregaEstimado: string;
  stockDisponible: number;
  unidadMedida: string;
}
export interface DescuentoVolumen {
  cantidadMinima: number;
  descuento: number;
}
export interface Proveedor {
  idProveedor: number;
  nitRuc: string;
  razonSocial: string;
  direccion: string;
  telefono: string;
  correo: string;
  estado: EstadoProveedor;
  puntajeDesempeno: number;
  ordenesCompra: number;
  montoTotalComprado: number;
  documentos: Documento[];
  catalogoProductos: ProductoCatalogo[];
  descuentoVolumen: DescuentoVolumen[];
  tiempoPromedioDias: number;
}
export interface HistoricoEntrega {
  mes: string;
  diasEntrega: number;
}
export interface HistoricoProveedorEntrega {
  idProveedor: number;
  sku: string;
  historico: HistoricoEntrega[];
}
export type DatosProveedor = Pick<
  Proveedor,
  "nitRuc" | "razonSocial" | "direccion" | "telefono" | "correo"
>;
