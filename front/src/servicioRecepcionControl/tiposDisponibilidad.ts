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

export type EstadoProcesamientoDisponibilidad =
    | "Confirmada"
    | "Rechazada";

export interface ResultadoDisponibilidad {
    correlationId: string;
    recepcionId: number;
    fechaResultado: string;
    estadoProcesamiento: EstadoProcesamientoDisponibilidad;
    motivoRechazo?: string;
}

export interface EventoMercaderiaDisponible {
    idEvento: string;
    tipoEvento: "MercaderiaDisponible";
    correlationId?: string;
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
    resultadoProcesamiento?: ResultadoDisponibilidad;
}
