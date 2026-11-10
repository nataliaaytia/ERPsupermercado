export interface LineaMercaderiaDisponible {
    idDetalleOrden: number;
    producto: string;
    cantidadAceptada: number;
    cantidadDisponible: number;
}

export type EstadoPublicacionDisponibilidad =
    | "Pendiente de configuración"
    | "Pendiente"
    | "Publicando"
    | "Publicado"
    | "Error";

export interface EventoMercaderiaDisponible {
    idEvento: string;
    tipoEvento: "MercaderiaDisponible";
    idRecepcion: number;
    idOrden: number;
    fechaValidacion: string | null;
    fechaConfirmacionDisponibilidad: string;
    detalles: LineaMercaderiaDisponible[];
    estadoPublicacion: EstadoPublicacionDisponibilidad;
    referenciaPublicacion?: string;
    errorPublicacion?: string;
}
