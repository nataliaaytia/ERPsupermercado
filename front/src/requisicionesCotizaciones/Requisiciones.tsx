import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import FormularioRequisicion from "./FormularioRequisicion";
import { useRequisiciones } from "./useRequisiciones";
import type { DatosRequisicion, Requisicion } from "./tipos";
import "./Requisiciones.css";

export const Requisiciones = () => {
  const { requisiciones, registrarRequisicion } = useRequisiciones();
  const [ultima, setUltima] = useState<Requisicion | null>(null);

  const guardar = (datos: DatosRequisicion) => {
    setUltima(registrarRequisicion(datos));
  };

  return (
    <div className="requisiciones-container">
      <header className="requisiciones-header">
        <p className="requisiciones-subtitulo">Compras</p>
        <h1 className="requisiciones-titulo">Nueva requisición</h1>
      </header>

      {ultima && (
        <p role="status" className="requisiciones-exito">
          <CheckCircle2 size={18} />
          Requisición {ultima.id} registrada con estado {ultima.estado}.
        </p>
      )}

      <section className="requisiciones-tarjeta">
        <FormularioRequisicion onGuardar={guardar} />
      </section>

      <section className="requisiciones-tarjeta">
        <h2 className="requisiciones-seccion">Requisiciones registradas</h2>
        {requisiciones.length === 0 ? (
          <p className="requisiciones-vacio">Todavía no hay requisiciones.</p>
        ) : (
          <div className="requisiciones-tabla-contenedor">
            <table className="requisiciones-tabla">
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
                      <span className="requisiciones-estado">
                        {requisicion.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default Requisiciones;
