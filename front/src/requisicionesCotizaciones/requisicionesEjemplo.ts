import type { Requisicion } from "./tipos";

export const requisicionesEjemplo: Requisicion[] = [
  {
    id: "REQ-0001",
    fecha: "10/10/2026",
    productos: [
      { nombre: "Papel bond tamaño carta", cantidad: 50 },
      { nombre: "Tinta negra", cantidad: 5 },
    ],
    motivo: "Reposición mensual de insumos de oficina.",
    estado: "Pendiente",
  },
  {
    id: "REQ-0002",
    fecha: "10/10/2026",
    productos: [{ nombre: "Marcadores", cantidad: 2000 }],
    motivo: "Para clases",
    estado: "Pendiente",
  },
  {
    id: "REQ-0003",
    fecha: "11/10/2026",
    productos: [
      { nombre: "Hojas", cantidad: 0 },
      { nombre: "", cantidad: 3 },
    ],
    motivo: "Urgente",
    estado: "Pendiente",
  },
];
