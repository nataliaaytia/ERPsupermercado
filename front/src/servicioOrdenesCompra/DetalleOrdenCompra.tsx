
import { useState } from "react";
import { useRequisiciones } from "../requisicionesCotizaciones/useRequisiciones";
import HistorialEstadosOrden from "./HistorialEstadosOrden";
import DevolucionOrden from "./DevolucionOrden";
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

  const [idSeleccionado, setIdSeleccionado] = useState(
    idOrdenInicial === null ? "" : String(idOrdenInicial)
  );

  const [error, setError] = useState("");

  const orden = ordenes.find(
    (item) => String(item.idOrden) === idSeleccionado
  );

  const oferta = ofertas.find(
    (item) => item.idOferta === orden?.idOfertaOrigen
  );

  const proveedor =
    oferta?.proveedor?.razonSocial ?? "No disponible";

  function seleccionarOrden(valor: string) {
    setIdSeleccionado(valor);
    setError("");
  }

  return (
    <section className="detalle-orden">
      <div className="detalle-orden__encabezado">
        <div>
          <h2>Detalle de orden de compra</h2>
          <p>
            Consulta la información de una orden registrada.
          </p>
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
            <option value="">
              Selecciona una orden
            </option>

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
        <p
          className="detalle-orden__error"
          role="alert"
        >
          {errorCarga || error}
        </p>
      )}

      {idSeleccionado && !orden && !errorCarga && (
        <p
          className="detalle-orden__error"
          role="alert"
        >
          No se encontró la orden solicitada.
        </p>
      )}

      {orden && !errorCarga && !error && (
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
              <strong>
                {orden.detalles.length}
              </strong>
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

                      <td>
                        {detalle.cantidad}
                      </td>

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
              <span>
                Total de la orden
              </span>

              <strong>
                {moneda(orden.total)}
              </strong>
            </div>
          </div>

          {orden.estado === "Pendiente de aprobación" && (
            <DevolucionOrden
              idOrden={orden.idOrden}
              numeroOrden={orden.numero}
            />
          )}

          <HistorialEstadosOrden orden={orden} />
        </div>
      )}
    </section>
  );
}
