
import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent } from "react";
import type {
  EstadoRespuestaProveedor,
  OrdenCompra,
} from "./tipos";
import { registrarRespuestaProveedor } from "./registroRespuestaProveedor";
import "./RespuestaProveedorOrden.css";

interface Props {
  orden: OrdenCompra;
}

function fechaLocal(): string {
  const fecha = new Date();

  return [
    fecha.getFullYear(),
    String(fecha.getMonth() + 1).padStart(2, "0"),
    String(fecha.getDate()).padStart(2, "0"),
  ].join("-");
}

export default function RespuestaProveedorOrden({
  orden,
}: Props) {
  const dialogoRef = useRef<HTMLDialogElement>(null);
  const tituloId = useId();

  const [respuesta, setRespuesta] =
    useState<EstadoRespuestaProveedor | "">("");

  const [referencia, setReferencia] = useState("");
  const [fecha, setFecha] = useState(fechaLocal());
  const [observacion, setObservacion] = useState("");
  const [procesando, setProcesando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [error, setError] = useState("");

  const registrada = orden.respuestaProveedor;

  const puedeRegistrar =
    orden.estado === "Enviada" && !registrada;

  useEffect(() => {
    if (!puedeRegistrar && dialogoRef.current?.open) {
      dialogoRef.current.close();
    }
  }, [puedeRegistrar]);

  function abrirFormulario() {
    if (!puedeRegistrar || procesando) return;

    setRespuesta("");
    setReferencia("");
    setFecha(fechaLocal());
    setObservacion("");
    setConfirmando(false);
    setError("");

    dialogoRef.current?.showModal();
  }

  function cerrarFormulario() {
    if (procesando) return;

    dialogoRef.current?.close();
    setConfirmando(false);
    setError("");
  }

  function continuarConfirmacion(
    evento: FormEvent<HTMLFormElement>
  ) {
    evento.preventDefault();

    if (!puedeRegistrar || procesando) return;

    if (!respuesta) {
      setError("Selecciona aceptación o rechazo.");
      return;
    }

    if (!referencia.trim()) {
      setError("La referencia del proveedor es obligatoria.");
      return;
    }

    if (!fecha || fecha > fechaLocal()) {
      setError("Ingresa una fecha de respuesta válida.");
      return;
    }

    setError("");
    setConfirmando(true);
  }

  function confirmarRegistro() {
    if (!puedeRegistrar || procesando || !respuesta) {
      return;
    }

    setProcesando(true);
    setError("");

    try {
      registrarRespuestaProveedor({
        idOrden: orden.idOrden,
        estado: respuesta,
        referencia,
        fecha,
        observacion,
      });

      dialogoRef.current?.close();
      setConfirmando(false);
    } catch (fallo) {
      setError(
        fallo instanceof Error
          ? fallo.message
          : "No se pudo registrar la respuesta."
      );
    } finally {
      setProcesando(false);
    }
  }

  if (!puedeRegistrar && !registrada) {
    return null;
  }

  return (
    <section className="respuesta-proveedor">
      <div className="respuesta-proveedor__encabezado">
        <div>
          <h3>Respuesta del proveedor</h3>
          <p>
            {registrada
              ? "Consulta la respuesta registrada para esta orden."
              : "Registra la aceptación o rechazo comunicado por el proveedor."}
          </p>
        </div>

        {puedeRegistrar && (
          <button
            type="button"
            className="respuesta-proveedor__principal"
            onClick={abrirFormulario}
          >
            Registrar respuesta
          </button>
        )}
      </div>

      {registrada && (
        <div className="respuesta-proveedor__registro">
          <p>
            <strong>Respuesta:</strong>{" "}
            <span
              className={
                registrada.estado === "Confirmada"
                  ? "respuesta-proveedor__confirmada"
                  : "respuesta-proveedor__rechazada"
              }
            >
              {registrada.estado}
            </span>
          </p>

          <p>
            <strong>Referencia:</strong>{" "}
            {registrada.referencia}
          </p>

          <p>
            <strong>Fecha de respuesta:</strong>{" "}
            {registrada.fecha}
          </p>

          <p>
            <strong>Observación:</strong>{" "}
            {registrada.observacion || "Sin observaciones"}
          </p>

          <p className="respuesta-proveedor__aviso">
            La respuesta ya fue registrada y no puede
            modificarse desde este formulario.
          </p>
        </div>
      )}

      {puedeRegistrar && (
        <dialog
          ref={dialogoRef}
          className="respuesta-proveedor__dialogo"
          aria-labelledby={tituloId}
          onCancel={(evento) => {
            if (procesando) {
              evento.preventDefault();
            } else {
              setConfirmando(false);
              setError("");
            }
          }}
        >
          {!confirmando ? (
            <form onSubmit={continuarConfirmacion}>
              <h3 id={tituloId}>
                Registrar respuesta del proveedor
              </h3>

              <p className="respuesta-proveedor__aviso">
                Orden: <strong>{orden.numero}</strong>
              </p>

              <label className="respuesta-proveedor__campo">
                Respuesta del proveedor *
                <select
                  value={respuesta}
                  onChange={(evento) =>
                    setRespuesta(
                      evento.target.value as
                        | EstadoRespuestaProveedor
                        | ""
                    )
                  }
                  disabled={procesando}
                  required
                >
                  <option value="">
                    Selecciona una respuesta
                  </option>
                  <option value="Confirmada">
                    Aceptación
                  </option>
                  <option value="Rechazada">
                    Rechazo
                  </option>
                </select>
              </label>

              <label className="respuesta-proveedor__campo">
                Referencia del proveedor *
                <input
                  type="text"
                  value={referencia}
                  onChange={(evento) =>
                    setReferencia(evento.target.value)
                  }
                  placeholder={
                    respuesta === "Rechazada"
                      ? "Ej. RECH-2026-001"
                      : "Ej. CONF-2026-001"
                  }
                  maxLength={100}
                  disabled={procesando}
                  required
                />
              </label>

              <label className="respuesta-proveedor__campo">
                Fecha de respuesta *
                <input
                  type="date"
                  value={fecha}
                  max={fechaLocal()}
                  onChange={(evento) =>
                    setFecha(evento.target.value)
                  }
                  disabled={procesando}
                  required
                />
              </label>

              <label className="respuesta-proveedor__campo">
                Observación
                <textarea
                  value={observacion}
                  onChange={(evento) =>
                    setObservacion(evento.target.value)
                  }
                  placeholder="Detalles de la respuesta recibida"
                  rows={4}
                  maxLength={1000}
                  disabled={procesando}
                />
              </label>

              {respuesta && (
                <p className="respuesta-proveedor__aviso">
                  La orden pasará al estado{" "}
                  <strong>{respuesta}</strong>.
                  Verifica que corresponda a la decisión
                  comunicada por el proveedor.
                </p>
              )}

              {error && (
                <p
                  className="respuesta-proveedor__error"
                  role="alert"
                >
                  {error}
                </p>
              )}

              <div className="respuesta-proveedor__acciones">
                <button
                  type="button"
                  className="respuesta-proveedor__secundario"
                  onClick={cerrarFormulario}
                  disabled={procesando}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="respuesta-proveedor__principal"
                  disabled={
                    procesando ||
                    !respuesta ||
                    !referencia.trim() ||
                    !fecha
                  }
                >
                  Continuar
                </button>
              </div>
            </form>
          ) : (
            <div className="respuesta-proveedor__confirmacion">
              <h3 id={tituloId}>
                Confirmar respuesta del proveedor
              </h3>

              <p>
                Revisa los datos antes de registrar
                definitivamente la respuesta.
              </p>

              <div
                className={`respuesta-proveedor__resumen ${
                  respuesta === "Confirmada"
                    ? "respuesta-proveedor__resumen--confirmada"
                    : "respuesta-proveedor__resumen--rechazada"
                }`}
              >
                <p>
                  <strong>Orden:</strong> {orden.numero}
                </p>

                <p>
                  <strong>Decisión:</strong>{" "}
                  <span
                    className={
                      respuesta === "Confirmada"
                        ? "respuesta-proveedor__confirmada"
                        : "respuesta-proveedor__rechazada"
                    }
                  >
                    {respuesta === "Confirmada"
                      ? "Aceptación"
                      : "Rechazo"}
                  </span>
                </p>

                <p>
                  <strong>Estado final:</strong> {respuesta}
                </p>

                <p>
                  <strong>Referencia:</strong> {referencia.trim()}
                </p>

                <p>
                  <strong>Fecha:</strong> {fecha}
                </p>

                <p>
                  <strong>Observación:</strong>{" "}
                  {observacion.trim() || "Sin observaciones"}
                </p>
              </div>

              <p className="respuesta-proveedor__advertencia">
                Esta acción actualizará el estado de la orden
                y registrará la respuesta en su historial.
                No podrás modificarla desde este formulario.
              </p>

              {error && (
                <p
                  className="respuesta-proveedor__error"
                  role="alert"
                >
                  {error}
                </p>
              )}

              <div className="respuesta-proveedor__acciones">
                <button
                  type="button"
                  className="respuesta-proveedor__secundario"
                  onClick={() => {
                    setConfirmando(false);
                    setError("");
                  }}
                  disabled={procesando}
                >
                  Volver a editar
                </button>

                <button
                  type="button"
                  className="respuesta-proveedor__principal"
                  onClick={confirmarRegistro}
                  disabled={procesando}
                >
                  {procesando
                    ? "Guardando..."
                    : respuesta === "Confirmada"
                      ? "Confirmar aceptación"
                      : "Confirmar rechazo"}
                </button>
              </div>
            </div>
          )}
        </dialog>
      )}
    </section>
  );
}
