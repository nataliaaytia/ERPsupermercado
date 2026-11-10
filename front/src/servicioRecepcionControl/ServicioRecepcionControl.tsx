import { useState } from "react";
import type { FormEvent } from "react";
import MenuLateral from "../requisicionesCotizaciones/MenuLateral";
import "./ServicioRecepcionControl.css";

import { fechaHoy, useRequisiciones } from "../requisicionesCotizaciones/useRequisiciones";
import {
    ordenesDisponiblesParaRecepcion,
    registrarRecepcion,
} from "./registroRecepcion";
import RevisionFinalRecepcion from "./RevisionFinalRecepcion";
import { confirmarRecepcion } from "./validarRecepcion";
import DevolucionesRecepcion from "./DevolucionesRecepcion";
import "../requisicionesCotizaciones/Requisiciones.css";
import "../servicioOrdenesCompra/ServicioOrdenesCompra.css";

type OrdenDisponible = ReturnType<typeof ordenesDisponiblesParaRecepcion>[number];

const opciones = [
    "Registrar recepción",
    "Recepciones registradas",
    "Validación final",
    "Devoluciones",
];

function FormularioRecepcion({ seleccion }: { seleccion: OrdenDisponible }) {
    const [fecha, setFecha] = useState(fechaHoy);
    const [documento, setDocumento] = useState("");
    const [cantidades, setCantidades] = useState<Record<number, string>>({});
    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");

    function guardar(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault();
        setError("");
        setMensaje("");

        try {
            registrarRecepcion({
                idOrden: seleccion.orden.idOrden,
                fecha,
                documento,
                detalles: seleccion.lineas.flatMap(linea => {
                    const cantidad = cantidades[linea.idDetalle] ?? "";
                    return cantidad.trim()
                        ? [{ idDetalleOrden: linea.idDetalle, cantidad }]
                        : [];
                }),
            });

            setMensaje(
                `Recepción de ${seleccion.orden.numero} guardada. Quedó pendiente de inspección.`,
            );
            setDocumento("");
            setCantidades({});
        } catch (fallo) {
            setError(
                fallo instanceof Error
                    ? fallo.message
                    : "No se pudo registrar la recepción.",
            );
        }
    }

    return (
        <form className="ordenes-compra__tarjeta" onSubmit={guardar} noValidate>
            <h2>Entrega de la orden {seleccion.orden.numero}</h2>

            <label className="ordenes-compra__campo">
                Fecha de recepción
                <input
                    type="date"
                    value={fecha}
                    onChange={evento => setFecha(evento.target.value)}
                    required
                />
            </label>

            <label className="ordenes-compra__campo">
                Número de documento
                <input
                    type="text"
                    value={documento}
                    onChange={evento => setDocumento(evento.target.value)}
                    placeholder="Ej. REM-001"
                    required
                />
            </label>

            <p>Deja en blanco las líneas que no llegaron en esta entrega.</p>

            {seleccion.lineas.map(linea => (
                <label key={linea.idDetalle} className="ordenes-compra__campo">
                    Línea {linea.idDetalle} · {linea.producto} · {linea.pendientes} por aceptar
                    <input
                        type="number"
                        min="1"
                        step="1"
                        placeholder="Cantidad recibida"
                        value={cantidades[linea.idDetalle] ?? ""}
                        onChange={evento => {
                            const valor = evento.target.value;
                            setCantidades(actuales => ({
                                ...actuales,
                                [linea.idDetalle]: valor,
                            }));
                        }}
                    />
                </label>
            ))}

            {error && (
                <p className="ordenes-compra__error" role="alert">{error}</p>
            )}

            {mensaje && (
                <p className="ordenes-compra__exito" role="status">{mensaje}</p>
            )}

            <button type="submit">Registrar recepción</button>
        </form>
    );
}

