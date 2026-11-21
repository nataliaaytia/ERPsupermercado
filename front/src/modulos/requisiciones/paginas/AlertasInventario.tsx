import { useState } from "react";

import type { AccionCompras } from "../servicios/modeloCompras";

import type {
  AlertaReposicion,
  RegistroRecepcionAlerta,
  RegistroProcesamientoCompra,
} from "../tipos/alertasInventario";

import { recibirAlertaAsincronamente } from "../servicios/recepcionAlertasInventario";
import { codigoRequisicion } from "../servicios/formatoRequisicion";

import "./AlertasInventario.css";

interface Props {
  /** Alertas de reposición de prueba (se simula su llegada una por una). */
  alertasPendientes: AlertaReposicion[];
  alertasInventario: RegistroRecepcionAlerta[];
  historialProcesamientos: RegistroProcesamientoCompra[];
  dispatch: (accion: AccionCompras) => void;
}

export default function AlertasInventario({
  alertasPendientes,
  alertasInventario,
  historialProcesamientos,
  dispatch,
}: Props) {
  const [procesando, setProcesando] = useState(false);

  const ultimoProcesamiento = (idEvento: string) =>
    [...historialProcesamientos]
      .reverse()
      .find((registro) => registro.idEvento === idEvento);

  const simularRecepcion = async () => {
    if (procesando) return;

    setProcesando(true);

    try {
      // Siguiente alerta de prueba que aún no llegó; si ya llegaron todas,
      // se reenvía la primera (se registra como duplicada).
      const recibidas = new Set(alertasInventario.map((item) => item.idEvento));
      const siguiente =
        alertasPendientes.find((item) => !recibidas.has(item.idEvento)) ??
        alertasPendientes[0];

      if (!siguiente) return;

      const alerta: AlertaReposicion = {
        ...siguiente,
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
    <section className="alertas-inventario">
      <h2>Alertas de reposición de Inventarios</h2>

      <p>
        Simulación local de recepción asíncrona. La integración real con
        Inventarios está pendiente.
      </p>

      <button
        className="alertas-inventario__boton"
        type="button"
        onClick={simularRecepcion}
        disabled={procesando}
      >
        {procesando ? "Publicando en Pub/Sub..." : "Publicar en Pub/Sub"}
      </button>

      <h3>Historial de alertas recibidas</h3>
      <button
        className="alertas-inventario__boton alertas-inventario__boton--secundario"
        type="button"
        onClick={() =>
          dispatch({ tipo: "limpiarAlertasInventario" })
        }
        disabled={alertasInventario.length === 0}
      >
        Limpiar historial de alertas
      </button>

      {alertasInventario.length === 0 ? (
        <p className="alertas-inventario__vacio">
          No hay alertas registradas.
        </p>
      ) : (
        <div className="alertas-inventario__lista">
          {alertasInventario.map((alerta) => {
            const procesamiento = ultimoProcesamiento(alerta.idEvento);

            return (
              <article
                className="alertas-inventario__tarjeta"
                key={alerta.idEvento}
              >
                <div className="alertas-inventario__encabezado">
                  <h4>{alerta.nombreProducto}</h4>
                  <span
                    className={`alertas-inventario__estado alertas-inventario__estado--${alerta.estado.toLowerCase()}`}
                  >
                    {alerta.estado}
                  </span>
                </div>

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

                <p>{alerta.mensaje}</p>

                {procesamiento && (
                  <p>
                    <strong>Último resultado:</strong> {procesamiento.resultado}
                    {procesamiento.idRequisicion !== undefined &&
                      ` · Requisición ${codigoRequisicion(procesamiento.idRequisicion)}`}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      )}
      <hr />

      <h3>Historial de procesamientos</h3>

      {historialProcesamientos.length === 0 ? (
        <p className="alertas-inventario__vacio">
          No hay procesamientos registrados.
        </p>
      ) : (
        <div className="alertas-inventario__lista">
          {[...historialProcesamientos]
            .reverse()
            .map((registro, indice) => (
              <article
                className="alertas-inventario__tarjeta"
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
                  <strong>Resultado:</strong>{" "}
                  <span
                    className={`alertas-inventario__estado alertas-inventario__estado--${registro.resultado.toLowerCase()}`}
                  >
                    {registro.resultado}
                  </span>
                </p>

                <p>{registro.mensaje}</p>

                {registro.idRequisicion !== undefined && (
                  <p>
                    <strong>Requisición asociada:</strong>{" "}
                    {codigoRequisicion(registro.idRequisicion)}
                  </p>
                )}
              </article>
            ))}
        </div>
      )}
    </section>
  );
}
