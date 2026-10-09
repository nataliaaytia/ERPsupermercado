export interface ProductoFormulario {
  id: number;
  nombre: string;
  cantidad: string;
}

export interface DatosRequisicion {
  productos: ProductoFormulario[];
  motivo: string;
}

export interface ProductoRequisicion {
  nombre: string;
  cantidad: number;
}

export interface Requisicion {
  id: string;
  fecha: string;
  productos: ProductoRequisicion[];
  motivo: string;
  estado: "Pendiente";
}
