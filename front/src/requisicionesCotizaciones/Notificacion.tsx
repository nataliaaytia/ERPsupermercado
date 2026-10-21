import { useEffect } from "react";
import "./Notificacion.css";

type TipoNotificacion =
  | "exito"
  | "error"
  | "advertencia"
  | "informacion";

interface Props {
  mensaje: string;
  tipo: string;
  onCerrar: () => void;
}

const configuraciones: Record<
  TipoNotificacion,
  {
    titulo: string;
    icono: string;
  }
> = {
  exito: {
    titulo: "Operación realizada correctamente",
    icono: "✓",
  },
  error: {
    titulo: "No se pudo completar la operación",
    icono: "!",
  },
  advertencia: {
    titulo: "Atención",
    icono: "!",
  },
  informacion: {
    titulo: "Información",
    icono: "i",
  },
};

export default function Notificacion({
  mensaje,
  tipo,
  onCerrar,
}: Props) {
  const tipoNotificacion: TipoNotificacion =
    tipo === "error" ||
    tipo === "advertencia" ||
    tipo === "informacion"
      ? tipo
      : "exito";

  const esError = tipoNotificacion === "error";

  const configuracion =
    configuraciones[tipoNotificacion];

  useEffect(() => {
    if (!mensaje || esError) {
      return;
    }

    const temporizador = window.setTimeout(() => {
      onCerrar();
    }, 5000);

    return () => {
      window.clearTimeout(temporizador);
    };
  }, [mensaje, esError, onCerrar]);

  if (!mensaje) {
    return null;
  }

  return (
    <div
      className={`notificacion notificacion--${tipoNotificacion}`}
      role={esError ? "alert" : "status"}
      aria-live={esError ? "assertive" : "polite"}
      aria-atomic="true"
    >
      <div
        className="notificacion__icono"
        aria-hidden="true"
      >
        {configuracion.icono}
      </div>

      <div className="notificacion__contenido">
        <strong>{configuracion.titulo}</strong>
        <p>{mensaje}</p>
      </div>

      <button
        type="button"
        className="notificacion__cerrar"
        onClick={onCerrar}
        aria-label="Cerrar notificación"
        title="Cerrar notificación"
      >
        ×
      </button>
    </div>
  );
}