import { AlertTriangle, CheckCircle2, Clock, XCircle } from "lucide-react";
import type { Requisicion } from "./tipos";
import "./EtiquetaEstado.css";

interface Props {
  requisicion: Requisicion;
}

const iconos = {
  pendiente: <Clock size={14} />,
  validada: <CheckCircle2 size={14} />,
  advertencia: <AlertTriangle size={14} />,
  rechazada: <XCircle size={14} />,
};

export default function EtiquetaEstado({ requisicion }: Props) {
  const conAdvertencias =
    requisicion.estado === "Validada" &&
    (requisicion.validacion?.advertencias.length ?? 0) > 0;

  const tipo = conAdvertencias
    ? "advertencia"
    : requisicion.estado === "Validada"
      ? "validada"
      : requisicion.estado === "Rechazada"
        ? "rechazada"
        : "pendiente";

  const texto = conAdvertencias
    ? "Validada con advertencias"
    : requisicion.estado;

  return (
    <span className={`etiqueta-estado etiqueta-estado--${tipo}`}>
      {iconos[tipo]}
      {texto}
    </span>
  );
}
