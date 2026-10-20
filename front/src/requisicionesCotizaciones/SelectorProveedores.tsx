import { useState } from "react";
import type { Dispatch } from "react";

import type {
  AccionCompras,
  EstadoCompras,
} from "./modeloCompras";
import type { ProveedorReferencia } from "./tipos";

import { codigoRequisicion } from "./formatoRequisicion";
import { fechaHoy } from "./useRequisiciones";

import "./SelectorProveedores.css";

interface Props {
  proveedores: ProveedorReferencia[];
  estado: EstadoCompras;
  dispatch: Dispatch<AccionCompras>;
  solicitudInicialId?: number | null;
}

const codigoCotizacion = (idSolicitud: number) =>
  `COT-${String(idSolicitud).padStart(4, "0")}`;

export default function SelectorProveedores({
  proveedores,
  estado,
  dispatch,
  solicitudInicialId = null,
}: Props) {
  const [requisicionId, setRequisicionId] = useState("");
  const [fechaLimite, setFechaLimite] = useState("");
  const [solicitudId, setSolicitudId] = useState(
    solicitudInicialId === null
      ? ""
      : String(solicitudInicialId),
  );

  const [seleccionados, setSeleccionados] =
    useState<number[]>([]);

  const [proveedorId, setProveedorId] = useState("");
  const [validez, setValidez] = useState("");

  const [precios, setPrecios] =
    useState<Record<number, string>>({});

  const [plazos, setPlazos] =
    useState<Record<number, string>>({});

  const [busqueda, setBusqueda] = useState("");

  const hoy = fechaHoy();

  const aprobadas = estado.requisiciones.filter(
    r => r.estado === "Aprobada",
  );

  const solicitud = estado.solicitudes.find(
    s => s.idSolicitud === Number(solicitudId),
  );

  const requisicion = estado.requisiciones.find(
    r => r.idRequisicion === solicitud?.requisicion,
  );

  const activos = proveedores.filter(
    p => p.estado === "Activo",
  );

  const proveedoresVisibles = activos.filter(p => {
    const texto = busqueda.trim().toLowerCase();

    return (
      p.razonSocial.toLowerCase().includes(texto) ||
      p.nitRuc.includes(texto)
    );
  });

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

  const solicitudEnviada =
    solicitud?.estado === "Enviada";

  const puedeOfertar =
    solicitudEnviada &&
    solicitud !== undefined &&
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

  const cambiarSeleccion = (idProveedor: number) => {
    if (solicitud?.estado !== "Generada") return;

    setSeleccionados(actuales =>
      actuales.includes(idProveedor)
        ? actuales.filter(id => id !== idProveedor)
        : [...actuales, idProveedor],
    );
  };

  const asociarProveedores = () => {
    if (
      solicitud?.estado !== "Generada" ||
      seleccionados.length === 0
    ) {
      return;
    }

    // Si algún proveedor dejó de estar activo,
    // el reductor rechazará la operación completa.
    const seleccion = proveedores.filter(p =>
      seleccionados.includes(p.idProveedor),
    );

    if (seleccion.length !== seleccionados.length) {
      return;
    }

    dispatch({
      tipo: "enviar",
      id: solicitud.idSolicitud,
      proveedores: seleccion,
      hoy,
    });
  };

  const registrarOferta = () => {
    const proveedor = invitados.find(
      p => p.idProveedor === Number(proveedorId),
    );

    if (
      !puedeOfertar ||
      !solicitud ||
      !requisicion ||
      !proveedor
    ) {
      return;
    }

    dispatch({
      tipo: "registrarOferta",
      solicitud: solicitud.idSolicitud,
      proveedor,
      validez,
      hoy,
      detalles: requisicion.detalles.map((detalle, i) => ({
        idDetalle: i + 1,
        producto: detalle.producto,
        precio: Number(
          precios[detalle.producto.idProducto] ?? "",
        ),
        plazoEntrega: Number(
          plazos[detalle.producto.idProducto] ?? "",
        ),
      })),
    });
  };

  return (
    <div className="selector-proveedores">
      <h2>Generar solicitud de cotización</h2>

      {aprobadas.length === 0 && (
        <p className="selector-proveedores-vacio">
          Primero debes aprobar una requisición.
        </p>
      )}

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

          {aprobadas.map(r => (
            <option
              key={r.idRequisicion}
              value={r.idRequisicion}
            >
              {codigoRequisicion(r.idRequisicion)}
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

      <h2>Solicitudes de cotización</h2>

      <p>
        Selecciona una solicitud para consultar sus productos,
        asociar proveedores y registrar sus ofertas.
      </p>

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
              {codigoCotizacion(s.idSolicitud)}
              {" · "}
              {codigoRequisicion(s.requisicion)}
              {" · "}
              {s.estado}
            </option>
          ))}
        </select>
      </label>

      {estado.solicitudes.length === 0 && (
        <p className="selector-proveedores-vacio">
          Todavía no hay solicitudes de cotización.
          Genera una desde una requisición aprobada.
        </p>
      )}

      {solicitud && requisicion && (
        <>
          <div className="selector-proveedores-resumen">
            <div className="selector-proveedores-encabezado">
              <div>
                <strong>
                  {codigoCotizacion(solicitud.idSolicitud)}
                </strong>

                <p>
                  Requisición vinculada:{" "}
                  {codigoRequisicion(
                    requisicion.idRequisicion,
                  )}
                </p>
              </div>

              <span
                className={
                  solicitudEnviada
                    ? "selector-proveedores-estado enviado"
                    : "selector-proveedores-estado"
                }
              >
                {solicitud.estado}
              </span>
            </div>

            <p>
              Solicitante: {requisicion.solicitante}
            </p>

            <p>Fecha: {solicitud.fecha}</p>

            <p>
              Fecha límite: {solicitud.fechaLimite}
            </p>

            <strong>Productos solicitados</strong>

            <ul>
              {requisicion.detalles.map(detalle => (
                <li key={detalle.idDetalle}>
                  {detalle.producto.descripcion}
                  {" × "}
                  {detalle.cantidad}
                </li>
              ))}
            </ul>
          </div>

          {solicitudEnviada && (
            <div className="selector-proveedores-confirmacion">
              <strong>Proveedores asociados</strong>

              <p>
                Esta solicitud fue marcada como enviada.
              </p>

              <ul>
                {solicitud.proveedoresIds.map(id => (
                  <li key={id}>
                    {proveedores.find(
                      p => p.idProveedor === id,
                    )?.razonSocial ?? `Proveedor ${id}`}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {solicitud.estado === "Generada" && (
            <>
              <h3>Proveedores disponibles</h3>

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
                {proveedoresVisibles.length === 0 ? (
                  <p>
                    No se encontraron proveedores disponibles.
                  </p>
                ) : (
                  proveedoresVisibles.map(proveedor => (
                    <label
                      key={proveedor.idProveedor}
                      className="selector-proveedor"
                    >
                      <input
                        type="checkbox"
                        checked={seleccionados.includes(
                          proveedor.idProveedor,
                        )}
                        onChange={() =>
                          cambiarSeleccion(
                            proveedor.idProveedor,
                          )
                        }
                      />

                      <span>
                        <strong>
                          {proveedor.razonSocial}
                        </strong>

                        <small>
                          NIT/RUC: {proveedor.nitRuc}
                        </small>
                      </span>
                    </label>
                  ))
                )}
              </div>

              <div className="selector-proveedores-acciones">
                <p>
                  Proveedores seleccionados:{" "}
                  {seleccionados.length}
                </p>

                <button
                  type="button"
                  className="selector-proveedores-boton"
                  disabled={
                    seleccionados.length === 0 ||
                    solicitud.fechaLimite < hoy
                  }
                  onClick={asociarProveedores}
                >
                  Asociar proveedores y marcar como enviada
                </button>
              </div>

              {solicitud.fechaLimite < hoy && (
                <p role="alert">
                  La fecha límite de esta solicitud ya venció.
                </p>
              )}
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

          {puedeOfertar && (
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

                  {invitados.map(proveedor => (
                    <option
                      key={proveedor.idProveedor}
                      value={proveedor.idProveedor}
                    >
                      {proveedor.razonSocial}
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

              {requisicion.detalles.map(detalle => (
                <fieldset key={detalle.idDetalle}>
                  <legend>
                    {detalle.producto.descripcion}
                    {" · "}
                    Cantidad: {detalle.cantidad}
                  </legend>

                  <label>
                    Precio unitario (Bs)

                    <input
                      className="formulario-requisicion__input"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={
                        precios[
                        detalle.producto.idProducto
                        ] ?? ""
                      }
                      onChange={e =>
                        setPrecios(actuales => ({
                          ...actuales,
                          [detalle.producto.idProducto]:
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
                        plazos[
                        detalle.producto.idProducto
                        ] ?? ""
                      }
                      onChange={e =>
                        setPlazos(actuales => ({
                          ...actuales,
                          [detalle.producto.idProducto]:
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

          {ofertas.length === 0 && (
            <p>Todavía no hay ofertas.</p>
          )}

          {ofertas.map(oferta => (
            <article
              key={oferta.idOferta}
              className="selector-proveedores-resumen"
            >
              <strong>
                OF-{String(oferta.idOferta).padStart(4, "0")}
                {" · "}
                {oferta.proveedor.razonSocial}
                {" · "}
                {oferta.estado}
              </strong>

              <p>
                Fecha: {oferta.fecha}
                {" · "}
                Válida hasta: {oferta.validez}
              </p>

              <ul>
                {oferta.detalles.map(detalle => (
                  <li key={detalle.idDetalle}>
                    {detalle.producto.descripcion}
                    {": Bs "}
                    {detalle.precio.toFixed(2)}
                    {" · "}
                    {detalle.plazoEntrega} días
                  </li>
                ))}
              </ul>

              {oferta.estado === "Registrada" &&
                solicitudEnviada && (
                  <div className="selector-proveedores-acciones">
                    <button
                      type="button"
                      disabled={
                        adjudicada ||
                        oferta.validez < hoy
                      }
                      onClick={() =>
                        dispatch({
                          tipo: "seleccionar",
                          id: oferta.idOferta,
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
                          id: oferta.idOferta,
                          hoy,
                        })
                      }
                    >
                      Rechazar oferta
                    </button>
                  </div>
                )}
            </article>
          ))}
        </>
      )}
    </div>
  );
}