export type TipoResolucionDevolucion = "retiro" | "reposicion";

export interface ResolucionDevolucion {
    idDevolucion: string;
    tipo: TipoResolucionDevolucion;
    evidencia: string;
    fechaRegistro: string;
}

export interface DevolucionSeguimiento {
    idDevolucion: string;
    idRecepcion: number;
    idOrden: number;
    idDetalleOrden: number;
    documentoRecepcion: string;
    fechaRecepcion: string;
    numeroOrden: string;
    producto: string;
    cantidadDevuelta: number;
    proveedor: string;
    resolucion?: ResolucionDevolucion;
}
