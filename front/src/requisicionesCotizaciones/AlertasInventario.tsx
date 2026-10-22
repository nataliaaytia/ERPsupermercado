import { useState } from "react";

import type { AccionCompras } from "./modeloCompras";

import type {
  AlertaReposicion,
  RegistroRecepcionAlerta,
  RegistroProcesamientoCompra,
} from "./tiposAlertasInventario";

import { recibirAlertaAsincronamente } from "./recepcionAlertasInventario";

interface Props {
  alertasInventario: RegistroRecepcionAlerta[];
  historialProcesamientos: RegistroProcesamientoCompra[];
  dispatch: (accion: AccionCompras) => void;
}

export default function AlertasInventario({
  alertasInventario,
  historialProcesamientos,
  dispatch,
}: Props) {
  const [procesando, setProcesando] = useState(false);

  const simularRecepcion = async () => {
    if (procesando) return;

    setProcesando(true);

    try {
      const alerta: AlertaReposicion = {
        idEvento: "INV-DEMO-001",
        idProducto: 101,
        nombreProducto: "Papel bond tamaño carta",
        cantidadActual: 8,
        stockMinimo: 20,
        cantidadSugerida: 50,
        fechaPublicacion: new Date().toISOString(),
      };

      const alertaRecibida = await recibirAlertaAsincronamente(alerta);

      dispatch({
        tipo: "recibirAlertaInventario",
        alerta: alertaRecibida,
        fechaRecepcion: new Date().toISOString(),
      });
    } finally {
      setProcesando(false);
    }
  };

  return (
    <section>
      <h2>Alertas de reposición de Inventarios</h2>

      <p>
        Simulación local de recepción asíncrona. La integración real con
        Inventarios está pendiente.
      </p>

      <button type="button" onClick={simularRecepcion} disabled={procesando}>
        {procesando ? "Recibiendo alerta..." : "Simular recepción de alerta"}
      </button>

      <h3>Historial de alertas recibidas</h3>
            <button
        type="button"
        onClick={() =>
          dispatch({ tipo: "limpiarAlertasInventario" })
        }
        disabled={alertasInventario.length === 0}
      >
        Limpiar historial de alertas
      </button>

      {alertasInventario.length === 0 ? (
        <p>No hay alertas registradas.</p>
      ) : (
        <div>
          {alertasInventario.map((alerta) => (
            <article key={alerta.idEvento}>
              <h4>{alerta.nombreProducto}</h4>

              <p>
                <strong>ID del evento:</strong> {alerta.idEvento}
              </p>

              <p>
                <strong>ID del producto:</strong> {alerta.idProducto}
              </p>

              <p>
                <strong>Stock actual:</strong> {alerta.cantidadActual}
              </p>

              <p>
                <strong>Stock mínimo:</strong> {alerta.stockMinimo}
              </p>

              <p>
                <strong>Cantidad sugerida:</strong> {alerta.cantidadSugerida}
              </p>

              <p>
                <strong>Fecha de publicación:</strong>{" "}
                {new Date(alerta.fechaPublicacion).toLocaleString()}
              </p>

              <p>
                <strong>Fecha de recepción:</strong>{" "}
                {new Date(alerta.fechaRecepcion).toLocaleString()}
              </p>

              <p>
                <strong>Estado:</strong> {alerta.estado}
              </p>

              <p>{alerta.mensaje}</p>
            </article>
          ))}
        </div>
      )}
            <hr />

      <h3>Historial de procesamientos</h3>

      {historialProcesamientos.length === 0 ? (
        <p>No hay procesamientos registrados.</p>
      ) : (
        <div>
          {[...historialProcesamientos]
            .reverse()
            .map((registro, indice) => (
              <article
                key={`${registro.idEvento}-${registro.fechaIntento}-${indice}`}
              >
                <h4>{registro.nombreProducto}</h4>

                <p>
                  <strong>ID del evento:</strong> {registro.idEvento}
                </p>

                <p>
                  <strong>ID del producto:</strong> {registro.idProducto}
                </p>

                <p>
                  <strong>Fecha del intento:</strong>{" "}
                  {new Date(registro.fechaIntento).toLocaleString()}
                </p>

                <p>
                  <strong>Resultado:</strong> {registro.resultado}
                </p>

                <p>{registro.mensaje}</p>
              </article>
            ))}
        </div>
      )}
    </section>
  );
}
