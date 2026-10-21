import type { Requisicion } from "./tipos";

export const requisicionesEjemplo: Requisicion[] = [
  {
    idRequisicion: 1,
    fecha: "2026-10-10",
    solicitante: "Usuario de ejemplo",
    prioridad: "Media",
    observacion: "Reposición mensual de insumos de oficina.",
    estado: "Pendiente",
    detalles: [
      {
        idDetalle: 1,
        producto: {
          idProducto: 1,
          descripcion: "Papel bond tamaño carta",
        },
        cantidad: 50,
        observacion: "",
      },
      {
        idDetalle: 2,
        producto: {
          idProducto: 2,
          descripcion: "Tinta negra",
        },
        cantidad: 5,
        observacion: "",
      },
    ],
  },
  {
    idRequisicion: 2,
    fecha: "2026-10-10",
    solicitante: "Usuario de ejemplo",
    prioridad: "Media",
    observacion: "Para clases",
    estado: "Pendiente",
    detalles: [
      {
        idDetalle: 1,
        producto: {
          idProducto: 3,
          descripcion: "Marcadores",
        },
        cantidad: 2000,
        observacion: "",
      },
    ],
  },
  {
    idRequisicion: 3,
    fecha: "2026-10-11",
    solicitante: "Usuario de ejemplo",
    prioridad: "Alta",
    observacion: "Urgente",
    estado: "Pendiente",
    detalles: [
      {
        idDetalle: 1,
        producto: {
          idProducto: 4,
          descripcion: "Hojas",
        },
        cantidad: 0,
        observacion: "",
      },
      {
        idDetalle: 2,
        producto: {
          idProducto: 5,
          descripcion: "",
        },
        cantidad: 3,
        observacion: "",
      },
    ],
  },
];