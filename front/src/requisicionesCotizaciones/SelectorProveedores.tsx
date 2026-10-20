
import { useState } from "react";

import type { Proveedor } from "../catalogo/tipos";
import type {
  Requisicion,
  SolicitudCotizacion,
} from "./tipos";

import { codigoRequisicion } from "./formatoRequisicion";
import "./SelectorProveedores.css";

interface SelectorProveedoresProps {
  proveedores: Proveedor[];
  requisiciones: Requisicion[];
  solicitudes: SolicitudCotizacion[];
  solicitudInicialId?: number | null;
  onAsociar: (
    idSolicitud: number,
    idsProveedores: number[]
  ) => void;
}

// COT diferencia las solicitudes de cotización de las
// requisiciones (REQ). El código es visual y mantenemos
// el identificador numérico para el backend.
const codigoCotizacion = (idSolicitud: number) =>
  `COT-${String(idSolicitud).padStart(4, "0")}`;

export default function SelectorProveedores({
  proveedores,
  requisiciones,
  solicitudes,
  solicitudInicialId = null,
  onAsociar,
}: SelectorProveedoresProps) {
  const [busqueda, setBusqueda] = useState("");
  const [idSolicitud, setIdSolicitud] =
    useState<number | null>(solicitudInicialId);

  const [seleccionados, setSeleccionados] =
    useState<number[]>([]);

  const [error, setError] = useState("");

  const solicitudesDisponibles = solicitudes.filter(
    (solicitud) =>
      solicitud.estado !== "Cancelada" &&
      requisiciones.some(
        (requisicion) =>
          requisicion.idRequisicion === solicitud.requisicion &&
          requisicion.estado === "Aprobada"
      )
  );

  const solicitudSeleccionada = solicitudesDisponibles.find(
    (solicitud) => solicitud.idSolicitud === idSolicitud
  );

  const requisicionSeleccionada = requisiciones.find(
    (requisicion) =>
      requisicion.idRequisicion ===
      solicitudSeleccionada?.requisicion
  );

  const solicitudEnviada =
    solicitudSeleccionada?.estado === "Enviada";

  const idsAsociados =
    solicitudSeleccionada?.proveedoresIds ?? [];

  const proveedoresValidos = proveedores.filter(
    (proveedor) =>
      proveedor.estado === "Activo" &&
      (proveedor.razonSocial
        .toLowerCase()
        .includes(busqueda.trim().toLowerCase()) ||
        proveedor.nitRuc.includes(busqueda.trim()))
  );

  const cambiarSolicitud = (valor: string) => {
    const id = valor === "" ? null : Number(valor);

    setIdSolicitud(id);
    setSeleccionados([]);
    setBusqueda("");
    setError("");
  };

  const cambiarSeleccion = (idProveedor: number) => {
    if (
      !solicitudSeleccionada ||
      solicitudEnviada
    ) {
      return;
    }

    setSeleccionados((actuales) =>
      actuales.includes(idProveedor)
        ? actuales.filter((id) => id !== idProveedor)
        : [...actuales, idProveedor]
    );

    setError("");
  };

  const asociarProveedores = () => {
    if (
      !solicitudSeleccionada ||
      solicitudSeleccionada.estado !== "Generada"
    ) {
      setError("Selecciona una solicitud generada.");
      return;
    }

    if (seleccionados.length === 0) {
      setError("Selecciona al menos un proveedor.");
      return;
    }

    const idsValidos = seleccionados.filter((id) =>
      proveedores.some(
        (proveedor) =>
          proveedor.idProveedor === id &&
          proveedor.estado === "Activo"
      )
    );

    if (idsValidos.length !== seleccionados.length) {
      setError(
        "La selección contiene proveedores que ya no están activos."
      );
      return;
    }

    setError("");

    onAsociar(
      solicitudSeleccionada.idSolicitud,
      [...new Set(idsValidos)]
    );
  };

  return (
    <div className="selector-proveedores">
      <h2>Solicitudes de cotización</h2>

      <p>
        Selecciona una solicitud para consultar sus
        productos y asociar los proveedores que participarán.
      </p>

      <label htmlFor="solicitud-cotizacion">
        Solicitud de cotización
      </label>

      <select
        id="solicitud-cotizacion"
        value={idSolicitud ?? ""}
        onChange={(e) =>
          cambiarSolicitud(e.target.value)
        }
      >
        <option value="">Seleccionar solicitud</option>

        {solicitudesDisponibles.map((solicitud) => (
          <option
            key={solicitud.idSolicitud}
            value={solicitud.idSolicitud}
          >
            {codigoCotizacion(solicitud.idSolicitud)}
            {" - "}
            {codigoRequisicion(solicitud.requisicion)}
            {" - "}
            {solicitud.estado}
          </option>
        ))}
      </select>

      {solicitudesDisponibles.length === 0 && (
        <p className="selector-proveedores-vacio">
          Todavía no hay solicitudes de cotización.
          Primero debe generarse una solicitud a partir
          de una requisición aprobada.
        </p>
      )}

      {solicitudSeleccionada && requisicionSeleccionada && (
        <>
          <div className="selector-proveedores-resumen">
            <div className="selector-proveedores-encabezado">
              <div>
                <strong>
                  {codigoCotizacion(
                    solicitudSeleccionada.idSolicitud
                  )}
                </strong>

                <p>
                  Requisición vinculada:{" "}
                  {codigoRequisicion(
                    requisicionSeleccionada.idRequisicion
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
                {solicitudSeleccionada.estado}
              </span>
            </div>

            <p>
              Solicitante:{" "}
              {requisicionSeleccionada.solicitante}
            </p>

            <p>
              Fecha límite:{" "}
              {solicitudSeleccionada.fechaLimite}
            </p>

            <strong>Productos solicitados</strong>

            <ul>
              {requisicionSeleccionada.detalles.map(
                (detalle) => (
                  <li key={detalle.idDetalle}>
                    {detalle.producto.descripcion}
                    {" × "}
                    {detalle.cantidad}
                  </li>
                )
              )}
            </ul>
          </div>

          {solicitudEnviada ? (
            <div
              className="selector-proveedores-confirmacion"
              role="status"
            >
              <strong>Proveedores asociados</strong>

              <p>
                Esta solicitud ya fue marcada como enviada.
              </p>

              <ul>
                {idsAsociados.map((id) => {
                  const proveedor = proveedores.find(
                    (item) => item.idProveedor === id
                  );

                  return (
                    <li key={id}>
                      {proveedor?.razonSocial ??
                        `Proveedor ${id}`}
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <>
              <h3>Proveedores disponibles</h3>

              <input
                type="search"
                placeholder="Buscar por razón social o NIT"
                aria-label="Buscar proveedores"
                value={busqueda}
                onChange={(e) =>
                  setBusqueda(e.target.value)
                }
              />

              <div className="selector-proveedores-lista">
                {proveedoresValidos.length === 0 ? (
                  <p>
                    No se encontraron proveedores disponibles.
                  </p>
                ) : (
                  proveedoresValidos.map((proveedor) => (
                    <label
                      key={proveedor.idProveedor}
                      className="selector-proveedor"
                    >
                      <input
                        type="checkbox"
                        checked={seleccionados.includes(
                          proveedor.idProveedor
                        )}
                        onChange={() =>
                          cambiarSeleccion(
                            proveedor.idProveedor
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
                  disabled={seleccionados.length === 0}
                  onClick={asociarProveedores}
                >
                  Asociar proveedores
                </button>
              </div>
            </>
          )}
        </>
      )}

      {error && (
        <p
          role="alert"
          className="selector-proveedores-mensaje"
        >
          {error}
        </p>
      )}
    </div>
  );
}
