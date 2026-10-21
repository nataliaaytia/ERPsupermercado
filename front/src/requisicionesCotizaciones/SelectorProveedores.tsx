
import { useState } from "react";
import type { Dispatch } from "react";

import type {
  AccionCompras,
  EstadoCompras,
} from "./modeloCompras";
import type { ProveedorReferencia } from "./tipos";

import { codigoRequisicion } from "./formatoRequisicion";
import { fechaHoy } from "./useRequisiciones";
import ListaOfertasProveedor from "./ListaOfertasProveedor";
import GenerarSolicitudCotizacion from "./GenerarSolicitudCotizacion";
import AsociarProveedores from "./AsociarProveedores";
import RegistrarOfertaProveedor from "./RegistrarOfertaProveedor";

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
  const [solicitudId, setSolicitudId] = useState(
    solicitudInicialId === null
      ? ""
      : String(solicitudInicialId),
  );

  const [filtroEstado, setFiltroEstado] = useState("Todas");

  const hoy = fechaHoy();

  const solicitudesFiltradas = estado.solicitudes.filter(
    s =>
      filtroEstado === "Todas" ||
      s.estado === filtroEstado,
  );

  const estadosDisponibles = [
    ...new Set(estado.solicitudes.map(s => s.estado)),
  ];

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

  const solicitudEnviada =
    solicitud?.estado === "Enviada";

  const puedeOfertar =
    solicitudEnviada &&
    solicitud !== undefined &&
    solicitud.fechaLimite >= hoy &&
    !adjudicada;

  const cambiarSolicitud = (id: string) => {
    setSolicitudId(id);
  };

  const cambiarFiltroEstado = (nuevoEstado: string) => {
    setFiltroEstado(nuevoEstado);
    setSolicitudId("");
  };

  return (
    <div className="selector-proveedores">
      <GenerarSolicitudCotizacion
        requisiciones={estado.requisiciones}
        hoy={hoy}
        dispatch={dispatch}
      />

      <h2>Solicitudes de cotización</h2>

      <p>
        Selecciona una solicitud para consultar sus productos,
        asociar proveedores y registrar sus ofertas.
      </p>

      <label>
        Filtrar por estado

        <select
          value={filtroEstado}
          onChange={e =>
            cambiarFiltroEstado(e.target.value)
          }
        >
          <option value="Todas">Todas</option>

          {estadosDisponibles.map(estadoSolicitud => (
            <option
              key={estadoSolicitud}
              value={estadoSolicitud}
            >
              {estadoSolicitud}
            </option>
          ))}
        </select>
      </label>

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

          {solicitudesFiltradas.map(s => (
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

      {estado.solicitudes.length > 0 &&
        solicitudesFiltradas.length === 0 && (
          <p className="selector-proveedores-vacio">
            No hay solicitudes de cotización con el estado
            seleccionado.
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
                className={`selector-proveedores-estado selector-proveedores-estado--${solicitud.estado.toLowerCase()}`}
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
              <strong>
                Proveedores asociados correctamente
              </strong>

              <p>
                Los siguientes proveedores quedaron asociados
                a esta solicitud de cotización.
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
            <AsociarProveedores
              key={solicitud.idSolicitud}
              proveedores={proveedores}
              solicitud={solicitud}
              hoy={hoy}
              dispatch={dispatch}
            />
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
            <RegistrarOfertaProveedor
              key={solicitud.idSolicitud}
              solicitud={solicitud}
              requisicion={requisicion}
              invitados={invitados}
              ofertas={ofertas}
              hoy={hoy}
              dispatch={dispatch}
            />
          )}

          <ListaOfertasProveedor
            ofertas={ofertas}
            solicitudEnviada={solicitudEnviada}
            adjudicada={adjudicada}
            hoy={hoy}
            dispatch={dispatch}
          />
        </>
      )}
    </div>
  );
}
