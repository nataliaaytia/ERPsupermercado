
import type { OrdenCompra } from "./tipos";
import "./HistorialEstadosOrden.css";

interface Props {
  orden: OrdenCompra;
}

function formatearFecha(fecha: string): string {
  if (!fecha) return "Fecha no disponible";

  const valor = new Date(fecha);

  if (Number.isNaN(valor.getTime())) {
    return fecha;
  }

  return valor.toLocaleString("es-BO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HistorialEstadosOrden({ orden }: Props) {
  const historial = [...(orden.historialEstados ?? [])].sort(
    (a, b) =>
      new Date(b.fecha).getTime() -
      new Date(a.fecha).getTime()
  );

  return (
    <section className="historial-estados">
      <div className="historial-estados__encabezado">
        <div>
          <h3>Historial de estados</h3>
          <p>
            Consulta los cambios de estado registrados
            para esta orden de compra.
          </p>
        </div>

        <span className="historial-estados__contador">
          {historial.length}{" "}
          {historial.length === 1 ? "cambio" : "cambios"}
        </span>
      </div>

      {historial.length === 0 ? (
        <p className="historial-estados__vacio">
          Esta orden todavía no tiene cambios de estado
          registrados.
        </p>
      ) : (
        <div className="historial-estados__tabla-contenedor">
          <table className="historial-estados__tabla">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Estado anterior</th>
                <th>Estado nuevo</th>
                <th>Usuario</th>
                <th>Observación</th>
              </tr>
            </thead>

            <tbody>
              {historial.map((cambio, indice) => (
                <tr key={`${cambio.fecha}-${indice}`}>
                  <td>{formatearFecha(cambio.fecha)}</td>

                  <td>
                    {cambio.estadoAnterior || "No registrado"}
                  </td>

                  <td>
                    <span className="historial-estados__estado">
                      {cambio.estadoNuevo}
                    </span>
                  </td>

                  <td>
                    {cambio.usuario || "No registrado"}
                  </td>

                  <td>
                    {cambio.observacion || "Sin observaciones"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
