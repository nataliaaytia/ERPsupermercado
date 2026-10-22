import type { Dispatch } from "react";

import type { AccionCompras } from "./modeloCompras";

import type { OfertaProveedor, ResultadoValidacion } from "./tipos";

import ResultadoValidacionOferta from "./ResultadoValidacionOferta";

interface Props {
  ofertas: OfertaProveedor[];
  solicitudEnviada: boolean;
  adjudicada: boolean;
  hoy: string;
  dispatch: Dispatch<AccionCompras>;
  resultadosValidacion?: Record<number, ResultadoValidacion>;
}

export default function ListaOfertasProveedor({
  ofertas,
  solicitudEnviada,
  adjudicada,
  hoy,
  dispatch,
  resultadosValidacion = {},
}: Props) {
  return (
    <>
      <h2>Ofertas recibidas</h2>
      {ofertas.length > 0 && (
        <section className="comparacion-ofertas">
          <h3>Comparación de tiempos y condiciones de entrega</h3>

          <div className="comparacion-ofertas__contenedor">
            <table className="comparacion-ofertas__tabla">
              <thead>
                <tr>
                  <th>Proveedor</th>
                  <th>Plazos por producto</th>
                  <th>Condiciones de entrega</th>
                  <th>Estado</th>
                </tr>
              </thead>

              <tbody>
                {ofertas.map((oferta) => (
                  <tr key={oferta.idOferta}>
                    <td>{oferta.proveedor.razonSocial}</td>

                    <td>
                      <ul>
                        {oferta.detalles.map((detalle) => (
                          <li key={detalle.idDetalle}>
                            {detalle.producto.descripcion}:{" "}
                            <strong>
                              {detalle.plazoEntrega}{" "}
                              {detalle.plazoEntrega === 1 ? "día" : "días"}
                            </strong>
                          </li>
                        ))}
                      </ul>
                    </td>

                    <td>
                      {oferta.condicionesEntrega ||
                        "Sin condiciones registradas"}
                    </td>

                    <td>{oferta.estado}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {ofertas.length === 0 && <p>Todavía no hay ofertas.</p>}

      {ofertas.map((oferta) => {
        const resultado = resultadosValidacion[oferta.idOferta];

        return (
          <article
            key={oferta.idOferta}
            className="selector-proveedores-resumen selector-proveedores-oferta"
          >
            <div className="selector-proveedores-oferta__encabezado">
              <strong>
                OF-{String(oferta.idOferta).padStart(4, "0")}
                {" · "}
                {oferta.proveedor.razonSocial}
              </strong>

              <span
                className={`selector-proveedores-estado selector-proveedores-estado--${oferta.estado.toLowerCase()}`}
              >
                {oferta.estado}
              </span>
            </div>

            <p>
              Fecha: {oferta.fecha}
              {" · "}
              Válida hasta: {oferta.validez}
            </p>

            <ul>
              {oferta.detalles.map((detalle) => (
                <li key={detalle.idDetalle}>
                  {detalle.producto.descripcion}
                  {": Bs "}
                  {detalle.precio.toFixed(2)}
                  {" · "}
                  {detalle.plazoEntrega} días
                </li>
              ))}
            </ul>

            <ResultadoValidacionOferta resultado={resultado} />

            {oferta.estado === "Registrada" && solicitudEnviada && (
              <div className="selector-proveedores-acciones">
                <button
                  type="button"
                  disabled={adjudicada || oferta.validez < hoy}
                  onClick={() =>
                    dispatch({
                      tipo: "seleccionar",
                      id: oferta.idOferta,
                      hoy,
                    })
                  }
                >
                  Seleccionar oferta
                </button>

                <button
                  type="button"
                  onClick={() =>
                    dispatch({
                      tipo: "rechazar",
                      id: oferta.idOferta,
                      hoy,
                    })
                  }
                >
                  Rechazar oferta
                </button>
              </div>
            )}
          </article>
        );
      })}
    </>
  );
}
