
import { CalendarDays, Clock3 } from "lucide-react";
import {
  calcularPlazoCotizacion,
  formatearFechaCotizacion,
} from "./plazoCotizacion";
import "./EstadoPlazoCotizacion.css";

interface Props {
  fechaInicio: string;
  fechaLimite: string;
  hoy: string;
}

export default function EstadoPlazoCotizacion({
  fechaInicio,
  fechaLimite,
  hoy,
}: Props) {
  const plazo = calcularPlazoCotizacion(fechaLimite, hoy);

  const etiquetas = {
    abierta: "Recepción abierta",
    proxima: "Próximo a vencer",
    "ultimo-dia": "Último día",
    vencida: "Plazo vencido",
  };

  const mensaje =
    plazo.estado === "vencida"
      ? `El plazo para registrar ofertas finalizó el ${formatearFechaCotizacion(fechaLimite)}. No se permiten nuevos registros.`
      : plazo.estado === "ultimo-dia"
        ? "Hoy es el último día para registrar ofertas."
        : `La cotización permanece abierta y se pueden registrar ofertas hasta el ${formatearFechaCotizacion(fechaLimite)}.`;

  return (
    <section
      className={`estado-plazo estado-plazo--${plazo.estado}`}
      aria-label="Estado de recepción de ofertas"
    >
      <div className="estado-plazo__encabezado">
        <h3>Estado de recepción</h3>

        <span className="estado-plazo__etiqueta">
          {etiquetas[plazo.estado]}
        </span>
      </div>

      <div className="estado-plazo__fechas">
        <div className="estado-plazo__fecha">
          <span>
            <CalendarDays size={16} />
            Fecha de inicio
          </span>

          <strong>
            {formatearFechaCotizacion(fechaInicio)}
          </strong>
        </div>

        <div className="estado-plazo__fecha">
          <span>
            <CalendarDays size={16} />
            Fecha límite
          </span>

          <strong>
            {formatearFechaCotizacion(fechaLimite)}
          </strong>
        </div>
      </div>

      <div className="estado-plazo__contador">
        <Clock3 size={23} />

        <strong>
          {plazo.estado === "vencida"
            ? "0 días disponibles"
            : plazo.estado === "ultimo-dia"
              ? "Vence hoy"
              : `${plazo.diasRestantes} ${
                  plazo.diasRestantes === 1
                    ? "día restante"
                    : "días restantes"
                }`}
        </strong>
      </div>

      <p className="estado-plazo__mensaje">
        {mensaje}
      </p>
    </section>
  );
}
