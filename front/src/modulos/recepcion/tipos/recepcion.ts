//natalia scrum 528
export interface DetalleRecepcion {
    idDetalleOrden: number;
    cantidadRecibida: number;
    /** Identificador de la línea en el servidor (solo con la conexión activa). */
    idDetalleRecepcion?: number;
    /** Producto de la línea en el servidor (solo con la conexión activa). */
    productoId?: number;
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
    /** Datos que solo existen con la conexión activa. */
    almacen?: string;
    observacion?: string;
    estadoServidor?: string;
}

export interface DatosRecepcion {
    idOrden: number;
    fecha: string;
    documento: string;
    detalles: {
        idDetalleOrden: number;
        cantidad: string;
    }[];
    /** Almacén de destino (lo exige el servidor con la conexión activa). */
    almacen?: string;
    observacion?: string;
}

export interface DatosCorreccionRecepcion
    extends Omit<DatosRecepcion, "idOrden"> {
    responsable: string;
}