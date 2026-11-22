
import { useState } from "react";

import { conexion } from "../../../servicios/api/configuracion";
import {
  useGuardandoCotizaciones,
  type DespacharAccion,
} from "../servicios/despachoCotizaciones";
import type { OfertaProveedor, ResultadoValidacion } from "../tipos";

import ResultadoValidacionOferta from "./ResultadoValidacionOferta";
import EditarOfertaProveedor from "./EditarOfertaProveedor";
import type { DatosActualizacionOferta } from "./EditarOfertaProveedor";

interface Props {
  ofertas: OfertaProveedor[];
  ofertasValidas: OfertaProveedor[];
  solicitudEnviada: boolean;
  solicitudCerrada: boolean;
  fechaLimite: string;
  adjudicada: boolean;
  hoy: string;
  dispatch: DespacharAccion;
  resultadosValidacion?: Record<number, ResultadoValidacion>;
}

export default function ListaOfertasProveedor({
  ofertas,
  ofertasValidas,
  solicitudEnviada,
  solicitudCerrada,
  fechaLimite,
  adjudicada,
  hoy,
  dispatch,
  resultadosValidacion = {},
}: Props) {
  const [ofertaEnConfirmacion, setOfertaEnConfirmacion] = useState<
    number | null
  >(null);

  const [ofertaEnEdicion, setOfertaEnEdicion] = useState<number | null>(
    null,
  );
  const guardando = useGuardandoCotizaciones();

  const guardarEdicion = async (
    id: number,
    datos: DatosActualizacionOferta,
  ) => {
    const guardado = await dispatch({
      tipo: "modificarOferta",
      id,
      ...datos,
      hoy,
    });

    // Con el servidor conectado, el formulario sigue abierto si no se pudo guardar.
    if (guardado !== false || !conexion.cotizaciones) {
      setOfertaEnEdicion(null);
    }
  };

  return (
    <>
      <h2>Ofertas recibidas</h2>

      {ofertas.length > 0 && (
        <section className="comparacion-ofertas">
          <h3>Comparación de tiempos de entrega</h3>

          <div className="comparacion-ofertas__contenedor">
            <table className="comparacion-ofertas__tabla">
              <thead>
                <tr>
                  <th>Proveedor</th>
                  <th>Plazos por producto</th>
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
                              {detalle.plazoEntrega === 1
                                ? "día"
                                : "días"}
                            </strong>
                          </li>
                        ))}
                      </ul>
                    </td>

                    <td>{oferta.estado}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {ofertas.length === 0 && (
        <p>Todavía no hay ofertas.</p>
      )}

      {ofertas.map((oferta) => {
        const resultado =
          resultadosValidacion[oferta.idOferta];

        const puedeEditar =
          oferta.estado === "Registrada" &&
          solicitudEnviada &&
          fechaLimite >= hoy &&
          !adjudicada;

        const puedeSeleccionar =
          oferta.estado === "Registrada" &&
          (solicitudEnviada || solicitudCerrada) &&
          !adjudicada &&
          ofertasValidas.some(
            (valida) =>
              valida.idOferta === oferta.idOferta,
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

            {resultado && <ResultadoValidacionOferta resultado={resultado} />}

            {(puedeEditar || puedeSeleccionar) && (
              <div className="selector-proveedores-acciones">
                {puedeEditar && (
                  <button
                    type="button"
                    onClick={() => {
                      setOfertaEnConfirmacion(null);

                      setOfertaEnEdicion(
                        ofertaEnEdicion === oferta.idOferta
                          ? null
                          : oferta.idOferta,
                      );
                    }}
                  >
                    {ofertaEnEdicion === oferta.idOferta
                      ? "Cerrar edición"
                      : "Editar oferta"}
                  </button>
                )}

                {puedeSeleccionar && (
                  <button
                    type="button"
                    onClick={() => {
                      setOfertaEnEdicion(null);
                      setOfertaEnConfirmacion(
                        oferta.idOferta,
                      );
                    }}
                  >
                    Seleccionar oferta
                  </button>
                )}

              </div>
            )}

            {ofertaEnEdicion === oferta.idOferta &&
              puedeEditar && (
                <EditarOfertaProveedor
                  key={oferta.idOferta}
                  oferta={oferta}
                  hoy={hoy}
                  onGuardar={(datos) =>
                    guardarEdicion(
                      oferta.idOferta,
                      datos,
                    )
                  }
                  onCancelar={() =>
                    setOfertaEnEdicion(null)
                  }
                />
              )}

            {ofertaEnConfirmacion === oferta.idOferta &&
              puedeSeleccionar && (
                <section
                  className="selector-proveedores-adjudicacion"
                  role="group"
                  aria-labelledby={`confirmar-adjudicacion-${oferta.idOferta}`}
                >
                  <h3
                    id={`confirmar-adjudicacion-${oferta.idOferta}`}
                  >
                    Confirma la adjudicación
                  </h3>

                  <p>
                    Esta acción adjudicará esta oferta como ganadora. Si la solicitud todavía está abierta, se cerrará anticipadamente y no se podrán registrar nuevas ofertas:
                  </p>

                  <ul>
                    <li>
                      Proveedor:{" "}
                      {oferta.proveedor.razonSocial}
                    </li>

                    <li>
                      Oferta: OF-
                      {String(oferta.idOferta).padStart(
                        4,
                        "0",
                      )}
                    </li>

                    <li>
                      Solicitud: COT-
                      {String(oferta.solicitud).padStart(
                        4,
                        "0",
                      )}
                    </li>
                  </ul>

                  <div className="selector-proveedores-acciones">
                    <button
                      type="button"
                      disabled={!puedeSeleccionar || guardando}
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
                      onClick={() =>
                        setOfertaEnConfirmacion(null)
                      }
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
