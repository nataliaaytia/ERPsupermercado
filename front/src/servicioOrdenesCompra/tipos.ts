//NATALIA - SCRUM 523

import type { ProductoReferencia } from "../requisicionesCotizaciones/tipos";

export interface CompromisoEntrega {
    idCompromiso: number;
    fechaEntrega: string;
    cantidad: number;
    estado: string;
    observacion: string;
}

export interface DetalleOrdenCompra {
    idDetalle: number;
    producto: ProductoReferencia;
    cantidad: number;
    precio: number;
    subtotal: number;
    compromisos?: CompromisoEntrega[];
}

export interface CondicionesLogisticas {
    destino: string;
    horario: string;
    responsableEntrega: string;
}

export interface OrdenCompra {
    idOrden: number;
    idOfertaOrigen?: number;
    numero: string;
    fecha: string;
    estado: string;
    total: number;
    observacion: string;
    condicionesLogisticas?: CondicionesLogisticas;
    detalles: DetalleOrdenCompra[];
}

export interface DatosCompromisoEntrega {
    idOrden: number;
    idDetalle: number;
    fechaEntrega: string;
    cantidad: string;
    observacion: string;
}