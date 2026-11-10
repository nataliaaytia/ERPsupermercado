import { useEffect, useState } from "react";
import { useRequisiciones } from "../requisicionesCotizaciones/useRequisiciones";
import {
    confirmarDisponibilidad,
    publicarDisponibilidadAsincronamente,
    recuperarPublicacionesInterrumpidas,
} from "./servicioDisponibilidadDespacho";
import type { EventoMercaderiaDisponible } from "./tiposDisponibilidad";

export default function DisponibilidadDespacho() {
    const compras = useRequisiciones();
    const [error, setError] = useState("");

    useEffect(() => {
        recuperarPublicacionesInterrumpidas();
    }, []);

    const validaciones = compras.recepcionesValidadas.filter(validacion => {
        if (
            validacion.estado !== "Validada" ||
            validacion.esEjemplo ||
            !validacion.detalles.some(detalle => detalle.cantidadAceptada > 0) ||
            !compras.recepcionesRegistradas.some(
                recepcion =>
                    recepcion.idRecepcion === validacion.idRecepcion &&
                    recepcion.idOrden === validacion.idOrden,
            )
        ) {
            return false;
        }
        return true;
    });

    function estadoDisponibilidad(
        evento: EventoMercaderiaDisponible | undefined,
    ): string {
        if (!evento) return "Pendiente de confirmación";
        if (evento.resultadoProcesamiento?.estadoProcesamiento === "Confirmada") {
            return "Confirmada por Entregas/Despachos";
        }
        if (evento.resultadoProcesamiento?.estadoProcesamiento === "Rechazada") {
            return "Rechazada por Entregas/Despachos";
        }
        return evento.estadoPublicacion === "Publicado"
            ? "Pendiente de respuesta de Entregas/Despachos"
            : "Pendiente de publicación";
    }

    function confirmar(idRecepcion: number) {
        setError("");

        try {
            const evento = confirmarDisponibilidad(idRecepcion);
            void publicarDisponibilidadAsincronamente(evento.idEvento).catch(
                fallo => {
                    setError(
                        fallo instanceof Error
                            ? fallo.message
                            : "No se pudo actualizar el estado de publicación.",
                    );
                },
            );
        } catch (fallo) {
            setError(
                fallo instanceof Error
                    ? fallo.message
                    : "No se pudo confirmar la disponibilidad.",
            );
        }
    }

    function reintentar(idEvento: string) {
        setError("");
        void publicarDisponibilidadAsincronamente(idEvento).catch(fallo => {
            setError(
                fallo instanceof Error
                    ? fallo.message
                    : "No se pudo actualizar el estado de publicación.",
            );
        });
    }

    return (
        <section className="ordenes-compra__tarjeta">
            <h2>Disponibilidad enviada a Entregas/Despachos</h2>
            <p>
                Solo se exponen cantidades aceptadas de recepciones validadas.
                Los rechazos no forman parte de la disponibilidad.
            </p>

            {compras.errorCarga && (
                <p className="ordenes-compra__error" role="alert">
                    {compras.errorCarga}
                </p>
            )}
            {error && (
                <p className="ordenes-compra__error" role="alert">
                    {error}
                </p>
            )}

            <h3>Recepciones validadas disponibles</h3>
            {validaciones.length === 0 ? (
                <p>
                    No hay recepciones validadas con cantidades aceptadas para
                    confirmar.
                </p>
            ) : (
                <div className="disponibilidad-despacho__lista">
                    {validaciones.map(validacion => {
                        const evento = compras.eventosMercaderiaDisponible.find(
                            item =>
                                item.idRecepcion === validacion.idRecepcion,
                        );
                        const orden = compras.ordenes.find(
                            item => item.idOrden === validacion.idOrden,
                        );
                        const detalles = validacion.detalles.filter(
                            detalle => detalle.cantidadAceptada > 0,
                        );

                        return (
                            <article
                                className="disponibilidad-despacho__tarjeta"
                                key={`${validacion.idOrden}-${validacion.idRecepcion}`}
                            >
                                <h4>
                                    Recepción {validacion.idRecepcion}
                                    {" · "}Orden {orden?.numero ?? validacion.idOrden}
                                </h4>
                                {evento && (
                                    <p>
                                        Fecha de generación del evento:{" "}
                                        {new Date(
                                            evento.fechaConfirmacionDisponibilidad,
                                        ).toLocaleString("es-BO")}
                                    </p>
                                )}
                                <p>
                                    Fecha de validación:{" "}
                                    {validacion.fechaValidacion
                                        ? new Date(
                                              validacion.fechaValidacion,
                                          ).toLocaleString("es-BO")
                                        : "No registrada"}
                                </p>
                                <p>
                                    Estado de disponibilidad:{" "}
                                    {estadoDisponibilidad(evento)}
                                </p>
                                <p>
                                    Estado del envío:{" "}
                                    {evento?.estadoPublicacion ??
                                        "No publicado"}
                                </p>
                                {evento?.estadoPublicacion === "Publicado" && (
                                    <p>
                                        El endpoint de publicación aceptó el
                                        evento. Este estado no confirma que
                                        Gestión de Entregas/Despachos lo haya
                                        procesado.
                                    </p>
                                )}
                                {evento && (
                                    <>
                                        <p>
                                            Intentos realizados:{" "}
                                            {evento.intentosPublicacion
                                                ?.length ?? 0}
                                        </p>
                                        <p>
                                            Último intento:{" "}
                                            {evento.fechaUltimoIntento
                                                ? new Date(
                                                      evento.fechaUltimoIntento,
                                                  ).toLocaleString(
                                                      "es-BO",
                                                  )
                                                : "Sin intentos realizados"}
                                        </p>
                                        <p>
                                            Resultado del último intento:{" "}
                                            {evento.intentosPublicacion
                                                ?.at(-1)?.resultado ??
                                                evento.errorPublicacion ??
                                                "Todavía no se ha intentado"}
                                        </p>
                                    </>
                                )}

                                <div className="ordenes-compra__tabla">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th scope="col">Producto</th>
                                                <th scope="col">Aceptadas</th>
                                                <th scope="col">Disponibles</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {detalles.map(detalle => {
                                                const producto =
                                                    orden?.detalles.find(
                                                        linea =>
                                                            linea.idDetalle ===
                                                            detalle.idDetalleOrden,
                                                    )?.producto.descripcion;

                                                return (
                                                    <tr
                                                        key={
                                                            detalle.idDetalleOrden
                                                        }
                                                    >
                                                        <td>
                                                            {producto?.trim() ||
                                                                "Producto no disponible"}
                                                        </td>
                                                        <td>
                                                            {
                                                                detalle.cantidadAceptada
                                                            }
                                                        </td>
                                                        <td>
                                                            {evento
                                                                ? evento.detalles.find(
                                                                      item =>
                                                                          item.idDetalleOrden ===
                                                                          detalle.idDetalleOrden,
                                                                  )
                                                                      ?.cantidadDisponible ??
                                                                  0
                                                                : detalle.cantidadAceptada}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {evento && (
                                    <div className="disponibilidad-despacho__evento">
                                        <p>
                                            ID del evento: {evento.idEvento}
                                        </p>
                                        <p>
                                            correlationId:{" "}
                                            {evento.correlationId ?? evento.idEvento}
                                        </p>
                                        <p>
                                            Confirmación:{" "}
                                            {new Date(
                                                evento.fechaConfirmacionDisponibilidad,
                                            ).toLocaleString("es-BO")}
                                        </p>
                                        {evento.referenciaPublicacion && (
                                            <p>
                                                Referencia Pub/Sub:{" "}
                                                {evento.referenciaPublicacion}
                                            </p>
                                        )}
                                        {evento.errorPublicacion && (
                                            <p
                                                className="ordenes-compra__error"
                                                role="status"
                                            >
                                                {evento.errorPublicacion}
                                            </p>
                                        )}
                                        <section aria-label="Resultado de Entregas y Despachos">
                                            <h5>
                                                Resultado de Entregas/Despachos
                                            </h5>
                                            {evento.resultadoProcesamiento ? (
                                                <>
                                                    <p>
                                                        Estado de procesamiento:{" "}
                                                        {evento.resultadoProcesamiento.estadoProcesamiento}
                                                    </p>
                                                    <p>
                                                        Recepción relacionada:{" "}
                                                        {evento.resultadoProcesamiento.recepcionId}
                                                    </p>
                                                    <p>
                                                        correlationId:{" "}
                                                        {evento.resultadoProcesamiento.correlationId}
                                                    </p>
                                                    <p>
                                                        Fecha del resultado:{" "}
                                                        {new Date(
                                                            evento.resultadoProcesamiento.fechaResultado,
                                                        ).toLocaleString("es-BO")}
                                                    </p>
                                                    {evento.resultadoProcesamiento.motivoRechazo && (
                                                        <p>
                                                            Motivo del rechazo:{" "}
                                                            {evento.resultadoProcesamiento.motivoRechazo}
                                                        </p>
                                                    )}
                                                </>
                                            ) : (
                                                <p>
                                                    {evento.estadoPublicacion ===
                                                    "Publicado"
                                                        ? "Pendiente de respuesta; la publicación HTTP no confirma el procesamiento."
                                                        : "Sin respuesta de Entregas/Despachos."}
                                                </p>
                                            )}
                                        </section>
                                        {evento.intentosPublicacion &&
                                            evento.intentosPublicacion.length >
                                                0 && (
                                                <details>
                                                    <summary>
                                                        Historial de intentos
                                                    </summary>
                                                    <ol>
                                                        {evento.intentosPublicacion.map(
                                                            intento => (
                                                                <li
                                                                    key={
                                                                        intento.numero
                                                                    }
                                                                >
                                                                    Intento{" "}
                                                                    {
                                                                        intento.numero
                                                                    }
                                                                    {" · "}
                                                                    {new Date(
                                                                        intento.fechaIntento,
                                                                    ).toLocaleString(
                                                                        "es-BO",
                                                                    )}
                                                                    {" · "}
                                                                    {
                                                                        intento.resultado
                                                                    }
                                                                    {intento.mensaje &&
                                                                        ` · ${intento.mensaje}`}
                                                                    {intento.referenciaPublicacion &&
                                                                        ` · Ref: ${intento.referenciaPublicacion}`}
                                                                </li>
                                                            ),
                                                        )}
                                                    </ol>
                                                </details>
                                            )}
                                    </div>
                                )}

                                {evento ? (
                                    (evento.estadoPublicacion === "Pendiente" ||
                                        evento.estadoPublicacion === "Error" ||
                                        evento.estadoPublicacion ===
                                            "Pendiente de configuración") && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                reintentar(evento.idEvento)
                                            }
                                        >
                                            {evento.intentosPublicacion?.length
                                                ? "Reintentar publicación"
                                                : "Intentar publicación"}
                                        </button>
                                    )
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            confirmar(validacion.idRecepcion)
                                        }
                                    >
                                        Confirmar disponibilidad
                                    </button>
                                )}
                            </article>
                        );
                    })}
                </div>
            )}

            <h3>Eventos MercaderiaDisponible</h3>
            {compras.eventosMercaderiaDisponible.length === 0 ? (
                <p>No hay eventos de disponibilidad registrados.</p>
            ) : (
                <ul>
                    {compras.eventosMercaderiaDisponible.map(evento => (
                        <li key={evento.idEvento}>
                            {evento.tipoEvento} · {evento.idEvento} · Recepción{" "}
                            {evento.idRecepcion} · {evento.estadoPublicacion} ·{" "}
                            {estadoDisponibilidad(evento)}
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
