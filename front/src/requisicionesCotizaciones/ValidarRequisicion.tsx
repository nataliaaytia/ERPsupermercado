
import EtiquetaEstado from "./EtiquetaEstado";
import MensajesValidacion from "./MensajesValidacion";
import { codigoRequisicion } from "./formatoRequisicion";
import type { Requisicion } from "./tipos";
import "./ValidarRequisicion.css";

interface Props {
  requisiciones: Requisicion[];
  onValidar: (id: number) => void;
  onAnular: (id: number) => void;
}

export default function ValidarRequisicion({
  requisiciones,
  onValidar,
  onAnular,
}: Props) {
  if (requisiciones.length === 0) {
    return (
      <p className="validar-requisicion__vacio">
        Todavía no hay requisiciones para revisar.
      </p>
    );
  }

  return (
    <div className="validar-requisicion">
      {requisiciones.map((requisicion) => (
        <article
          key={requisicion.idRequisicion}
          className="validar-requisicion__tarjeta"
        >
          <header className="validar-requisicion__encabezado">
            <div>
              <strong>
                {codigoRequisicion(
                  requisicion.idRequisicion
                )}
              </strong>

              <span className="validar-requisicion__fecha">
                {requisicion.fecha}
              </span>
            </div>

            <EtiquetaEstado requisicion={requisicion} />
          </header>

          <p>
            Solicitante: {requisicion.solicitante}
            {" · "}
            Prioridad: {requisicion.prioridad}
          </p>

          <ul className="validar-requisicion__productos">
            {requisicion.detalles.map((detalle) => (
              <li key={detalle.idDetalle}>
                {detalle.producto.descripcion}
                {" × "}
                {detalle.cantidad}

                {detalle.observacion && (
                  <span>
                    {" · "}
                    {detalle.observacion}
                  </span>
                )}
              </li>
            ))}
          </ul>

          <p className="validar-requisicion__motivo">
            {requisicion.observacion}
          </p>

          {requisicion.validacion && (
            <MensajesValidacion
              validacion={requisicion.validacion}
            />
          )}

          {requisicion.estado === "Pendiente" && (
            <>
              <button
                type="button"
                className="validar-requisicion__boton"
                onClick={() =>
                  onValidar(requisicion.idRequisicion)
                }
              >
                Aprobar requisición
              </button>

              <button
                type="button"
                className="validar-requisicion__boton"
                onClick={() =>
                  onAnular(requisicion.idRequisicion)
                }
              >
                Anular requisición
              </button>
            </>
          )}
        </article>
      ))}
    </div>
  );
}
