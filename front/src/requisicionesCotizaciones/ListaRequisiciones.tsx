
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
}

export default function ListaRequisiciones({
  requisiciones,
  solicitudes,
  onGenerarCotizacion,
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
                requisicion.idRequisicion
            );

            const puedeGenerar =
              requisicion.estado === "Aprobada" &&
              !tieneSolicitud;

            return (
              <tr key={requisicion.idRequisicion}>
                <td>
                  {codigoRequisicion(
                    requisicion.idRequisicion
                  )}
                </td>

                <td>{requisicion.fecha}</td>

                <td>
                  {requisicion.detalles.map((detalle) => (
                    <div key={detalle.idDetalle}>
                      {detalle.producto.descripcion ||
                        "(sin nombre)"}{" "}
                      × {detalle.cantidad}
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
                  {puedeGenerar ? (
                    <button
                      type="button"
                      className="lista-requisiciones__accion"
                      onClick={() =>
                        onGenerarCotizacion(
                          requisicion.idRequisicion
                        )
                      }
                    >
                      Generar cotización
                    </button>
                  ) : tieneSolicitud ? (
                    <span>
                      Solicitud generada
                    </span>
                  ) : (
                    <span>—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
