
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { solicitarAprobacionOrden } from "./solicitudAprobacion";
import "./SolicitudAprobacionOrden.css";

interface Props {
  idOrden: number;
  deshabilitado?: boolean;
}

export default function SolicitudAprobacionOrden({
  idOrden,
  deshabilitado = false,
}: Props) {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const tituloId = useId();
  const descripcionId = useId();
  const botonCancelarRef = useRef<HTMLButtonElement>(null);
  const botonAbrirRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!modalAbierto) return;

    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    botonCancelarRef.current?.focus();

    function manejarTeclado(evento: KeyboardEvent) {
      if (evento.key === "Escape" && !procesando) {
        setModalAbierto(false);
      }

      if (evento.key === "Tab") {
        const controles = [
          botonCancelarRef.current,
          document.getElementById(
            `confirmar-aprobacion-${idOrden}`
          ),
        ].filter(
          (elemento): elemento is HTMLElement =>
            elemento !== null &&
            !elemento.hasAttribute("disabled")
        );

        if (controles.length === 0) return;

        const primero = controles[0];
        const ultimo = controles[controles.length - 1];

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
    }

    document.addEventListener("keydown", manejarTeclado);

    return () => {
      document.body.style.overflow = overflowAnterior;
      document.removeEventListener("keydown", manejarTeclado);
      botonAbrirRef.current?.focus();
    };
  }, [modalAbierto, procesando, idOrden]);

  function abrirModal() {
    if (deshabilitado || procesando) return;

    setError("");
    setMensaje("");
    setModalAbierto(true);
  }

  function cerrarModal() {
    if (procesando) return;
    setModalAbierto(false);
  }

  function confirmarAprobacion() {
    if (procesando || deshabilitado) return;

    setProcesando(true);
    setError("");
    setMensaje("");

    try {
      solicitarAprobacionOrden(idOrden, "Comprador");

      setMensaje(
        "La orden fue enviada a aprobación correctamente."
      );

      setModalAbierto(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo solicitar la aprobación."
      );
    } finally {
      setProcesando(false);
    }
  }

  return (
    <div className="solicitud-aprobacion">
      <button
        ref={botonAbrirRef}
        type="button"
        className="solicitud-aprobacion__boton"
        onClick={abrirModal}
        disabled={deshabilitado || procesando}
      >
        Solicitar aprobación
      </button>

      {mensaje && (
        <p
          className="solicitud-aprobacion__exito"
          role="status"
        >
          {mensaje}
        </p>
      )}

      {error && !modalAbierto && (
        <p
          className="solicitud-aprobacion__error"
          role="alert"
        >
          {error}
        </p>
      )}

      {modalAbierto &&
        createPortal(
          <div
            className="solicitud-aprobacion__overlay"
            onMouseDown={(evento) => {
              if (evento.target === evento.currentTarget) {
                cerrarModal();
              }
            }}
          >
            <div
              className="solicitud-aprobacion__modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby={tituloId}
              aria-describedby={descripcionId}
            >
              <div className="solicitud-aprobacion__modal-encabezado">
                <div className="solicitud-aprobacion__icono">
                  ✓
                </div>

                <div>
                  <h2 id={tituloId}>
                    Solicitar aprobación
                  </h2>

                  <p id={descripcionId}>
                    ¿Deseas enviar esta orden de compra
                    a aprobación?
                  </p>
                </div>
              </div>

              <div className="solicitud-aprobacion__resumen">
                <span className="solicitud-aprobacion__numero">
                  Orden de compra #{idOrden}
                </span>

                <div className="solicitud-aprobacion__transicion">
                  <span>Borrador</span>
                  <span aria-hidden="true">→</span>
                  <strong>Pendiente de aprobación</strong>
                </div>
              </div>

              <p className="solicitud-aprobacion__advertencia">
                Una vez enviada, la orden ya no podrá
                modificarse como borrador.
              </p>

              {error && (
                <p
                  className="solicitud-aprobacion__error"
                  role="alert"
                >
                  {error}
                </p>
              )}

              <div className="solicitud-aprobacion__modal-acciones">
                <button
                  ref={botonCancelarRef}
                  type="button"
                  className="solicitud-aprobacion__cancelar"
                  onClick={cerrarModal}
                  disabled={procesando}
                >
                  Cancelar
                </button>

                <button
                  id={`confirmar-aprobacion-${idOrden}`}
                  type="button"
                  className="solicitud-aprobacion__confirmar"
                  onClick={confirmarAprobacion}
                  disabled={procesando || deshabilitado}
                >
                  {procesando
                    ? "Procesando..."
                    : "Confirmar solicitud"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
