
import type { ResultadoValidacion } from "./tipos";
import "./ResultadoValidacionOferta.css";

interface Props {
  resultado?: ResultadoValidacion | null;
}

export default function ResultadoValidacionOferta({ resultado }: Props) {
  const errores = resultado?.errores ?? [];
  const advertencias = resultado?.advertencias ?? [];

  const pendiente = !resultado;
  const tieneErrores = errores.length > 0;

  const estado = pendiente
    ? "pendiente"
    : tieneErrores
      ? "error"
      : "valida";

  const titulo = pendiente
    ? "Validación pendiente"
    : tieneErrores
      ? "Oferta con errores"
      : "Oferta válida";

  const mensaje = pendiente
    ? "Esta oferta todavía no tiene un resultado de validación disponible."
    : tieneErrores
      ? "La oferta presenta errores que requieren corrección."
      : "La oferta no presenta errores de validación.";

  return (
    <section
      className={`resultado-validacion resultado-validacion--${estado}`}
      aria-label="Resultado de validación de la oferta"
      aria-live="polite"
    >
      <div className="resultado-validacion__encabezado">
        <span
          className="resultado-validacion__indicador"
          aria-hidden="true"
        />

        <strong>{titulo}</strong>
      </div>

      <p>{mensaje}</p>

      {errores.length > 0 && (
        <div className="resultado-validacion__detalle">
          <strong>Errores detectados</strong>
          <ul>
            {errores.map((error, indice) => (
              <li key={`${indice}-${error}`}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {advertencias.length > 0 && (
        <div className="resultado-validacion__detalle">
          <strong>Advertencias</strong>
          <ul>
            {advertencias.map((advertencia, indice) => (
              <li key={`${indice}-${advertencia}`}>
                {advertencia}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
