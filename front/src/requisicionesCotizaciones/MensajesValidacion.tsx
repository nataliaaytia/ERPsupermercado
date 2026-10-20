import { AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { ResultadoValidacion } from "./tipos";
import "./MensajesValidacion.css";

interface Props {
  validacion: ResultadoValidacion;
}

export default function MensajesValidacion({ validacion }: Props) {
  const { errores, advertencias } = validacion;

  if (errores.length === 0 && advertencias.length === 0)
    return (
      <p
        role="status"
        className="mensajes-validacion mensajes-validacion--correcto"
      >
        <CheckCircle2 size={18} />
        Todos los datos son correctos.
      </p>
    );

  return (
    <div className="mensajes-validacion__grupo">
      {errores.length > 0 && (
        <div
          role="alert"
          className="mensajes-validacion mensajes-validacion--error"
        >
          <strong>
            <AlertCircle size={18} />
            No se pudo aprobar la requisición:
          </strong>
          <ul>
            {errores.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}
      {advertencias.length > 0 && (
        <div
          role="status"
          className="mensajes-validacion mensajes-validacion--advertencia"
        >
          <strong>
            <AlertTriangle size={18} />
            Advertencias (no impiden la aprobación):
          </strong>
          <ul>
            {advertencias.map((advertencia) => (
              <li key={advertencia}>{advertencia}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
