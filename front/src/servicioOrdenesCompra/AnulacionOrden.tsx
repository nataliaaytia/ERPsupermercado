
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { FormEvent } from "react";
import type { OrdenCompra } from "./tipos";
import {
  anularOrdenCompra,
  puedeAnularOrden,
  tieneRecepcionRegistrada,
} from "./registroAnulacionOrden";
import "./AnulacionOrden.css";

interface Props {
  orden: OrdenCompra;
}

function formatearFecha(fecha: string): string {
  const valor = new Date(fecha);

  if (Number.isNaN(valor.getTime())) {
    return fecha;
  }

  return valor.toLocaleString("es-BO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AnulacionOrden({ orden }: Props) {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState("");
  const [procesando, setProcesando] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const botonAbrirRef = useRef<HTMLButtonElement>(null);
  const botonCancelarRef = useRef<HTMLButtonElement>(null);

  const anulada = orden.estado === "Anulada";
  const tieneRecepcion = tieneRecepcionRegistrada(orden.idOrden);
  const habilitada = puedeAnularOrden(orden);

  useEffect(() => {
    if (!modalAbierto) return;

    const elementoAnterior = document.activeElement;
    const overflowAnterior = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    botonCancelarRef.current?.focus();

    function manejarTeclado(evento: KeyboardEvent) {
      if (evento.key === "Escape") {
        evento.preventDefault();

        if (!procesando) {
          setModalAbierto(false);
        }

        return;
      }

      if (evento.key !== "Tab") return;

      const elementos =
        modalRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );

      if (!elementos?.length) return;

      const primero = elementos[0];
      const ultimo = elementos[elementos.length - 1];

      if (
        evento.shiftKey &&
        document.activeElement === primero
      ) {
        evento.preventDefault();
        ultimo.focus();
      } else if (
        !evento.shiftKey &&
        document.activeElement === ultimo
      ) {
        evento.preventDefault();
        primero.focus();
      }
    }

    document.addEventListener("keydown", manejarTeclado);

    return () => {
      document.removeEventListener("keydown", manejarTeclado);
      document.body.style.overflow = overflowAnterior;

      if (elementoAnterior instanceof HTMLElement) {
        elementoAnterior.focus();
      } else {
        botonAbrirRef.current?.focus();
      }
    };
  }, [modalAbierto, procesando]);

  function abrirModal() {
    if (!habilitada) return;

    setMotivo("");
    setError("");
    setConfirmando(false);
    setModalAbierto(true);
  }

  function cerrarModal() {
    if (procesando) return;

    setModalAbierto(false);
    setConfirmando(false);
    setError("");
  }

  function continuar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (!motivo.trim()) {
      setError("Debes ingresar el motivo de anulación.");
      return;
    }

    if (!puedeAnularOrden(orden)) {
      setError("Esta orden ya no puede anularse.");
      return;
    }

    setError("");
    setConfirmando(true);
  }

  function confirmarAnulacion() {
    if (procesando || !motivo.trim()) return;

    setProcesando(true);
    setError("");

    try {
      anularOrdenCompra(orden.idOrden, motivo.trim());

      setModalAbierto(false);
      setConfirmando(false);
      setMotivo("");
    } catch (fallo) {
      setError(
        fallo instanceof Error
          ? fallo.message
          : "No se pudo anular la orden de compra."
      );
    } finally {
      setProcesando(false);
    }
  }

  return (
    <section className="anulacion-orden">
      <div className="anulacion-orden__encabezado">
        <div>
          <h3>Anulación de orden de compra</h3>
          <p>
            {anulada
              ? "Consulta la información de la anulación registrada."
              : "Permite detener una compra que ya no se necesita, siempre que no exista recepción de mercadería."}
          </p>
        </div>

        {!anulada && (
          <button
            ref={botonAbrirRef}
            type="button"
            className="anulacion-orden__boton-abrir"
            onClick={abrirModal}
            disabled={!habilitada}
          >
            Anular orden
          </button>
        )}
      </div>

      {orden.anulacion && (
        <div className="anulacion-orden__registro">
          <div className="anulacion-orden__registro-titulo">
            <span className="anulacion-orden__estado">
              Anulada
            </span>
            <span>
              {formatearFecha(orden.anulacion.fecha)}
            </span>
          </div>

          <p>
            <strong>Motivo:</strong>{" "}
            {orden.anulacion.motivo}
          </p>

          <p>
            <strong>Usuario:</strong>{" "}
            {orden.anulacion.usuario}
          </p>
        </div>
      )}

      {!anulada && tieneRecepcion && (
        <p className="anulacion-orden__bloqueo">
          No se puede anular esta orden porque tiene una
          recepción de mercadería registrada.
        </p>
      )}

      {!anulada && !tieneRecepcion && !habilitada && (
        <p className="anulacion-orden__bloqueo">
          Esta orden no se encuentra en un estado anulable.
        </p>
      )}

      {modalAbierto &&
        createPortal(
          <div
            className="anulacion-orden__modal-fondo"
            onMouseDown={(evento) => {
              if (evento.target === evento.currentTarget) {
                cerrarModal();
              }
            }}
          >
            <div
              ref={modalRef}
              className="anulacion-orden__modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="titulo-modal-anulacion"
            >
              <div className="anulacion-orden__modal-encabezado">
                <div className="anulacion-orden__modal-icono">
                  <svg
                    width="30"
                    height="30"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M8 8l8 8M16 8l-8 8" />
                  </svg>
                </div>

                <div className="anulacion-orden__modal-titulos">
                  <h2 id="titulo-modal-anulacion">
                    {confirmando
                      ? "Confirmar anulación"
                      : "Anular orden de compra"}
                  </h2>

                  <p>
                    {confirmando
                      ? "¿Confirmas la anulación de esta orden de compra?"
                      : "Indica el motivo por el cual deseas anular esta orden."}
                  </p>
                </div>
              </div>

              <div className="anulacion-orden__modal-resumen">
                <strong>
                  Orden de compra {orden.numero}
                </strong>

                <div className="anulacion-orden__transicion">
                  <span>{orden.estado}</span>
                  <span className="anulacion-orden__flecha">
                    →
                  </span>
                  <span className="anulacion-orden__nuevo-estado">
                    Anulada
                  </span>
                </div>
              </div>

              {!confirmando ? (
                <form onSubmit={continuar}>
                  <div className="anulacion-orden__campo">
                    <label htmlFor="motivo-anulacion">
                      Motivo de anulación *
                    </label>

                    <textarea
                      id="motivo-anulacion"
                      value={motivo}
                      onChange={(evento) =>
                        setMotivo(evento.target.value)
                      }
                      placeholder="Explica por qué ya no se necesita esta compra..."
                      rows={4}
                      maxLength={1000}
                      required
                      autoFocus
                    />
                  </div>

                  {error && (
                    <p
                      className="anulacion-orden__error"
                      role="alert"
                    >
                      {error}
                    </p>
                  )}

                  <div className="anulacion-orden__modal-acciones">
                    <button
                      ref={botonCancelarRef}
                      type="button"
                      className="anulacion-orden__boton-cancelar"
                      onClick={cerrarModal}
                    >
                      Cancelar
                    </button>

                    <button
                      type="submit"
                      className="anulacion-orden__boton-confirmar"
                      disabled={!motivo.trim()}
                    >
                      Continuar
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="anulacion-orden__confirmacion">
                    <strong>Motivo registrado</strong>
                    <p>{motivo.trim()}</p>
                  </div>

                  <p className="anulacion-orden__modal-aviso">
                    Una vez confirmada, la orden pasará al
                    estado Anulada y el motivo quedará
                    registrado en el historial de cambios.
                  </p>

                  {error && (
                    <p
                      className="anulacion-orden__error"
                      role="alert"
                    >
                      {error}
                    </p>
                  )}

                  <div className="anulacion-orden__modal-acciones">
                    <button
                      ref={botonCancelarRef}
                      type="button"
                      className="anulacion-orden__boton-cancelar"
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
                      className="anulacion-orden__boton-confirmar"
                      onClick={confirmarAnulacion}
                      disabled={procesando}
                    >
                      {procesando
                        ? "Anulando..."
                        : "Confirmar anulación"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>,
          document.body
        )}
    </section>
  );
}
