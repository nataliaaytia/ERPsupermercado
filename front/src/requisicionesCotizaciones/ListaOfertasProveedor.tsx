import { useState, type Dispatch } from "react";

import type { AccionCompras } from "./modeloCompras";

import type { OfertaProveedor, ResultadoValidacion } from "./tipos";

import ResultadoValidacionOferta from "./ResultadoValidacionOferta";

interface Props {
  ofertas: OfertaProveedor[];
  ofertasValidas: OfertaProveedor[];
  solicitudEnviada: boolean;
  adjudicada: boolean;
  hoy: string;
  dispatch: Dispatch<AccionCompras>;
  resultadosValidacion?: Record<number, ResultadoValidacion>;
}

export default function ListaOfertasProveedor({
  ofertas,
  ofertasValidas,
  solicitudEnviada,
  adjudicada,
  hoy,
  dispatch,
  resultadosValidacion = {},
}: Props) {
  const [ofertaEnConfirmacion, setOfertaEnConfirmacion] = useState<
    number | null
  >(null);

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
        const puedeSeleccionar =
          !adjudicada &&
          ofertasValidas.some(
            (ofertaValida) => ofertaValida.idOferta === oferta.idOferta,
          );

        return (
          <article
            key={oferta.idOferta}
            className={`selector-proveedores-resumen selector-proveedores-oferta${
              oferta.estado === "Seleccionada"
                ? " selector-proveedores-oferta--ganadora"
                : ""
            }`}
          >
            <div className="selector-proveedores-oferta__encabezado">
              <strong>
                OF-{String(oferta.idOferta).padStart(4, "0")}
                {" · "}
                {oferta.proveedor.razonSocial}
              </strong>

              {oferta.estado === "Seleccionada" && (
                <span className="selector-proveedores-oferta__ganadora">
                  Oferta ganadora
                </span>
              )}

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
                {puedeSeleccionar && (
                  <button
                    type="button"
                    onClick={() => setOfertaEnConfirmacion(oferta.idOferta)}
                  >
                    Seleccionar oferta
                  </button>
                )}

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

            {ofertaEnConfirmacion === oferta.idOferta &&
              puedeSeleccionar &&
              solicitudEnviada && (
                <section
                  className="selector-proveedores-adjudicacion"
                  role="group"
                  aria-labelledby={`confirmar-adjudicacion-${oferta.idOferta}`}
                >
                  <h3 id={`confirmar-adjudicacion-${oferta.idOferta}`}>
                    Confirma la adjudicación
                  </h3>
                  <p>
                    Esta acción seleccionará esta oferta como ganadora:
                  </p>
                  <ul>
                    <li>Proveedor: {oferta.proveedor.razonSocial}</li>
                    <li>
                      Oferta: OF-{String(oferta.idOferta).padStart(4, "0")}
                    </li>
                    <li>
                      Solicitud: COT-{String(oferta.solicitud).padStart(4, "0")}
                    </li>
                  </ul>
                  <div className="selector-proveedores-acciones">
                    <button
                      type="button"
                      disabled={!puedeSeleccionar}
                      onClick={() => {
                        dispatch({
                          tipo: "seleccionar",
                          id: oferta.idOferta,
                          hoy,
                        });
                        setOfertaEnConfirmacion(null);
                      }}
                    >
                      Confirmar adjudicación
                    </button>
                    <button
                      type="button"
                      onClick={() => setOfertaEnConfirmacion(null)}
                    >
                      Cancelar
                    </button>
                  </div>
                </section>
              )}
          </article>
        );
      })}
    </>
  );
}
