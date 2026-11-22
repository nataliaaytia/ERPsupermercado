export interface DetalleInspeccionCalidad {
    idDetalleOrden: number;
    cantidadRecibida: number;
    cantidadConforme: number;
    cantidadRechazada: number;
    motivoRechazo?: string;
}

export interface InspeccionCalidadRecepcion {
    idInspeccion: number;
    idRecepcion: number;
    idOrden: number;
    fechaInspeccion: string;
    detalles: DetalleInspeccionCalidad[];
}

export interface DatosInspeccionCalidad {
    idRecepcion: number;
    detalles: {
        idDetalleOrden: number;
        cantidadConforme: number;
        cantidadRechazada: number;
        motivoRechazo?: string;
    }[];
}
