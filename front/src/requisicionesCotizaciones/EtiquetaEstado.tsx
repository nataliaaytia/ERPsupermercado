import { AlertTriangle, CheckCircle2, Clock, XCircle } from "lucide-react";
import type { Requisicion } from "./tipos";
import "./EtiquetaEstado.css";

interface Props {
  requisicion: Requisicion;
}

const iconos = {
  pendiente: <Clock size={14} />,
  aprobada: <CheckCircle2 size={14} />,
  advertencia: <AlertTriangle size={14} />,
  anulada: <XCircle size={14} />,
};

export default function EtiquetaEstado({ requisicion }: Props) {
  const conAdvertencias =
    requisicion.estado === "Aprobada" &&
    (requisicion.validacion?.advertencias.length ?? 0) > 0;

  const tipo = conAdvertencias
    ? "advertencia"
    : requisicion.estado === "Aprobada"
      ? "aprobada"
      : requisicion.estado === "Anulada"
        ? "anulada"
        : "pendiente";

  const texto = conAdvertencias
    ? "Aprobada con advertencias"
    : requisicion.estado;

  return (
    <span className={`etiqueta-estado etiqueta-estado--${tipo}`}>
      {iconos[tipo]}
      {texto}
    </span>
  );
}
