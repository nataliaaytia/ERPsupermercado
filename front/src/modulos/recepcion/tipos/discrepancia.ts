export interface DatosDiscrepanciaBase {
    idRecepcion: number;
    idDetalleOrden: number;
    descripcion: string;
}

export interface DiscrepanciaCantidad extends DatosDiscrepanciaBase {
    tipo: "cantidad";
    cantidadDiscrepante: number;
    /** Faltante o exceso (se pide con la conexión activa). */
    sentido?: "faltante" | "exceso";
}

export interface DiscrepanciaProducto extends DatosDiscrepanciaBase {
    tipo: "producto";
    productoRecibido: string;
    /** Unidades afectadas (se pide con la conexión activa). */
    cantidadDiscrepante?: number;
}

export type DatosDiscrepancia =
    | DiscrepanciaCantidad
    | DiscrepanciaProducto;

/** Discrepancia ya registrada en el sistema. */
export type Discrepancia = DatosDiscrepancia & {
    idDiscrepancia: number;
    idOrden: number;
    fechaRegistro: string;
    /** Tipo y estado según el servidor (solo con la conexión activa). */
    tipoDiferencia?: string;
    estado?: string;
};
