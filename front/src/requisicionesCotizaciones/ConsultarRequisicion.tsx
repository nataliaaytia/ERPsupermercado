import { useState } from "react";

import type {
    Requisicion,
    SolicitudCotizacion,
} from "./tipos";

import EtiquetaEstado from "./EtiquetaEstado";

import {
    codigoRequisicion,
} from "./formatoRequisicion";

import "./ConsultarRequisicion.css";

interface Props {
    requisiciones: Requisicion[];
    solicitudes: SolicitudCotizacion[];
}

const mostrarFecha = (valor: string) => {
    const fecha = new Date(valor);

    return Number.isNaN(fecha.getTime())
        ? valor
        : fecha.toLocaleString("es-BO");
};

export default function ConsultarRequisicion({
    requisiciones,
    solicitudes,
}: Props) {
    const [idSeleccionado, setIdSeleccionado] =
        useState("");

    const requisicion = requisiciones.find(
        actual =>
            actual.idRequisicion ===
            Number(idSeleccionado),
    );

    const vinculadas = solicitudes.filter(
        solicitud =>
            solicitud.requisicion ===
            requisicion?.idRequisicion,
    );

    const historial = [
        ...(requisicion?.historial ?? []),
    ].reverse();

    return (
        <div className="consulta-requisicion">
            <label className="consulta-requisicion__selector">
                Requisición

                <select
                    value={idSeleccionado}
                    onChange={event =>
                        setIdSeleccionado(
                            event.target.value,
                        )
                    }
                >
                    <option value="">
                        Seleccionar requisición
                    </option>

                    {requisiciones.map(actual => (
                        <option
                            key={actual.idRequisicion}
                            value={actual.idRequisicion}
                        >
                            {codigoRequisicion(
                                actual.idRequisicion,
                            )}
                            {" · "}
                            {actual.solicitante}
                            {" · "}
                            {actual.estado}
                        </option>
                    ))}
                </select>
            </label>

            {requisiciones.length === 0 && (
                <p className="consulta-requisicion__vacio">
                    Todavía no hay requisiciones.
                </p>
            )}

            {requisicion && (
                <>
                    <section className="consulta-requisicion__panel">
                        <header className="consulta-requisicion__encabezado">
                            <h2>
                                {codigoRequisicion(
                                    requisicion.idRequisicion,
                                )}
                            </h2>

                            <EtiquetaEstado
                                requisicion={requisicion}
                            />
                        </header>

                        <dl className="consulta-requisicion__datos">
                            <div>
                                <dt>Fecha de registro</dt>
                                <dd>{requisicion.fecha}</dd>
                            </div>

                            <div>
                                <dt>Solicitante</dt>
                                <dd>
                                    {requisicion.solicitante}
                                </dd>
                            </div>

                            <div>
                                <dt>Prioridad actual</dt>
                                <dd>
                                    {requisicion.prioridad}
                                </dd>
                            </div>
                        </dl>

                        <div>
                            <h3>Observación actual</h3>

                            <p className="consulta-requisicion__texto">
                                {requisicion.observacion ||
                                    "Sin observaciones."}
                            </p>
                        </div>

                        <h3>Productos actuales</h3>

                        <div className="consulta-requisicion__tabla-contenedor">
                            <table className="consulta-requisicion__tabla">
                                <thead>
                                    <tr>
                                        <th>Producto</th>
                                        <th>Cantidad</th>
                                        <th>Observación</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {requisicion.detalles.map(
                                        detalle => (
                                            <tr
                                                key={detalle.idDetalle}
                                            >
                                                <td>
                                                    {detalle.producto
                                                        .descripcion ||
                                                        "(sin nombre)"}
                                                </td>

                                                <td>
                                                    {detalle.cantidad}
                                                </td>

                                                <td className="consulta-requisicion__texto">
                                                    {detalle.observacion ||
                                                        "—"}
                                                </td>
                                            </tr>
                                        ),
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section className="consulta-requisicion__panel">
                        <h2>Cotizaciones vinculadas</h2>

                        {vinculadas.length === 0 ? (
                            <p className="consulta-requisicion__vacio">
                                Esta requisición no tiene
                                solicitudes de cotización.
                            </p>
                        ) : (
                            <ul className="consulta-requisicion__solicitudes">
                                {vinculadas.map(solicitud => (
                                    <li
                                        key={solicitud.idSolicitud}
                                    >
                                        <strong>
                                            COT-
                                            {String(
                                                solicitud.idSolicitud,
                                            ).padStart(4, "0")}
                                        </strong>

                                        <span>
                                            {solicitud.estado}
                                        </span>

                                        <span>
                                            Fecha límite:{" "}
                                            {solicitud.fechaLimite}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    <section className="consulta-requisicion__panel">
                        <h2>Historial de cambios</h2>

                        <p className="consulta-requisicion__nota">
                            Se muestran primero los cambios
                            más recientes. Los cambios
                            anteriores a la activación del
                            historial pueden no estar
                            registrados.
                        </p>

                        {historial.length === 0 ? (
                            <p className="consulta-requisicion__vacio">
                                Esta requisición todavía no
                                tiene cambios registrados en
                                el historial.
                            </p>
                        ) : (
                            <ol className="consulta-requisicion__historial">
                                {historial.map(registro => (
                                    <li
                                        key={registro.idRegistro}
                                        className="consulta-requisicion__evento"
                                    >
                                        <header className="consulta-requisicion__evento-encabezado">
                                            <strong>
                                                {registro.accion}
                                            </strong>

                                            <time
                                                dateTime={registro.fecha}
                                            >
                                                {mostrarFecha(
                                                    registro.fecha,
                                                )}
                                            </time>
                                        </header>

                                        <div className="consulta-requisicion__tabla-contenedor">
                                            <table className="consulta-requisicion__tabla">
                                                <thead>
                                                    <tr>
                                                        <th>Campo</th>
                                                        <th>Antes</th>
                                                        <th>Después</th>
                                                    </tr>
                                                </thead>

                                                <tbody>
                                                    {registro.cambios.map(
                                                        (cambio, indice) => (
                                                            <tr key={indice}>
                                                                <th scope="row">
                                                                    {cambio.campo}
                                                                </th>

                                                                <td className="consulta-requisicion__texto">
                                                                    {cambio.anterior ||
                                                                        "—"}
                                                                </td>

                                                                <td className="consulta-requisicion__texto">
                                                                    {cambio.actual ||
                                                                        "—"}
                                                                </td>
                                                            </tr>
                                                        ),
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        )}
                    </section>
                </>
            )}
        </div>
    );
}