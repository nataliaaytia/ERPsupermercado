import { useState } from "react";

import type {
    Dispatch,
    FormEvent,
} from "react";

import type {
    AccionCompras,
    EstadoCompras,
} from "./modeloCompras";

import {
    resumirRequisiciones,
} from "./consolidacionRequisiciones";

import {
    codigoRequisicion,
} from "./formatoRequisicion";

import { fechaHoy } from "./useRequisiciones";

import "./ConsolidarRequisiciones.css";

interface Props {
    estado: EstadoCompras;
    dispatch: Dispatch<AccionCompras>;
}

export default function ConsolidarRequisiciones({
    estado,
    dispatch,
}: Props) {
    const [ids, setIds] = useState<number[]>([]);

    const [solicitante, setSolicitante] =
        useState("Compras");

    const [observacion, setObservacion] =
        useState(
            "Consolidación de necesidades relacionadas.",
        );

    const [fechaLimite, setFechaLimite] =
        useState("");

    const [error, setError] = useState("");

    const hoy = fechaHoy();

    const disponibles = estado.requisiciones.filter(
        requisicion =>
            requisicion.estado === "Aprobada" &&
            !estado.solicitudes.some(
                solicitud =>
                    solicitud.requisicion ===
                    requisicion.idRequisicion,
            ),
    );

    const seleccionadas = disponibles.filter(
        requisicion =>
            ids.includes(requisicion.idRequisicion),
    );

    const resumen =
        resumirRequisiciones(seleccionadas);

    const todasSeleccionadas =
        disponibles.length > 0 &&
        seleccionadas.length === disponibles.length;

    const cambiarSeleccion = (id: number) => {
        setIds(actuales =>
            actuales.includes(id)
                ? actuales.filter(actual => actual !== id)
                : [...actuales, id],
        );

        setError("");
    };

    const seleccionarTodas = () => {
        setIds(
            todasSeleccionadas
                ? []
                : disponibles.map(
                    requisicion =>
                        requisicion.idRequisicion,
                ),
        );

        setError("");
    };

    const consolidar = (
        event: FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();
        setError("");

        if (seleccionadas.length < 2) {
            setError(
                "Selecciona al menos dos requisiciones.",
            );
            return;
        }

        if (!solicitante.trim()) {
            setError(
                "Escribe el responsable de la consolidación.",
            );
            return;
        }

        if (observacion.trim().length < 10) {
            setError(
                "Explica el motivo en al menos 10 caracteres.",
            );
            return;
        }

        if (
            !fechaLimite ||
            fechaLimite < hoy
        ) {
            setError(
                "Selecciona una fecha límite válida.",
            );
            return;
        }

        if (resumen.errores.length > 0) {
            setError(
                "Corrige los problemas indicados en la vista previa.",
            );
            return;
        }

        dispatch({
            tipo: "consolidar",
            ids: seleccionadas.map(
                requisicion =>
                    requisicion.idRequisicion,
            ),
            solicitante,
            observacion,
            fechaLimite,
            hoy,
        });
    };

    return (
        <form
            className="consolidar-requisiciones"
            onSubmit={consolidar}
            noValidate
        >
            <header>
                <h2>Consolidar requisiciones</h2>

                <p>
                    Selecciona requisiciones aprobadas que
                    correspondan a una misma necesidad de compra.
                </p>
            </header>

            <div className="consolidar-requisiciones__aviso">
                Se creará una requisición agrupada y una
                solicitud de cotización. Los productos
                repetidos se agruparán por su identificador
                y sus cantidades se sumarán.
                Las originales quedarán anuladas por
                consolidación y conservarán sus detalles.
            </div>

            {disponibles.length < 2 && (
                <p className="consolidar-requisiciones__vacio">
                    Necesitas al menos dos requisiciones
                    aprobadas y sin solicitudes de cotización
                    previas.
                </p>
            )}

            <div className="consolidar-requisiciones__barra">
                <span>
                    Seleccionadas: {seleccionadas.length}
                </span>

                <button
                    type="button"
                    className="consolidar-requisiciones__secundario"
                    disabled={disponibles.length === 0}
                    onClick={seleccionarTodas}
                >
                    {todasSeleccionadas
                        ? "Quitar selección"
                        : "Seleccionar todas"}
                </button>
            </div>

            <div className="consolidar-requisiciones__lista">
                {disponibles.map(requisicion => (
                    <label
                        key={requisicion.idRequisicion}
                        className="consolidar-requisiciones__opcion"
                    >
                        <input
                            type="checkbox"
                            checked={ids.includes(
                                requisicion.idRequisicion,
                            )}
                            onChange={() =>
                                cambiarSeleccion(
                                    requisicion.idRequisicion,
                                )
                            }
                        />

                        <span>
                            <strong>
                                {codigoRequisicion(
                                    requisicion.idRequisicion,
                                )}
                                {" · "}
                                Prioridad {requisicion.prioridad}
                            </strong>

                            <small>
                                {requisicion.solicitante}
                                {" · "}
                                {requisicion.observacion}
                            </small>

                            <small>
                                {requisicion.detalles
                                    .map(
                                        detalle =>
                                            `${detalle.producto.descripcion} × ${detalle.cantidad}`,
                                    )
                                    .join(" · ")}
                            </small>
                        </span>
                    </label>
                ))}
            </div>

            {seleccionadas.length > 0 && (
                <section className="consolidar-requisiciones__resumen">
                    <h3>Vista previa de consolidación</h3>

                    <p>
                        Prioridad resultante:{" "}
                        <strong>{resumen.prioridad}</strong>
                    </p>

                    <p>
                        Requisiciones de origen:{" "}
                        {seleccionadas
                            .map(requisicion =>
                                codigoRequisicion(
                                    requisicion.idRequisicion,
                                ),
                            )
                            .join(", ")}
                    </p>

                    <div className="consolidar-requisiciones__tabla-contenedor">
                        <table className="consolidar-requisiciones__tabla">
                            <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th>Cantidad total</th>
                                    <th>Origen y observaciones</th>
                                </tr>
                            </thead>

                            <tbody>
                                {resumen.detalles.map(detalle => (
                                    <tr key={detalle.idDetalle}>
                                        <td>
                                            {detalle.producto.descripcion}
                                        </td>

                                        <td>{detalle.cantidad}</td>

                                        <td className="consolidar-requisiciones__detalle">
                                            {detalle.observacion}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {resumen.errores.length > 0 && (
                        <div
                            role="alert"
                            className="consolidar-requisiciones__error"
                        >
                            <strong>
                                No se puede consolidar:
                            </strong>

                            <ul>
                                {resumen.errores.map(
                                    (mensaje, indice) => (
                                        <li key={indice}>
                                            {mensaje}
                                        </li>
                                    ),
                                )}
                            </ul>
                        </div>
                    )}
                </section>
            )}

            <div className="consolidar-requisiciones__campos">
                <label>
                    Responsable de la consolidación

                    <input
                        type="text"
                        maxLength={120}
                        value={solicitante}
                        onChange={event => {
                            setSolicitante(event.target.value);
                            setError("");
                        }}
                    />
                </label>

                <label>
                    Fecha límite de cotización

                    <input
                        type="date"
                        min={hoy}
                        value={fechaLimite}
                        onChange={event => {
                            setFechaLimite(event.target.value);
                            setError("");
                        }}
                    />
                </label>

                <label className="consolidar-requisiciones__motivo">
                    Motivo de la consolidación

                    <textarea
                        rows={3}
                        maxLength={180}
                        value={observacion}
                        onChange={event => {
                            setObservacion(event.target.value);
                            setError("");
                        }}
                    />
                </label>
            </div>

            {error && (
                <p
                    role="alert"
                    className="consolidar-requisiciones__error"
                >
                    {error}
                </p>
            )}

            <button
                type="submit"
                className="consolidar-requisiciones__confirmar"
                disabled={
                    seleccionadas.length < 2 ||
                    resumen.errores.length > 0
                }
            >
                Consolidar y generar solicitud
            </button>
        </form>
    );
}