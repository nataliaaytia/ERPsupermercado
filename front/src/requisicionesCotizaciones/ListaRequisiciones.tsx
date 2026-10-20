import type {
  Prioridad,
  Requisicion,
  SolicitudCotizacion,
} from "./tipos";

import EtiquetaEstado from "./EtiquetaEstado";
import { codigoRequisicion } from "./formatoRequisicion";

import "./ListaRequisiciones.css";

interface Props {
  requisiciones: Requisicion[];
  solicitudes: SolicitudCotizacion[];
  onGenerarCotizacion: (id: number) => void;
  onEditar: (id: number) => void;
  onCambiarPrioridad: (
    id: number,
    prioridad: Prioridad,
  ) => void;
  idEnEdicion?: number | null;
}

export default function ListaRequisiciones({
  requisiciones,
  solicitudes,
  onGenerarCotizacion,
  onEditar,
  onCambiarPrioridad,
  idEnEdicion = null,
}: Props) {
  if (requisiciones.length === 0) {
    return (
      <p className="lista-requisiciones__vacio">
        Todavía no hay requisiciones.
      </p>
    );
  }

  return (
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
            const tieneSolicitud = solicitudes.some(
              s =>
                s.requisicion ===
                requisicion.idRequisicion,
            );

            const puedeGenerar =
              requisicion.estado === "Aprobada" &&
              !tieneSolicitud;

            const puedeEditar =
              requisicion.estado === "Pendiente" &&
              !tieneSolicitud;

            const formularioAbierto =
              idEnEdicion === requisicion.idRequisicion;

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
                      !puedeEditar || formularioAbierto
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
                  {requisicion.detalles.map(detalle => (
                    <div key={detalle.idDetalle}>
                      {detalle.producto.descripcion ||
                        "(sin nombre)"}
                      {" × "}
                      {detalle.cantidad}
                    </div>
                  ))}
                </td>

                <td>{requisicion.observacion}</td>

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

                    {puedeGenerar ? (
                      <button
                        type="button"
                        className="lista-requisiciones__accion"
                        onClick={() =>
                          onGenerarCotizacion(
                            requisicion.idRequisicion,
                          )
                        }
                      >
                        Generar cotización
                      </button>
                    ) : tieneSolicitud ? (
                      <span>Solicitud generada</span>
                    ) : (
                      <span>—</span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}