
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { OrdenCompra } from "../tipos";
import {
  ESTADO_PARA_COMPROMISOS,
  cantidadComprometida,
  fechaHoy,
  registrarCompromiso,
} from "../servicios/compromisosEntrega";

/** Texto del estado de las órdenes que admiten compromisos ("confirmada" o "aprobada"). */
const ESTADO_TEXTO = ESTADO_PARA_COMPROMISOS.toLowerCase();
const ESTADO_PLURAL = `${ESTADO_TEXTO.slice(0, -1)}as`;

interface CompromisosEntregaOrdenProps {
  ordenes: OrdenCompra[];
}

export default function CompromisosEntregaOrden({
  ordenes,
}: CompromisosEntregaOrdenProps) {
  const [idOrden, setIdOrden] = useState("");
  const [idDetalle, setIdDetalle] = useState("");
  const [fechaEntrega, setFechaEntrega] = useState(fechaHoy);
  const [cantidad, setCantidad] = useState("");
  const [observacion, setObservacion] = useState("");
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!mensaje) return;

    const temporizador = window.setTimeout(
      () => setMensaje(""),
      3500
    );

    return () => window.clearTimeout(temporizador);
  }, [mensaje]);

  const confirmadas = ordenes.filter(
    orden => orden.estado === ESTADO_PARA_COMPROMISOS
  );

  const orden = confirmadas.find(
    item => item.idOrden === Number(idOrden)
  );

  const detalle = orden?.detalles.find(
    item => item.idDetalle === Number(idDetalle)
  );

  const comprometida = detalle
    ? cantidadComprometida(detalle)
    : 0;

  const pendiente = detalle
    ? detalle.cantidad - comprometida
    : 0;

  const compromisos =
    orden?.detalles
      .flatMap(linea =>
        (linea.compromisos ?? []).map(compromiso => ({
          linea,
          compromiso,
        }))
      )
      .sort((a, b) =>
        a.compromiso.fechaEntrega.localeCompare(
          b.compromiso.fechaEntrega
        )
      ) ?? [];

  function limpiarAvisos() {
    setError("");
    setMensaje("");
  }

  async function guardar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (guardando) return;
    limpiarAvisos();

    if (!orden || !detalle) {
      setError(
        `Selecciona una orden ${ESTADO_TEXTO} y una de sus líneas.`
      );
      return;
    }

    setGuardando(true);

    try {
      await registrarCompromiso({
        idOrden: orden.idOrden,
        idDetalle: detalle.idDetalle,
        fechaEntrega,
        cantidad,
        observacion,
      });

      setCantidad("");
      setObservacion("");
      setMensaje(
        "Compromiso de entrega registrado correctamente."
      );
    } catch (fallo) {
      setError(
        fallo instanceof Error
          ? fallo.message
          : "No se pudo guardar el compromiso."
      );
    } finally {
      setGuardando(false);
    }
  }

  if (confirmadas.length === 0) {
    return (
      <div className="tarjeta">
        <p>
          No hay órdenes {ESTADO_PLURAL} disponibles para
          programar entregas.
        </p>
      </div>
    );
  }

  return (
    <>
      {ESTADO_PARA_COMPROMISOS === "Aprobada" && (
        <p>
          Las entregas se programan con el proveedor cuando la
          orden está aprobada, antes de enviarla.
        </p>
      )}

      <label className="campo">
        Orden {ESTADO_TEXTO}
        <select
          value={idOrden}
          onChange={evento => {
            setIdOrden(evento.target.value);
            setIdDetalle("");
            setFechaEntrega(fechaHoy());
            setCantidad("");
            setObservacion("");
            limpiarAvisos();
          }}
        >
          <option value="">Selecciona una orden</option>

          {confirmadas.map(item => (
            <option
              key={item.idOrden}
              value={item.idOrden}
            >
              {item.numero}
            </option>
          ))}
        </select>
      </label>

      {orden && (
        <>
          <div className="resumen">
            <strong>{orden.numero}</strong>

            <span>
              Fecha de orden: {orden.fecha}
            </span>

            <span className="etiqueta">
              {orden.estado}
            </span>
          </div>

          <form
            className="tarjeta"
            onSubmit={guardar}
            noValidate
          >
            <h2>Registrar compromiso de entrega</h2>

            <label className="campo">
              Línea de la orden
              <select
                value={idDetalle}
                onChange={evento => {
                  setIdDetalle(evento.target.value);
                  setCantidad("");
                  limpiarAvisos();
                }}
              >
                <option value="">
                  Selecciona una línea
                </option>

                {orden.detalles.map((linea, indice) => (
                  <option
                    key={linea.idDetalle}
                    value={linea.idDetalle}
                  >
                    {indice + 1}.{" "}
                    {linea.producto.descripcion}
                  </option>
                ))}
              </select>
            </label>

            {detalle && (
              <dl className="cantidades">
                <div>
                  <dt>Ordenado</dt>
                  <dd>{detalle.cantidad}</dd>
                </div>

                <div>
                  <dt>Comprometido</dt>
                  <dd>{comprometida}</dd>
                </div>

                <div>
                  <dt>Por programar</dt>
                  <dd>{pendiente}</dd>
                </div>
              </dl>
            )}

            <fieldset
              disabled={!detalle || pendiente <= 0 || guardando}
            >
              <div className="fila-campos">
                <label className="campo">
                  Fecha de entrega
                  <input
                    type="date"
                    value={fechaEntrega}
                    min={
                      orden.fecha > fechaHoy()
                        ? orden.fecha
                        : fechaHoy()
                    }
                    onChange={evento => {
                      setFechaEntrega(evento.target.value);
                      limpiarAvisos();
                    }}
                    required
                  />
                </label>

                <label className="campo">
                  Cantidad
                  <input
                    type="number"
                    min="1"
                    max={Math.max(0, pendiente)}
                    step="1"
                    value={cantidad}
                    onChange={evento => {
                      setCantidad(evento.target.value);
                      limpiarAvisos();
                    }}
                    required
                  />
                </label>
              </div>

              <label className="campo">
                Observación
                <textarea
                  rows={3}
                  value={observacion}
                  onChange={evento => {
                    setObservacion(evento.target.value);
                    limpiarAvisos();
                  }}
                />
              </label>

              <button type="submit">
                {guardando ? "Procesando…" : "Guardar compromiso"}
              </button>
            </fieldset>

            {detalle && pendiente <= 0 && (
              <p>
                Esta línea ya tiene toda su cantidad
                programada.
              </p>
            )}

            {error && (
              <p
                className="alerta alerta--error"
                role="alert"
              >
                {error}
              </p>
            )}

            {mensaje && (
              <p
                className="alerta alerta--exito"
                role="status"
              >
                {mensaje}
              </p>
            )}
          </form>

          <section className="tarjeta">
            <h2>Compromisos registrados</h2>

            {compromisos.length === 0 ? (
              <p>
                Esta orden todavía no tiene
                compromisos de entrega.
              </p>
            ) : (
              <div className="tabla-contenedor">
                <table>
                  <thead>
                    <tr>
                      <th>Línea</th>
                      <th>Producto</th>
                      <th>Fecha de entrega</th>
                      <th>Cantidad</th>
                      <th>Estado</th>
                      <th>Observación</th>
                    </tr>
                  </thead>

                  <tbody>
                    {compromisos.map(
                      ({ linea, compromiso }) => (
                        <tr
                          key={`${linea.idDetalle}-${compromiso.idCompromiso}`}
                        >
                          <td>
                            {orden.detalles.indexOf(linea) + 1}
                          </td>

                          <td>
                            {linea.producto.descripcion}
                          </td>

                          <td>
                            {compromiso.fechaEntrega}
                          </td>

                          <td>
                            {compromiso.cantidad}
                          </td>

                          <td>
                            {compromiso.estado}
                          </td>

                          <td>
                            {compromiso.observacion || "—"}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </>
  );
}
