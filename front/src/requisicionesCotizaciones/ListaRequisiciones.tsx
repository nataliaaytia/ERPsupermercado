import type {
  Requisicion,
  SolicitudCotizacion,
} from "./tipos";

import EtiquetaEstado from "./EtiquetaEstado";
import { codigoRequisicion } from "./formatoRequisicion";

import "./ListaRequisiciones.css";

interface Props {
  requisiciones: Requisicion[];
  solicitudes: SolicitudCotizacion[];
  onGenerarCotizacion: (idRequisicion: number) => void;
  onEditar: (idRequisicion: number) => void;
}

export default function ListaRequisiciones({
  requisiciones,
  solicitudes,
  onGenerarCotizacion,
  onEditar,
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
      <table className="lista-requisiciones__tabla">
        <thead>
          <tr>
            <th>Identificador</th>
            <th>Fecha</th>
            <th>Productos</th>
            <th>Motivo</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {requisiciones.map((requisicion) => {
            const tieneSolicitud = solicitudes.some(
              (solicitud) =>
                solicitud.requisicion ===
                requisicion.idRequisicion,
            );

            const puedeEditar =
              requisicion.estado === "Pendiente" &&
              !tieneSolicitud;

            const puedeGenerar =
              requisicion.estado === "Aprobada" &&
              !tieneSolicitud;

            return (
              <tr key={requisicion.idRequisicion}>
                <td>
                  {codigoRequisicion(
                    requisicion.idRequisicion,
                  )}
                </td>

                <td>{requisicion.fecha}</td>

                <td>
                  {requisicion.detalles.map((detalle) => (
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
                        onEditar(requisicion.idRequisicion)
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