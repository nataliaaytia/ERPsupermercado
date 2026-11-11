
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { devolverOrdenParaCorreccion } from "./gestionDevolucionOrden";
import "./DevolucionOrden.css";

interface Props {
  idOrden: number;
  numeroOrden: string;
}

export default function DevolucionOrden({
  idOrden,
  numeroOrden,
}: Props) {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState("");

  const tituloId = useId();
  const descripcionId = useId();
  const motivoId = useId();

  const botonAbrirRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const motivoRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!modalAbierto) return;

    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    motivoRef.current?.focus();

    function manejarTeclado(evento: KeyboardEvent) {
      if (evento.key === "Escape" && !procesando) {
        evento.preventDefault();
        setModalAbierto(false);
        return;
      }

      if (evento.key !== "Tab") return;

      const controles = Array.from(
        modalRef.current?.querySelectorAll<HTMLElement>(
          'button:not(:disabled), textarea:not(:disabled)'
        ) ?? []
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

    document.addEventListener("keydown", manejarTeclado);

    return () => {
      document.body.style.overflow = overflowAnterior;
      document.removeEventListener("keydown", manejarTeclado);
      botonAbrirRef.current?.focus();
    };
  }, [modalAbierto, procesando]);

  function abrirModal() {
    if (procesando) return;

    setMotivo("");
    setError("");
    setModalAbierto(true);
  }

  function cerrarModal() {
    if (procesando) return;

    setModalAbierto(false);
    setMotivo("");
    setError("");
  }

  function confirmarDevolucion(
    evento: React.FormEvent<HTMLFormElement>
  ) {
    evento.preventDefault();

    if (procesando) return;

    const motivoValidado = motivo.trim();

    if (!motivoValidado) {
      setError("Debes ingresar el motivo de devolución.");
      motivoRef.current?.focus();
      return;
    }

    setProcesando(true);
    setError("");

    try {
      devolverOrdenParaCorreccion(
        idOrden,
        motivoValidado,
        "Jefe de compras"
      );

      setModalAbierto(false);
      setMotivo("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo devolver la orden."
      );
    } finally {
      setProcesando(false);
    }
  }

  return (
    <div className="devolucion-orden">
      <button
        ref={botonAbrirRef}
        type="button"
        className="devolucion-orden__boton"
        onClick={abrirModal}
        disabled={procesando}
      >
        Devolver para corrección
      </button>

      {modalAbierto &&
        createPortal(
          <div
            className="devolucion-orden__fondo"
            onMouseDown={(evento) => {
              if (evento.target === evento.currentTarget) {
                cerrarModal();
              }
            }}
          >
            <div
              ref={modalRef}
              className="devolucion-orden__modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby={tituloId}
              aria-describedby={descripcionId}
            >
              <div className="devolucion-orden__encabezado">
                <div className="devolucion-orden__icono">
                  ↩
                </div>

                <div>
                  <h3 id={tituloId}>
                    Devolver orden para corrección
                  </h3>

                  <p id={descripcionId}>
                    Indica las correcciones necesarias
                    antes de aprobar esta orden.
                  </p>
                </div>
              </div>

              <form onSubmit={confirmarDevolucion}>
                <div className="devolucion-orden__informacion">
                  <strong>{numeroOrden}</strong>

                  <div className="devolucion-orden__transicion">
                    <span>Pendiente de aprobación</span>
                    <span aria-hidden="true">→</span>
                    <strong>Borrador</strong>
                  </div>
                </div>

                <div className="devolucion-orden__campo">
                  <label htmlFor={motivoId}>
                    Motivo de devolución
                    <span aria-hidden="true"> *</span>
                  </label>

                  <textarea
                    ref={motivoRef}
                    id={motivoId}
                    value={motivo}
                    onChange={(evento) => {
                      setMotivo(evento.target.value);
                      if (error) setError("");
                    }}
                    placeholder="Describe las correcciones necesarias..."
                    rows={4}
                    maxLength={500}
                    required
                    disabled={procesando}
                  />

                  <small>
                    {motivo.length}/500 caracteres
                  </small>
                </div>

                <p className="devolucion-orden__advertencia">
                  La orden volverá a estado Borrador y
                  podrá editarse nuevamente. El motivo
                  quedará registrado en el historial.
                </p>

                {error && (
                  <p
                    className="devolucion-orden__error"
                    role="alert"
                  >
                    {error}
                  </p>
                )}

                <div className="devolucion-orden__acciones">
                  <button
                    type="button"
                    className="devolucion-orden__cancelar"
                    onClick={cerrarModal}
                    disabled={procesando}
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="devolucion-orden__confirmar"
                    disabled={!motivo.trim() || procesando}
                  >
                    {procesando
                      ? "Procesando..."
                      : "Confirmar devolución"}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
