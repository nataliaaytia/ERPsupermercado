import type { Requisicion } from "./tipos";
import "./ListaRequisiciones.css";

interface Props {
  requisiciones: Requisicion[];
}

export default function ListaRequisiciones({ requisiciones }: Props) {
  if (requisiciones.length === 0)
    return <p className="lista-requisiciones__vacio">Todavía no hay requisiciones.</p>;

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
          </tr>
        </thead>
        <tbody>
          {requisiciones.map((requisicion) => (
            <tr key={requisicion.id}>
              <td>{requisicion.id}</td>
              <td>{requisicion.fecha}</td>
              <td>
                {requisicion.productos.map((producto) => (
                  <div key={producto.nombre}>
                    {producto.nombre} × {producto.cantidad}
                  </div>
                ))}
              </td>
              <td>{requisicion.motivo}</td>
              <td>
                <span className="lista-requisiciones__estado">
                  {requisicion.estado}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
