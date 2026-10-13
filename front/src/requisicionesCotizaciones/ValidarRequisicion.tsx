import EtiquetaEstado from "./EtiquetaEstado";
import MensajesValidacion from "./MensajesValidacion";
import type { Requisicion } from "./tipos";
import "./ValidarRequisicion.css";

interface Props {
  requisiciones: Requisicion[];
  onValidar: (id: string) => void;
}

export default function ValidarRequisicion({ requisiciones, onValidar }: Props) {
  if (requisiciones.length === 0)
    return (
      <p className="validar-requisicion__vacio">
        Todavía no hay requisiciones para validar.
      </p>
    );

  return (
    <div className="validar-requisicion">
      {requisiciones.map((requisicion) => (
        <article key={requisicion.id} className="validar-requisicion__tarjeta">
          <header className="validar-requisicion__encabezado">
            <div>
              <strong>{requisicion.id}</strong>
              <span className="validar-requisicion__fecha">
                {requisicion.fecha}
              </span>
            </div>
            <EtiquetaEstado requisicion={requisicion} />
          </header>

          <ul className="validar-requisicion__productos">
            {requisicion.productos.map((producto, indice) => (
              <li key={indice}>
                {producto.nombre || "(sin nombre)"} × {producto.cantidad}
              </li>
            ))}
          </ul>

          <p className="validar-requisicion__motivo">{requisicion.motivo}</p>

          {requisicion.validacion && (
            <MensajesValidacion validacion={requisicion.validacion} />
          )}

          {requisicion.estado === "Pendiente" && (
            <button
              type="button"
              className="validar-requisicion__boton"
              onClick={() => onValidar(requisicion.id)}
            >
              Validar requisición
            </button>
          )}
        </article>
      ))}
    </div>
  );
}
