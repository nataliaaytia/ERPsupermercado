
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { FormEvent } from "react";
import { useCompras } from "../../../estado/useCompras";
import type {
  EstadoRespuestaProveedor,
  OrdenCompra,
} from "../tipos";
import { registrarRespuestaProveedor } from "../servicios/registroRespuestaProveedor";
import {
  publicarOrdenConfirmadaAContabilidad,
  recuperarPublicacionesContabilidadInterrumpidas,
} from "../servicios/servicioEventoContabilidad";
import "./RespuestaProveedorOrden.css";
import { fechaHoy } from "../../../utilidades/fechas";

interface Props {
  orden: OrdenCompra;
}

export default function RespuestaProveedorOrden({ orden }: Props) {
  const compras = useCompras();
  const tituloId = useId();
  const modalRef = useRef<HTMLDivElement>(null);
  const botonAbrirRef = useRef<HTMLButtonElement>(null);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [respuesta, setRespuesta] =
    useState<EstadoRespuestaProveedor | "">("");
  const [referencia, setReferencia] = useState("");
  const [fecha, setFecha] = useState(fechaHoy());
  const [observacion, setObservacion] = useState("");
  const [procesando, setProcesando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [error, setError] = useState("");

  const registrada = orden.respuestaProveedor;
  const eventoContabilidad =
    compras.eventosOrdenCompraContabilidad.find(
      evento => evento.idOrden === orden.idOrden,
    );
  const erroresContabilidad =
    compras.erroresRespuestasContabilidad.filter(
      registro =>
        registro.idEvento === eventoContabilidad?.idEvento ||
        registro.idOrden === orden.idOrden,
    );

  const puedeRegistrar = orden.estado === "Enviada" && !registrada;

  useEffect(() => {
    if (!modalAbierto) return;

    const focoAnterior = document.activeElement;
    const overflowAnterior = document.body.style.overflow;
    const botonAbrir = botonAbrirRef.current;

    document.body.style.overflow = "hidden";

    const primerCampo = modalRef.current?.querySelector<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >("select, input, textarea");

    if (primerCampo) {
      primerCampo.focus();
    } else {
      modalRef.current
        ?.querySelector<HTMLButtonElement>("button")
        ?.focus();
    }

    function manejarTeclado(evento: KeyboardEvent) {
      if (evento.key === "Escape") {
        evento.preventDefault();

        if (!procesando) {
          setModalAbierto(false);
          setConfirmando(false);
          setError("");
        }

        return;
      }

      if (evento.key !== "Tab") return;

      const elementos = modalRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

      if (!elementos?.length) return;

      const primero = elementos[0];
      const ultimo = elementos[elementos.length - 1];

      if (evento.shiftKey && document.activeElement === primero) {
        evento.preventDefault();
        ultimo.focus();
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault();
        primero.focus();
      }
    }

    document.addEventListener("keydown", manejarTeclado);

    return () => {
      document.removeEventListener("keydown", manejarTeclado);
      document.body.style.overflow = overflowAnterior;

      if (focoAnterior instanceof HTMLElement) {
        focoAnterior.focus();
      } else {
        botonAbrir?.focus();
      }
    };
  }, [modalAbierto, confirmando, procesando]);

  useEffect(() => {
    recuperarPublicacionesContabilidadInterrumpidas();
  }, []);

  function abrirFormulario() {
    if (!puedeRegistrar || procesando) return;

    setRespuesta("");
    setReferencia("");
    setFecha(fechaHoy());
    setObservacion("");
    setConfirmando(false);
    setError("");
    setModalAbierto(true);
  }

  function cerrarFormulario() {
    if (procesando) return;

    setModalAbierto(false);
    setConfirmando(false);
    setError("");
  }

  function continuarConfirmacion(evento: FormEvent<HTMLFormElement>) {
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

    if (!fecha || fecha > fechaHoy()) {
      setError("Ingresa una fecha de respuesta válida.");
      return;
    }

    setError("");
    setConfirmando(true);
  }

  async function confirmarRegistro() {
    if (!puedeRegistrar || procesando || !respuesta) return;

    setProcesando(true);
    setError("");

    try {
      const evento = await registrarRespuestaProveedor({
        idOrden: orden.idOrden,
        estado: respuesta,
        referencia,
        fecha,
        observacion,
      });

      if (evento) {
        void publicarOrdenConfirmadaAContabilidad(
          evento.idEvento,
        ).catch(fallo => {
          setError(
            fallo instanceof Error
              ? fallo.message
              : "No se pudo actualizar el estado del evento contable.",
          );
        });
      }

      setModalAbierto(false);
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

  const aceptada = respuesta === "Confirmada";

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
            ref={botonAbrirRef}
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
            <strong>Referencia:</strong> {registrada.referencia}
          </p>

          <p>
            <strong>Fecha de respuesta:</strong> {registrada.fecha}
          </p>

          <p>
            <strong>Observación:</strong>{" "}
            {registrada.observacion || "Sin observaciones"}
          </p>

          <p className="respuesta-proveedor__aviso">
            La respuesta ya fue registrada y no puede modificarse
            desde este formulario.
          </p>
        </div>
      )}

      {registrada?.estado === "Confirmada" && (
        <section
          className="respuesta-proveedor__registro"
          aria-label="Publicación del compromiso a Contabilidad"
        >
          <h4>Compromiso de compra para Contabilidad</h4>
          {eventoContabilidad ? (
            <>
              <p>
                <strong>Evento:</strong>{" "}
                {eventoContabilidad.tipoEvento}
              </p>
              <p>
                <strong>ID del evento:</strong>{" "}
                {eventoContabilidad.idEvento}
              </p>
              <p>
                <strong>correlationId:</strong>{" "}
                {eventoContabilidad.correlationId}
              </p>
              <p>
                <strong>Estado de publicación:</strong>{" "}
                {eventoContabilidad.estadoPublicacion}
              </p>
              <p>
                <strong>Intentos:</strong>{" "}
                {eventoContabilidad.intentosPublicacion.length}
              </p>
              <p>
                <strong>Último intento:</strong>{" "}
                {eventoContabilidad.fechaUltimoIntento
                  ? new Date(
                      eventoContabilidad.fechaUltimoIntento,
                    ).toLocaleString("es-BO")
                  : "Todavía no se ha intentado"}
              </p>
              {eventoContabilidad.referenciaPublicacion && (
                <p>
                  <strong>Referencia del publicador:</strong>{" "}
                  {eventoContabilidad.referenciaPublicacion}
                </p>
              )}
              {eventoContabilidad.estadoPublicacion ===
                "Publicado" && (
                <p className="respuesta-proveedor__aviso">
                  El publicador aceptó el evento. Esto no confirma
                  que Contabilidad lo haya procesado.
                </p>
              )}
              {eventoContabilidad.resultadoContabilidad ? (
                <>
                  <p>
                    <strong>Resultado de Contabilidad:</strong>{" "}
                    <span
                      className={
                        eventoContabilidad.resultadoContabilidad
                          .estadoProcesamiento ===
                        "CompromisoRegistrado"
                          ? "respuesta-proveedor__confirmada"
                          : "respuesta-proveedor__rechazada"
                      }
                    >
                      {eventoContabilidad.resultadoContabilidad
                        .estadoProcesamiento === "CompromisoRegistrado"
                        ? "Compromiso registrado"
                        : "Rechazado"}
                    </span>
                  </p>
                  <p>
                    <strong>Orden relacionada:</strong>{" "}
                    {eventoContabilidad.resultadoContabilidad.idOrden}
                  </p>
                  <p>
                    <strong>Evento original:</strong>{" "}
                    {eventoContabilidad.resultadoContabilidad.idEvento}
                  </p>
                  <p>
                    <strong>correlationId:</strong>{" "}
                    {eventoContabilidad.resultadoContabilidad.correlationId}
                  </p>
                  <p>
                    <strong>Fecha del resultado:</strong>{" "}
                    {new Date(
                      eventoContabilidad.resultadoContabilidad.fechaResultado,
                    ).toLocaleString("es-BO")}
                  </p>
                  <p>
                    <strong>Respuesta recibida:</strong>{" "}
                    {new Date(
                      eventoContabilidad.resultadoContabilidad.fechaRecepcion,
                    ).toLocaleString("es-BO")}
                  </p>
                  {eventoContabilidad.resultadoContabilidad
                    .idCompromisoContable && (
                    <p>
                      <strong>ID del compromiso:</strong>{" "}
                      {
                        eventoContabilidad.resultadoContabilidad
                          .idCompromisoContable
                      }
                    </p>
                  )}
                  {eventoContabilidad.resultadoContabilidad.motivoRechazo && (
                    <p className="respuesta-proveedor__error">
                      <strong>Motivo del rechazo:</strong>{" "}
                      {
                        eventoContabilidad.resultadoContabilidad
                          .motivoRechazo
                      }
                    </p>
                  )}
                  {eventoContabilidad.resultadoContabilidad.idMensajePubSub && (
                    <p>
                      <strong>ID de mensaje Pub/Sub:</strong>{" "}
                      {
                        eventoContabilidad.resultadoContabilidad
                          .idMensajePubSub
                      }
                    </p>
                  )}
                </>
              ) : (
                <p className="respuesta-proveedor__aviso" role="status">
                  {eventoContabilidad.estadoPublicacion === "Publicado"
                    ? "Pendiente de respuesta de Contabilidad."
                    : "Aún no se ha publicado el evento; no hay resultado que procesar."}
                </p>
              )}
              {erroresContabilidad.length > 0 && (
                <div>
                  <h5>Respuestas no procesadas</h5>
                  <ul>
                    {erroresContabilidad.map((registro, indice) => (
                      <li
                        className="respuesta-proveedor__error"
                        key={
                          registro.idMensajePubSub ??
                          `${registro.fechaRecepcion}-${indice}`
                        }
                      >
                        {registro.idMensajePubSub &&
                          `Mensaje ${registro.idMensajePubSub} · `}
                        {new Date(
                          registro.fechaRecepcion,
                        ).toLocaleString("es-BO")}
                        {" · "}
                        {registro.error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {eventoContabilidad.errorPublicacion && (
                <p
                  className="respuesta-proveedor__error"
                  role="status"
                >
                  {eventoContabilidad.errorPublicacion}
                </p>
              )}
              {eventoContabilidad.intentosPublicacion.length > 0 && (
                <details>
                  <summary>Historial de intentos</summary>
                  <ol>
                    {eventoContabilidad.intentosPublicacion.map(
                      intento => (
                        <li key={intento.numero}>
                          Intento {intento.numero} ·{" "}
                          {new Date(
                            intento.fechaIntento,
                          ).toLocaleString("es-BO")}{" "}
                          · {intento.resultado}
                          {intento.mensaje &&
                            ` · ${intento.mensaje}`}
                        </li>
                      ),
                    )}
                  </ol>
                </details>
              )}
              {(eventoContabilidad.estadoPublicacion ===
                "Pendiente" ||
                eventoContabilidad.estadoPublicacion === "Error" ||
                eventoContabilidad.estadoPublicacion ===
                  "Pendiente de configuración") && (
                <button
                  type="button"
                  className="respuesta-proveedor__principal"
                  onClick={() => {
                    void publicarOrdenConfirmadaAContabilidad(
                      eventoContabilidad.idEvento,
                    ).catch(fallo => {
                      setError(
                        fallo instanceof Error
                          ? fallo.message
                          : "No se pudo actualizar el estado del evento contable.",
                      );
                    });
                  }}
                >
                  {eventoContabilidad.intentosPublicacion.length
                    ? "Reintentar publicar en Pub/Sub"
                    : "Publicar en Pub/Sub"}
                </button>
              )}
            </>
          ) : (
            <p className="respuesta-proveedor__aviso">
              Esta orden ya tenía una confirmación registrada antes
              de esta integración; no se generó un evento
              retroactivo.
            </p>
          )}
        </section>
      )}

      {modalAbierto &&
        createPortal(
          <div
            className="respuesta-proveedor__modal-fondo"
            onMouseDown={(evento) => {
              if (evento.target === evento.currentTarget) {
                cerrarFormulario();
              }
            }}
          >
            <div
              ref={modalRef}
              className="respuesta-proveedor__modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby={tituloId}
            >
              <div className="respuesta-proveedor__modal-encabezado">
                <div
                  className={`respuesta-proveedor__modal-icono ${
                    confirmando && !aceptada
                      ? "respuesta-proveedor__modal-icono--rechazo"
                      : ""
                  }`}
                >
                  {confirmando && !aceptada ? (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="12" r="9" />
                      <path d="M8 8l8 8M16 8l-8 8" />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M5 12l4 4L19 6" />
                    </svg>
                  )}
                </div>

                <div className="respuesta-proveedor__modal-titulos">
                  <h2 id={tituloId}>
                    {confirmando
                      ? "Confirmar respuesta"
                      : "Registrar respuesta del proveedor"}
                  </h2>
                  <p>
                    {confirmando
                      ? "Revisa los datos antes de registrar la respuesta."
                      : "Registra la decisión comunicada por el proveedor."}
                  </p>
                </div>
              </div>

              <div className="respuesta-proveedor__modal-resumen">
                <strong>Orden de compra {orden.numero}</strong>

                <div className="respuesta-proveedor__transicion">
                  <span>{orden.estado}</span>
                  <span className="respuesta-proveedor__flecha">→</span>
                  <span
                    className={
                      respuesta === "Rechazada"
                        ? "respuesta-proveedor__rechazada"
                        : "respuesta-proveedor__confirmada"
                    }
                  >
                    {respuesta || "Pendiente de respuesta"}
                  </span>
                </div>
              </div>

              {!confirmando ? (
                <form onSubmit={continuarConfirmacion}>
                  <div className="respuesta-proveedor__campos">
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

                    <div className="respuesta-proveedor__fila">
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
                          max={fechaHoy()}
                          onChange={(evento) =>
                            setFecha(evento.target.value)
                          }
                          disabled={procesando}
                          required
                        />
                      </label>
                    </div>

                    <label className="respuesta-proveedor__campo">
                      Observación
                      <textarea
                        value={observacion}
                        onChange={(evento) =>
                          setObservacion(evento.target.value)
                        }
                        placeholder="Detalles de la respuesta recibida"
                        rows={3}
                        maxLength={1000}
                        disabled={procesando}
                      />
                    </label>
                  </div>

                  {error && (
                    <p className="respuesta-proveedor__error" role="alert">
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
                  <div
                    className={`respuesta-proveedor__resumen ${
                      aceptada
                        ? "respuesta-proveedor__resumen--confirmada"
                        : "respuesta-proveedor__resumen--rechazada"
                    }`}
                  >
                    <p>
                      <strong>Decisión:</strong>{" "}
                      <span
                        className={
                          aceptada
                            ? "respuesta-proveedor__confirmada"
                            : "respuesta-proveedor__rechazada"
                        }
                      >
                        {aceptada ? "Aceptación" : "Rechazo"}
                      </span>
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
                    Esta acción actualizará el estado de la orden y
                    registrará la respuesta en su historial. No podrás
                    modificarla desde este formulario.
                  </p>

                  {error && (
                    <p className="respuesta-proveedor__error" role="alert">
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
                        : aceptada
                          ? "Confirmar aceptación"
                          : "Confirmar rechazo"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </section>
  );
}
