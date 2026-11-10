//natalia scrum 528

export interface DetalleRecepcion {
    idDetalleOrden: number;
    cantidadRecibida: number;
}

export interface RecepcionRegistrada {
    idRecepcion: number;
    idOrden: number;
    fecha: string;
    documento: string;
    estado: "Pendiente de inspección";
    detalles: DetalleRecepcion[];
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