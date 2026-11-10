
import { useState } from "react";
import { useRequisiciones } from "../requisicionesCotizaciones/useRequisiciones";
import type { OrdenCompra } from "./tipos";
import "./DetalleOrdenCompra.css";

const CLAVE_COMPRAS = "erp-compras-estado";

function moneda(valor: number): string {
  return `Bs ${valor.toLocaleString("es-BO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function DetalleOrdenCompra() {
  const { ordenes, ofertas, errorCarga } = useRequisiciones();

  const [idSeleccionado, setIdSeleccionado] = useState("");
  const [ordenActualizada, setOrdenActualizada] =
    useState<OrdenCompra | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const ordenSeleccionada = ordenes.find(
    (orden) => String(orden.idOrden) === idSeleccionado
  );

  const orden =
    ordenActualizada?.idOrden === ordenSeleccionada?.idOrden
      ? ordenActualizada
      : ordenSeleccionada;

  const oferta = ofertas.find(
    (item) => item.idOferta === orden?.idOfertaOrigen
  );

  const proveedor = oferta?.proveedor?.razonSocial ?? "No disponible";

  function seleccionarOrden(valor: string) {
    setIdSeleccionado(valor);
    setOrdenActualizada(null);
    setError("");
  }

  function actualizarDetalle() {
    if (!idSeleccionado) return;

    setCargando(true);
    setError("");

    try {
      const guardado = localStorage.getItem(CLAVE_COMPRAS);

      if (!guardado) {
        throw new Error("No se encontraron datos guardados.");
      }

      const datos: unknown = JSON.parse(guardado);

      if (
        typeof datos !== "object" ||
        datos === null ||
        !("ordenes" in datos) ||
        !Array.isArray(datos.ordenes)
      ) {
        throw new Error("Los datos de órdenes no son válidos.");
      }

      const ordenesGuardadas = datos.ordenes as OrdenCompra[];

      const encontrada = ordenesGuardadas.find(
        (item) => String(item.idOrden) === idSeleccionado
      );

      if (!encontrada) {
        setOrdenActualizada(null);
        throw new Error("La orden seleccionada ya no está disponible.");
      }

      setOrdenActualizada(encontrada);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo actualizar el detalle."
      );
    } finally {
      setCargando(false);
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
            onChange={(e) => seleccionarOrden(e.target.value)}
          >
            <option value="">Selecciona una orden</option>
            {ordenes.map((item) => (
              <option key={item.idOrden} value={item.idOrden}>
                {item.numero}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="detalle-orden__actualizar"
            onClick={actualizarDetalle}
            disabled={!idSeleccionado || cargando}
            title="Volver a consultar los datos guardados de la orden"
            aria-label="Actualizar detalle de la orden"
          >
            ↻
          </button>
        </div>
      </div>

      {(errorCarga || error) && (
        <p className="detalle-orden__error" role="alert">
          {errorCarga || error}
        </p>
      )}

      {cargando && (
        <p role="status">Actualizando información...</p>
      )}

      {!idSeleccionado && !errorCarga && (
        <p className="detalle-orden__vacio">
          Selecciona una orden para consultar sus detalles.
        </p>
      )}

      {idSeleccionado && !orden && !errorCarga && (
        <p className="detalle-orden__error" role="alert">
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
              <strong>{orden.fecha || "No registrada"}</strong>
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
                {orden.detalles.length === 1 ? "línea" : "líneas"}
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
                      <td>{detalle.producto.descripcion}</td>
                      <td>{detalle.cantidad}</td>
                      <td>{moneda(detalle.precio)}</td>
                      <td>{moneda(detalle.subtotal)}</td>
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
        </div>
      )}
    </section>
  );
}
