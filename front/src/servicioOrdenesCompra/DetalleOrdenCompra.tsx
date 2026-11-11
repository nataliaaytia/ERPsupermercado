
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRequisiciones } from "../requisicionesCotizaciones/useRequisiciones";
import HistorialEstadosOrden from "./HistorialEstadosOrden";
import DevolucionOrden from "./DevolucionOrden";
import EnvioOrdenProveedor from "./EnvioOrdenProveedor";
import RespuestaProveedorOrden from "./RespuestaProveedorOrden";
import AnulacionOrden from "./AnulacionOrden";
import { aprobarOrdenCompra } from "./aprobacionOrden";
import "./DetalleOrdenCompra.css";

interface Props {
  idOrdenInicial?: number | null;
}

function moneda(valor: number): string {
  return `Bs ${valor.toLocaleString("es-BO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function DetalleOrdenCompra({
  idOrdenInicial = null,
}: Props) {
  const { ordenes, ofertas, errorCarga } = useRequisiciones();

  const [seleccion, setSeleccion] = useState({
    idOrdenInicial,
    valor: idOrdenInicial === null ? "" : String(idOrdenInicial),
  });

  const idSeleccionado =
    seleccion.idOrdenInicial === idOrdenInicial
      ? seleccion.valor
      : idOrdenInicial === null
        ? ""
        : String(idOrdenInicial);

  const [error, setError] = useState("");
  const [modalAprobacion, setModalAprobacion] = useState(false);

  const botonCancelarRef = useRef<HTMLButtonElement>(null);
  const botonAbrirRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const orden = ordenes.find(
    (item) => String(item.idOrden) === idSeleccionado
  );

  const oferta = ofertas.find(
    (item) => item.idOferta === orden?.idOfertaOrigen
  );

  const proveedor =
    oferta?.proveedor?.razonSocial ?? "No disponible";

  useEffect(() => {
    if (!modalAprobacion) return;

    const elementoAnterior = document.activeElement;
    const overflowAnterior = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    botonCancelarRef.current?.focus();

    function manejarTeclado(evento: KeyboardEvent) {
      if (evento.key === "Escape") {
        evento.preventDefault();
        setModalAprobacion(false);
        return;
      }

      if (evento.key === "Tab") {
        const elementos =
          modalRef.current?.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
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
  }, [modalAprobacion]);

  function seleccionarOrden(valor: string) {
    setSeleccion({ idOrdenInicial, valor });
    setError("");
    setModalAprobacion(false);
  }

  function manejarAprobacion() {
    if (!orden) return;

    try {
      aprobarOrdenCompra(orden.idOrden);
      setError("");
      setModalAprobacion(false);
    } catch (fallo) {
      setError(
        fallo instanceof Error
          ? fallo.message
          : "No se pudo aprobar la orden."
      );
      setModalAprobacion(false);
    }
  }

  return (
    <section className="detalle-orden">
      <div className="detalle-orden__encabezado">
        <div>
          <h2>Detalle de orden de compra</h2>
          <p>Consulta la información de una orden registrada.</p>
        </div>
      </div>

      <div className="detalle-orden__selector">
        <label htmlFor="detalle-orden-select">
          Orden de compra
        </label>

        <div className="detalle-orden__controles">
          <select
            id="detalle-orden-select"
            value={idSeleccionado}
            onChange={(evento) =>
              seleccionarOrden(evento.target.value)
            }
          >
            <option value="">Selecciona una orden</option>

            {ordenes.map((item) => (
              <option
                key={item.idOrden}
                value={item.idOrden}
              >
                {item.numero}
              </option>
            ))}
          </select>
        </div>
      </div>

      {(errorCarga || error) && (
        <p className="detalle-orden__error" role="alert">
          {errorCarga || error}
        </p>
      )}

      {idSeleccionado && !orden && !errorCarga && (
        <p className="detalle-orden__error" role="alert">
          No se encontró la orden solicitada.
        </p>
      )}

      {orden && !errorCarga && (
        <div className="detalle-orden__contenido">
          <div className="detalle-orden__titulo">
            <h3>{orden.numero}</h3>

            <span className="detalle-orden__estado">
              {orden.estado}
            </span>
          </div>

          <div className="detalle-orden__datos">
            <div>
              <span>Proveedor</span>
              <strong>{proveedor}</strong>
            </div>

            <div>
              <span>Oferta de origen</span>
              <strong>
                {orden.idOfertaOrigen
                  ? `#${orden.idOfertaOrigen}`
                  : "No registrada"}
              </strong>
            </div>

            <div>
              <span>Fecha de creación</span>
              <strong>
                {orden.fecha || "No registrada"}
              </strong>
            </div>

            <div>
              <span>Productos</span>
              <strong>{orden.detalles.length}</strong>
            </div>
          </div>

          <div className="detalle-orden__seccion">
            <div className="detalle-orden__seccion-titulo">
              <h3>Productos de la orden</h3>
              <span>
                {orden.detalles.length}{" "}
                {orden.detalles.length === 1
                  ? "línea"
                  : "líneas"}
              </span>
            </div>

            <div className="detalle-orden__tabla-contenedor">
              <table className="detalle-orden__tabla">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Precio unitario</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>

                <tbody>
                  {orden.detalles.map((detalle) => (
                    <tr key={detalle.idDetalle}>
                      <td>
                        {detalle.producto.descripcion}
                      </td>
                      <td>{detalle.cantidad}</td>
                      <td>
                        {moneda(detalle.precio)}
                      </td>
                      <td>
                        {moneda(detalle.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="detalle-orden__total">
              <span>Total de la orden</span>
              <strong>{moneda(orden.total)}</strong>
            </div>
          </div>

          {/* SCRUM-519 - Aprobación y devolución */}
          {orden.estado === "Pendiente de aprobación" && (
            <div className="detalle-orden__seccion">
              <h3>Revisión de la orden</h3>

              <div className="detalle-orden__acciones-revision">
                <button
                  ref={botonAbrirRef}
                  type="button"
                  className="detalle-orden__boton-aprobar"
                  onClick={() =>
                    setModalAprobacion(true)
                  }
                >
                  Aprobar orden
                </button>

                <DevolucionOrden
                  idOrden={orden.idOrden}
                  numeroOrden={orden.numero}
                />
              </div>
            </div>
          )}

          {/* SCRUM-519 - Envío simulado e historial */}
          {(orden.estado === "Aprobada" ||
            orden.estado === "Enviada") && (
            <EnvioOrdenProveedor
              orden={orden}
              proveedor={proveedor}
            />
          )}

          {/* SCRUM-520 - Registro y consulta de respuesta */}
          {(orden.estado === "Enviada" ||
            orden.estado === "Confirmada" ||
            orden.estado === "Rechazada" ||
            Boolean(orden.respuestaProveedor)) && (
            <RespuestaProveedorOrden orden={orden} />
          )}

          {/* SCRUM-521 - Anulación de órdenes de compra */}
          <AnulacionOrden orden={orden} />

          {/* SCRUM-522 - Historial de estados */}
          <HistorialEstadosOrden orden={orden} />
        </div>
      )}

      {modalAprobacion &&
        orden?.estado === "Pendiente de aprobación" &&
        createPortal(
          <div
            className="detalle-orden__modal-fondo"
            onMouseDown={(evento) => {
              if (
                evento.target === evento.currentTarget
              ) {
                setModalAprobacion(false);
              }
            }}
          >
            <div
              ref={modalRef}
              className="detalle-orden__modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="titulo-aprobacion-orden"
              aria-describedby="descripcion-aprobacion-orden"
            >
              <h2 id="titulo-aprobacion-orden">
                Confirmar aprobación
              </h2>

              <p id="descripcion-aprobacion-orden">
                ¿Confirmas la aprobación de la orden{" "}
                <strong>{orden.numero}</strong>?
              </p>

              <p className="detalle-orden__modal-ayuda">
                La orden pasará al estado Aprobada y
                quedará habilitada para su envío al
                proveedor.
              </p>

              <div className="detalle-orden__modal-acciones">
                <button
                  ref={botonCancelarRef}
                  type="button"
                  className="detalle-orden__modal-cancelar"
                  onClick={() =>
                    setModalAprobacion(false)
                  }
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  className="detalle-orden__boton-aprobar"
                  onClick={manejarAprobacion}
                >
                  Confirmar aprobación
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </section>
  );
}
