export interface DatosDiscrepanciaBase {
    idRecepcion: number;
    idDetalleOrden: number;
    descripcion: string;
}

export interface DiscrepanciaCantidad extends DatosDiscrepanciaBase {
    tipo: "cantidad";
    cantidadDiscrepante: number;
}

export interface DiscrepanciaProducto extends DatosDiscrepanciaBase {
    tipo: "producto";
    productoRecibido: string;
}

export type DatosDiscrepancia =
    | DiscrepanciaCantidad
    | DiscrepanciaProducto;
