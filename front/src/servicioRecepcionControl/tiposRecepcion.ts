//natalia scrum 528
export interface DetalleRecepcion {
    idDetalleOrden: number;
    cantidadRecibida: number;
}

export type EstadoRecepcion =
    | "Pendiente de inspección"
    | "En inspección"
    | "Validada";

export interface CostoTransporte {
    importeCentavos: number;
    concepto: string;
    comprobante: string;
}

export interface RecepcionRegistrada {
    idRecepcion: number;
    idOrden: number;
    fecha: string;
    documento: string;
    estado: EstadoRecepcion;
    detalles: DetalleRecepcion[];
    responsableCorreccion?: string;
    fechaCorreccion?: string;
    costoTransporte?: CostoTransporte;
}

export interface DatosRecepcion {
    idOrden: number;
    fecha: string;
    documento: string;
    detalles: {
        idDetalleOrden: number;
        cantidad: string;
    }[];
}

export interface DatosCorreccionRecepcion
    extends Omit<DatosRecepcion, "idOrden"> {
    responsable: string;
}