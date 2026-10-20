import { useState } from "react";
import type { Dispatch } from "react";
import type {
  AccionCompras,
  EstadoCompras,
} from "./modeloCompras";
import type { ProveedorReferencia } from "./tipos";
import { fechaHoy } from "./useRequisiciones";
import "./SelectorProveedores.css";

interface Props {
  proveedores: ProveedorReferencia[];
  estado: EstadoCompras;
  dispatch: Dispatch<AccionCompras>;
}

export default function SelectorProveedores({
  proveedores,
  estado,
  dispatch,
}: Props) {
  const [requisicionId, setRequisicionId] = useState("");
  const [fechaLimite, setFechaLimite] = useState("");
  const [solicitudId, setSolicitudId] = useState("");
  const [seleccionados, setSeleccionados] =
    useState<number[]>([]);
  const [proveedorId, setProveedorId] = useState("");
  const [validez, setValidez] = useState("");
  const [precios, setPrecios] =
    useState<Record<number, string>>({});
  const [plazos, setPlazos] =
    useState<Record<number, string>>({});
  const [busqueda, setBusqueda] = useState("");

  const solicitud = estado.solicitudes.find(
    s => s.idSolicitud === Number(solicitudId),
  );

  const requisicion = estado.requisiciones.find(
    r => r.idRequisicion === solicitud?.requisicion,
  );

  const activos = proveedores.filter(
    p => p.estado === "Activo",
  );

  const invitados = activos.filter(
    p =>
      solicitud?.proveedoresIds.includes(
        p.idProveedor,
      ),
  );

  const ofertas = estado.ofertas.filter(
    o => o.solicitud === solicitud?.idSolicitud,
  );

  const adjudicada = ofertas.some(
    o => o.estado === "Seleccionada",
  );

  const hoy = fechaHoy();

  const puedeOfertar =
    solicitud?.estado === "Enviada" &&
    solicitud.fechaLimite >= hoy &&
    !adjudicada;

  const cambiarSolicitud = (id: string) => {
    setSolicitudId(id);
    setSeleccionados([]);
    setProveedorId("");
    setValidez("");
    setPrecios({});
    setPlazos({});
    setBusqueda("");
  };

  const registrarOferta = () => {
    const proveedor = invitados.find(
      p => p.idProveedor === Number(proveedorId),
    );

    if (!solicitud || !requisicion || !proveedor) {
      return;
    }

    dispatch({
      tipo: "registrarOferta",
      solicitud: solicitud.idSolicitud,
      proveedor,
      validez,
      hoy,
      detalles: requisicion.detalles.map((d, i) => ({
        idDetalle: i + 1,
        producto: d.producto,
        precio: Number(
          precios[d.producto.idProducto] ?? "",
        ),
        plazoEntrega: Number(
          plazos[d.producto.idProducto] ?? "",
        ),
      })),
    });
  };

  return (
    <div className="selector-proveedores">
      <h2>Generar solicitud de cotización</h2>

      <label>
        Requisición aprobada

        <select
          value={requisicionId}
          onChange={e =>
            setRequisicionId(e.target.value)
          }
        >
          <option value="">
            Seleccionar requisición
          </option>

          {estado.requisiciones
            .filter(r => r.estado === "Aprobada")
            .map(r => (
              <option
                key={r.idRequisicion}
                value={r.idRequisicion}
              >
                REQ-{r.idRequisicion}
                {" · "}
                {r.observacion}
              </option>
            ))}
        </select>
      </label>

      <label>
        Fecha límite

        <input
          className="formulario-requisicion__input"
          type="date"
          min={hoy}
          value={fechaLimite}
          onChange={e =>
            setFechaLimite(e.target.value)
          }
        />
      </label>

      <button
        type="button"
        className="selector-proveedores-boton"
        disabled={!requisicionId || !fechaLimite}
        onClick={() =>
          dispatch({
            tipo: "generar",
            requisicion: Number(requisicionId),
            fechaLimite,
            hoy,
          })
        }
      >
        Generar solicitud
      </button>

      <h2>Solicitudes y proveedores</h2>

      <label>
        Solicitud de cotización

        <select
          value={solicitudId}
          onChange={e =>
            cambiarSolicitud(e.target.value)
          }
        >
          <option value="">
            Seleccionar solicitud
          </option>

          {estado.solicitudes.map(s => (
            <option
              key={s.idSolicitud}
              value={s.idSolicitud}
            >
              SOL-{s.idSolicitud}
              {" · "}
              REQ-{s.requisicion}
              {" · "}
              {s.estado}
            </option>
          ))}
        </select>
      </label>

      {solicitud && (
        <>
          <p>
            Fecha: {solicitud.fecha}
            {" · "}
            Límite: {solicitud.fechaLimite}
            {" · "}
            {solicitud.estado}
          </p>

          <p>
            Destinatarios:{" "}
            {solicitud.proveedoresIds
              .map(
                id =>
                  proveedores.find(
                    p => p.idProveedor === id,
                  )?.razonSocial ??
                  `Proveedor ${id}`,
              )
              .join(", ") || "Sin asignar"}
          </p>

          {solicitud.estado === "Generada" && (
            <>
              <input
                type="search"
                placeholder="Buscar por razón social o NIT"
                aria-label="Buscar proveedores"
                value={busqueda}
                onChange={e =>
                  setBusqueda(e.target.value)
                }
              />

              <div className="selector-proveedores-lista">
                {activos
                  .filter(p =>
                    `${p.razonSocial} ${p.nitRuc}`
                      .toLowerCase()
                      .includes(busqueda.toLowerCase()),
                  )
                  .map(p => (
                    <label
                      key={p.idProveedor}
                      className="selector-proveedor"
                    >
                      <input
                        type="checkbox"
                        checked={seleccionados.includes(
                          p.idProveedor,
                        )}
                        onChange={() =>
                          setSeleccionados(ids =>
                            ids.includes(p.idProveedor)
                              ? ids.filter(
                                id =>
                                  id !== p.idProveedor,
                              )
                              : [...ids, p.idProveedor],
                          )
                        }
                      />

                      <span>
                        <strong>
                          {p.razonSocial}
                        </strong>
                        <small>{p.nitRuc}</small>
                      </span>
                    </label>
                  ))}
              </div>

              <button
                type="button"
                className="selector-proveedores-boton"
                disabled={!seleccionados.length}
                onClick={() =>
                  dispatch({
                    tipo: "enviar",
                    id: solicitud.idSolicitud,
                    proveedores: activos.filter(p =>
                      seleccionados.includes(
                        p.idProveedor,
                      ),
                    ),
                    hoy,
                  })
                }
              >
                Confirmar proveedores y marcar como enviada
              </button>
            </>
          )}

          {solicitud.estado !== "Cancelada" &&
            !adjudicada && (
              <button
                type="button"
                onClick={() =>
                  dispatch({
                    tipo: "cancelar",
                    id: solicitud.idSolicitud,
                  })
                }
              >
                Cancelar solicitud
              </button>
            )}

          {puedeOfertar && requisicion && (
            <>
              <h2>Registrar oferta del proveedor</h2>

              <label>
                Proveedor invitado

                <select
                  value={proveedorId}
                  onChange={e =>
                    setProveedorId(e.target.value)
                  }
                >
                  <option value="">
                    Seleccionar proveedor
                  </option>

                  {invitados.map(p => (
                    <option
                      key={p.idProveedor}
                      value={p.idProveedor}
                    >
                      {p.razonSocial}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Oferta válida hasta

                <input
                  className="formulario-requisicion__input"
                  type="date"
                  min={hoy}
                  value={validez}
                  onChange={e =>
                    setValidez(e.target.value)
                  }
                />
              </label>

              {requisicion.detalles.map(d => (
                <fieldset key={d.idDetalle}>
                  <legend>
                    {d.producto.descripcion}
                    {" · "}
                    Cantidad: {d.cantidad}
                  </legend>

                  <label>
                    Precio unitario (Bs)

                    <input
                      className="formulario-requisicion__input"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={
                        precios[d.producto.idProducto] ??
                        ""
                      }
                      onChange={e =>
                        setPrecios(p => ({
                          ...p,
                          [d.producto.idProducto]:
                            e.target.value,
                        }))
                      }
                    />
                  </label>

                  <label>
                    Plazo de entrega (días)

                    <input
                      className="formulario-requisicion__input"
                      type="number"
                      min="1"
                      step="1"
                      value={
                        plazos[d.producto.idProducto] ??
                        ""
                      }
                      onChange={e =>
                        setPlazos(p => ({
                          ...p,
                          [d.producto.idProducto]:
                            e.target.value,
                        }))
                      }
                    />
                  </label>
                </fieldset>
              ))}

              <button
                type="button"
                className="selector-proveedores-boton"
                disabled={!proveedorId || !validez}
                onClick={registrarOferta}
              >
                Registrar oferta
              </button>
            </>
          )}

          <h2>Ofertas recibidas</h2>

          {!ofertas.length && (
            <p>Todavía no hay ofertas.</p>
          )}

          {ofertas.map(o => (
            <article
              key={o.idOferta}
              className="selector-proveedores-resumen"
            >
              <strong>
                OF-{o.idOferta}
                {" · "}
                {o.proveedor.razonSocial}
                {" · "}
                {o.estado}
              </strong>

              <p>
                Fecha: {o.fecha}
                {" · "}
                Válida hasta: {o.validez}
              </p>

              <ul>
                {o.detalles.map(d => (
                  <li key={d.idDetalle}>
                    {d.producto.descripcion}
                    {": Bs "}
                    {d.precio.toFixed(2)}
                    {" · "}
                    {d.plazoEntrega} días
                  </li>
                ))}
              </ul>

              {o.estado === "Registrada" &&
                solicitud.estado === "Enviada" && (
                  <>
                    <button
                      type="button"
                      disabled={
                        adjudicada ||
                        o.validez < hoy
                      }
                      onClick={() =>
                        dispatch({
                          tipo: "seleccionar",
                          id: o.idOferta,
                          hoy,
                        })
                      }
                    >
                      Seleccionar oferta
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        dispatch({
                          tipo: "rechazar",
                          id: o.idOferta,
                          hoy,
                        })
                      }
                    >
                      Rechazar oferta
                    </button>
                  </>
                )}
            </article>
          ))}
        </>
      )}
    </div>
  );
}