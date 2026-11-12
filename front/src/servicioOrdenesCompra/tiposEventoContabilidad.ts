export type EstadoPublicacionContabilidad =
    | "Pendiente de configuración"
    | "Pendiente"
    | "Publicando"
    | "Publicado"
    | "Error";

export interface IntentoPublicacionContabilidad {
    numero: number;
    fechaIntento: string;
    resultado: "En curso" | "Publicado" | "Error";
    mensaje?: string;
    referenciaPublicacion?: string;
}

export type EstadoProcesamientoContabilidad =
    | "CompromisoRegistrado"
    | "Rechazado";

export interface ResultadoContabilidadEntrante {
    idEvento: string;
    correlationId: string;
    idOrden: number;
    fechaResultado: string;
    estadoProcesamiento: EstadoProcesamientoContabilidad;
    idCompromisoContable?: string;
    motivoRechazo?: string;
}

export interface ResultadoOrdenCompraContabilidad
    extends ResultadoContabilidadEntrante {
    fechaRecepcion: string;
    idMensajePubSub?: string;
}

export interface ErrorRespuestaContabilidad {
    idEvento?: string;
    correlationId?: string;
    idOrden?: number;
    idMensajePubSub?: string;
    fechaRecepcion: string;
    error: string;
}

export interface EventoOrdenCompraConfirmada {
    idEvento: string;
    tipoEvento: "OrdenCompraConfirmada";
    correlationId: string;
    fechaEvento: string;
    idOrden: number;
    numeroOrden: string;
    fechaOrden: string;
    referenciaProveedor: string;
    fechaConfirmacionProveedor: string;
    proveedor: {
        idProveedor: number;
        razonSocial: string;
        nitRuc: string;
    };
    total: number;
    detalles: {
        idDetalle: number;
        idProducto: number;
        producto: string;
        cantidad: number;
        precioUnitario: number;
        subtotal: number;
    }[];
    estadoPublicacion: EstadoPublicacionContabilidad;
    intentosPublicacion: IntentoPublicacionContabilidad[];
    fechaUltimoIntento?: string;
    referenciaPublicacion?: string;
    errorPublicacion?: string;
    resultadoContabilidad?: ResultadoOrdenCompraContabilidad;
}
