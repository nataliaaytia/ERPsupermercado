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

export interface IntentoPublicacionDisponibilidad {
    numero: number;
    fechaIntento: string;
    resultado: "En curso" | "Publicado" | "Error";
    mensaje?: string;
    referenciaPublicacion?: string;
}

export interface EventoMercaderiaDisponible {
    idEvento: string;
    tipoEvento: "MercaderiaDisponible";
    idRecepcion: number;
    idOrden: number;
    fechaValidacion: string | null;
    fechaConfirmacionDisponibilidad: string;
    detalles: LineaMercaderiaDisponible[];
    estadoPublicacion: EstadoPublicacionDisponibilidad;
    intentosPublicacion?: IntentoPublicacionDisponibilidad[];
    fechaUltimoIntento?: string;
    referenciaPublicacion?: string;
    errorPublicacion?: string;
}
