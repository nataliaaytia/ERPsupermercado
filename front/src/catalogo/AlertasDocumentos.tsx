import "./AlertasDocumentos.css";
import { useEffect, useMemo, useState } from "react";
import { AlertCircle, BellRing, CalendarClock } from "lucide-react";
import type { Documento, Proveedor } from "./tipos";

const DIAS_ALERTA_VENCIMIENTO = 30;
const MILISEGUNDOS_POR_DIA = 24 * 60 * 60 * 1000;

interface AlertaDocumento {
  id: string;
  nombreProveedor: string;
  documento: Documento;
  fechaVencimiento: number;
  diasRestantes: number;
  estado: "Vencido" | "Próximo a vencer";
}

interface AlertasDocumentosProps {
  proveedores: Proveedor[];
}

const obtenerFechaUTC = (fecha: string): number | null => {
  const coincidencia = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fecha);
  if (!coincidencia) return null;

  const anio = Number(coincidencia[1]);
  const mes = Number(coincidencia[2]);
  const dia = Number(coincidencia[3]);
  const fechaUTC = new Date(0);
  fechaUTC.setUTCHours(0, 0, 0, 0);
  fechaUTC.setUTCFullYear(anio, mes - 1, dia);

  if (
    fechaUTC.getUTCFullYear() !== anio ||
    fechaUTC.getUTCMonth() !== mes - 1 ||
    fechaUTC.getUTCDate() !== dia
  ) {
    return null;
  }

  return fechaUTC.getTime();
};

const formatoFecha = new Intl.DateTimeFormat("es-BO", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "UTC",
});

const AlertasDocumentos = ({ proveedores }: AlertasDocumentosProps) => {
  const [fechaActual, setFechaActual] = useState(() => new Date());

  useEffect(() => {
    const ahora = new Date();
    const inicioDelDiaSiguiente = new Date(
      ahora.getFullYear(),
      ahora.getMonth(),
      ahora.getDate() + 1,
    );
    const temporizador = window.setTimeout(
      () => setFechaActual(new Date()),
      inicioDelDiaSiguiente.getTime() - ahora.getTime(),
    );

    return () => window.clearTimeout(temporizador);
  }, [fechaActual]);

  const alertas = useMemo(() => {
    const hoyUTC = Date.UTC(
      fechaActual.getFullYear(),
      fechaActual.getMonth(),
      fechaActual.getDate(),
    );

    return proveedores
      .flatMap<AlertaDocumento>((proveedor) =>
        proveedor.documentos.flatMap<AlertaDocumento>((documento) => {
          const fechaVencimiento = obtenerFechaUTC(documento.fechaVencimiento);
          if (fechaVencimiento === null) return [];

          const diasRestantes = Math.round(
            (fechaVencimiento - hoyUTC) / MILISEGUNDOS_POR_DIA,
          );

          if (diasRestantes < 0) {
            return [
              {
                id: `${proveedor.idProveedor}-${documento.idDocumento}`,
                nombreProveedor: proveedor.razonSocial,
                documento,
                fechaVencimiento,
                diasRestantes,
                estado: "Vencido" as const,
              },
            ];
          }

          if (diasRestantes <= DIAS_ALERTA_VENCIMIENTO) {
            return [
              {
                id: `${proveedor.idProveedor}-${documento.idDocumento}`,
                nombreProveedor: proveedor.razonSocial,
                documento,
                fechaVencimiento,
                diasRestantes,
                estado: "Próximo a vencer" as const,
              },
            ];
          }

          return [];
        }),
      )
      .sort((a, b) => a.fechaVencimiento - b.fechaVencimiento);
  }, [fechaActual, proveedores]);

  return (
    <section
      className="chart-card alertas-documentos"
      aria-labelledby="alertas-documentos-titulo"
    >
      <div className="chart-header">
        <div>
          <h3 className="chart-title" id="alertas-documentos-titulo">
            <BellRing size={17} aria-hidden="true" />
            Alertas de documentos
          </h3>
          <p className="chart-subtitle">
            {alertas.length === 1
              ? "1 documento requiere atención"
              : `${alertas.length} documentos requieren atención`}
          </p>
        </div>
        <span
          className="alertas-documentos-contador"
          aria-label={`${alertas.length} ${alertas.length === 1 ? "alerta" : "alertas"}`}
        >
          {alertas.length}
        </span>
      </div>

      {alertas.length > 0 ? (
        <ul className="alertas-documentos-lista" aria-live="polite">
          {alertas.map((alerta) => (
            <li
              className={`alerta-documento-item ${alerta.estado === "Vencido" ? "alerta-documento-vencido" : "alerta-documento-proximo"}`}
              key={alerta.id}
            >
              <AlertCircle size={17} aria-hidden="true" />
              <div className="alerta-documento-detalle">
                <strong>{alerta.nombreProveedor}</strong>
                <span>
                  {alerta.documento.tipoDocumento}
                  {alerta.documento.numeroDocumento &&
                    ` · ${alerta.documento.numeroDocumento}`}
                </span>
                <small>
                  {alerta.estado === "Vencido" ? "Venció" : "Vence"}:{" "}
                  {formatoFecha.format(alerta.fechaVencimiento)}
                  {alerta.estado === "Vencido"
                    ? ` · Hace ${Math.abs(alerta.diasRestantes)} ${Math.abs(alerta.diasRestantes) === 1 ? "día" : "días"}`
                    : alerta.diasRestantes === 0
                      ? " · Hoy"
                      : ` · En ${alerta.diasRestantes} ${alerta.diasRestantes === 1 ? "día" : "días"}`}
                </small>
              </div>
              <span className="alerta-documento-estado">
                {alerta.estado === "Vencido" ? (
                  "Vencido"
                ) : (
                  <>
                    <CalendarClock size={13} /> Próximo a vencer
                  </>
                )}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="alertas-documentos-vacias" role="status">
          No hay documentos próximos a vencer ni vencidos.
        </p>
      )}
    </section>
  );
};

export default AlertasDocumentos;
