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

/** Discrepancia ya registrada en el sistema. */
export type Discrepancia = DatosDiscrepancia & {
    idDiscrepancia: number;
    idOrden: number;
    fechaRegistro: string;
};
