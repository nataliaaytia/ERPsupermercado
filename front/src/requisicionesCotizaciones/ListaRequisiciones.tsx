
import { useState } from "react";

import type {
  Prioridad,
  Requisicion,
  SolicitudCotizacion,
} from "./tipos";

import EtiquetaEstado from "./EtiquetaEstado";
import ModalCancelarRequisicion from "./ModalCancelarRequisicion";
import { codigoRequisicion } from "./formatoRequisicion";

import "./ListaRequisiciones.css";

interface Props {
  requisiciones: Requisicion[];
  solicitudes: SolicitudCotizacion[];
  onEditar: (id: number) => void;
  onCancelar: (id: number) => void;
  onCambiarPrioridad: (
    id: number,
    prioridad: Prioridad,
  ) => void;
  idEnEdicion?: number | null;
}

export default function ListaRequisiciones({
  requisiciones,
  solicitudes,
  onEditar,
  onCancelar,
  onCambiarPrioridad,
  idEnEdicion = null,
}: Props) {
  const [idCancelar, setIdCancelar] =
    useState<number | null>(null);

  const requisicionACancelar =
    requisiciones.find(
      requisicion =>
        requisicion.idRequisicion === idCancelar,
    );

  const cancelacionBloqueada =
    !requisicionACancelar ||
    requisicionACancelar.estado !== "Pendiente" ||
    idEnEdicion === idCancelar ||
    solicitudes.some(
      solicitud =>
        solicitud.requisicion === idCancelar,
    );

  const confirmarCancelacion = () => {
    if (
      !requisicionACancelar ||
      cancelacionBloqueada
    ) {
      return;
    }

    onCancelar(
      requisicionACancelar.idRequisicion,
    );

    setIdCancelar(null);
  };

  if (requisiciones.length === 0) {
    return (
      <p className="lista-requisiciones__vacio">
        Todavía no hay requisiciones.
      </p>
    );
  }

  return (
    <>
      <div className="lista-requisiciones__contenedor">
        <p className="lista-requisiciones__ayuda">
          La prioridad se guarda automáticamente al cambiarla.
        </p>

        <table className="lista-requisiciones__tabla">
          <thead>
            <tr>
              <th>Identificador</th>
              <th>Fecha</th>
              <th>Prioridad</th>
              <th>Productos</th>
              <th>Motivo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {requisiciones.map(requisicion => {
              const tieneSolicitud =
                solicitudes.some(
                  solicitud =>
                    solicitud.requisicion ===
                    requisicion.idRequisicion,
                );

              const puedeEditar =
                requisicion.estado === "Pendiente" &&
                !tieneSolicitud;

              const formularioAbierto =
                idEnEdicion ===
                requisicion.idRequisicion;

              const puedeCancelar =
                puedeEditar &&
                !formularioAbierto;

              return (
                <tr key={requisicion.idRequisicion}>
                  <td>
                    {codigoRequisicion(
                      requisicion.idRequisicion,
                    )}
                  </td>

                  <td>{requisicion.fecha}</td>

                  <td>
                    <select
                      className={
                        "lista-requisiciones__prioridad " +
                        `lista-requisiciones__prioridad--${requisicion.prioridad.toLowerCase()}`
                      }
                      aria-label={
                        "Prioridad de " +
                        codigoRequisicion(
                          requisicion.idRequisicion,
                        )
                      }
                      value={requisicion.prioridad}
                      disabled={
                        !puedeEditar ||
                        formularioAbierto
                      }
                      title={
                        formularioAbierto
                          ? "Cambia la prioridad desde el formulario de edición"
                          : !puedeEditar
                            ? "La requisición ya fue procesada"
                            : "Selecciona la prioridad"
                      }
                      onChange={event =>
                        onCambiarPrioridad(
                          requisicion.idRequisicion,
                          event.target.value as Prioridad,
                        )
                      }
                    >
                      <option value="Alta">Alta</option>
                      <option value="Media">Media</option>
                      <option value="Baja">Baja</option>
                    </select>
                  </td>

                  <td>
                    {requisicion.detalles.map(
                      detalle => (
                        <div key={detalle.idDetalle}>
                          {detalle.producto.descripcion ||
                            "(sin nombre)"}
                          {" × "}
                          {detalle.cantidad}
                        </div>
                      ),
                    )}
                  </td>

                  <td>
                    {requisicion.observacion}
                  </td>

                  <td>
                    <EtiquetaEstado
                      requisicion={requisicion}
                    />
                  </td>

                  <td>
                    <div className="lista-requisiciones__acciones">
                      <button
                        type="button"
                        className="lista-requisiciones__accion"
                        disabled={!puedeEditar}
                        title={
                          puedeEditar
                            ? "Modificar esta requisición"
                            : "Solo se pueden editar requisiciones pendientes sin procesar"
                        }
                        onClick={() =>
                          onEditar(
                            requisicion.idRequisicion,
                          )
                        }
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        className="lista-requisiciones__accion lista-requisiciones__accion--cancelar"
                        disabled={!puedeCancelar}
                        title={
                          formularioAbierto
                            ? "Cierra el formulario de edición antes de cancelar"
                            : !puedeEditar
                              ? "Solo se pueden cancelar requisiciones pendientes sin procesar"
                              : "Cancelar esta requisición"
                        }
                        onClick={() =>
                          setIdCancelar(
                            requisicion.idRequisicion,
                          )
                        }
                      >
                        Cancelar
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {requisicionACancelar && (
        <ModalCancelarRequisicion
          key={requisicionACancelar.idRequisicion}
          requisicion={requisicionACancelar}
          bloqueada={cancelacionBloqueada}
          onCerrar={() =>
            setIdCancelar(null)
          }
          onConfirmar={confirmarCancelacion}
        />
      )}
    </>
  );
}
