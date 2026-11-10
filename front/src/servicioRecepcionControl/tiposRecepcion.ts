//natalia scrum 528
export interface DetalleRecepcion {
    idDetalleOrden: number;
    cantidadRecibida: number;
}

export type EstadoRecepcion =
    | "Pendiente de inspección"
    | "En inspección"
    | "Validada";

export interface RecepcionRegistrada {
    idRecepcion: number;
    idOrden: number;
    fecha: string;
    documento: string;
    estado: EstadoRecepcion;
    detalles: DetalleRecepcion[];
    responsableCorreccion?: string;
    fechaCorreccion?: string;
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