export default function ServicioRecepcionControl() {
    const compras = useRequisiciones();
    const [opcionActiva, setOpcionActiva] = useState(0);
    const [menuAbierto, setMenuAbierto] = useState(true);
    const [idOrden, setIdOrden] = useState("");

    const disponibles = ordenesDisponiblesParaRecepcion(
        compras.ordenes,
        compras.recepcionesValidadas,
    );

    const seleccion = disponibles.find(
        item => String(item.orden.idOrden) === idOrden,
    );

    return (
        <div className="requisiciones-container">
            <MenuLateral
                titulo="Recepción y Control"
                opciones={opciones}
                opcionActiva={opcionActiva}
                abierto={menuAbierto}
                onAbrirCerrar={() => setMenuAbierto(actual => !actual)}
                onElegir={setOpcionActiva}
            />

            <section className="requisiciones-contenido ordenes-compra recepcion-control">
                <header className="requisiciones-header">
                    <p className="requisiciones-subtitulo">Recepción y Control</p>
                    <h1 className="requisiciones-titulo">{opciones[opcionActiva]}</h1>
                </header>

                {compras.errorCarga ? (
                    <p className="ordenes-compra__error" role="alert">
                        {compras.errorCarga}
                    </p>
                ) : opcionActiva === 0 ? (
                    <>
                        {disponibles.length === 0 ? (
                            <p>No hay órdenes confirmadas con saldo pendiente.</p>
                        ) : (
                            <label className="ordenes-compra__campo">
                                Orden de compra
                                <select
                                    value={idOrden}
                                    onChange={evento => setIdOrden(evento.target.value)}
                                >
                                    <option value="">Selecciona una orden</option>
                                    {disponibles.map(({ orden }) => (
                                        <option key={orden.idOrden} value={orden.idOrden}>
                                            {orden.numero}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        )}

                        {seleccion && (
                            <FormularioRecepcion
                                key={seleccion.orden.idOrden}
                                seleccion={seleccion}
                            />
                        )}
                    </>
                ) : opcionActiva === 1 ? (
                    <section className="ordenes-compra__tarjeta">
                        {compras.recepcionesRegistradas.length === 0 ? (
                            <p>Todavía no hay recepciones registradas.</p>
                        ) : (
                            [...compras.recepcionesRegistradas].reverse().map(recepcion => {
                                const orden = compras.ordenes.find(
                                    item => item.idOrden === recepcion.idOrden,
                                );
                                const validacion =
                                    compras.recepcionesValidadas.find(
                                        item =>
                                            item.idRecepcion ===
                                                recepcion.idRecepcion &&
                                            item.idOrden === recepcion.idOrden &&
                                            item.estado === "Validada",
                                    );

                                return (
                                    <details key={recepcion.idRecepcion}>
                                        <summary>
                                            {recepcion.documento} · {orden?.numero ?? `Orden ${recepcion.idOrden}`} · {validacion ? "Validada" : recepcion.estado}
                                        </summary>
                                        <p>Fecha: {recepcion.fecha}</p>
                                        <ul>
                                            {recepcion.detalles.map(detalle => {
                                                const detalleValidado =
                                                    validacion?.detalles.find(
                                                        item =>
                                                            item.idDetalleOrden ===
                                                            detalle.idDetalleOrden,
                                                    );
                                                const aceptadas =
                                                    detalleValidado?.cantidadAceptada;

                                                return (
                                                    <li key={detalle.idDetalleOrden}>
                                                        Línea {detalle.idDetalleOrden} · {detalle.cantidadRecibida} recibidas
                                                        {aceptadas !== undefined &&
                                                            ` · ${aceptadas} aceptadas · ${detalle.cantidadRecibida - aceptadas} rechazadas`}
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </details>
                                );
                            })
                        )}
                    </section>
                ) : opcionActiva === 2 ? (
                    <RevisionFinalRecepcion
                        recepciones={compras.recepcionesRegistradas}
                        ordenes={compras.ordenes}
                        recepcionesValidadas={compras.recepcionesValidadas}
                        onConfirmar={confirmarRecepcion}
                    />
                ) : (
                    <DevolucionesRecepcion />
                )}
            </section>
        </div>
    );
}