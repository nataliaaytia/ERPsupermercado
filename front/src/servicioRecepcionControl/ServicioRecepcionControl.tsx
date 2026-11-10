//natalia scrum 528

import { useState } from "react";
import type { FormEvent } from "react";
import EditorRecepcion from "./EditorRecepcion";
import ResumenCantidadesRecepcion from "./ResumenCantidadesRecepcion";
import CostoTransporteRecepcion from "./CostoTransporteRecepcion";
import MenuLateral from "../requisicionesCotizaciones/MenuLateral";
import { fechaHoy, useRequisiciones } from "../requisicionesCotizaciones/useRequisiciones";
import {
    ordenesDisponiblesParaRecepcion,
    registrarRecepcion,
} from "./registroRecepcion";
import "../requisicionesCotizaciones/Requisiciones.css";
import "../servicioOrdenesCompra/ServicioOrdenesCompra.css";
import "./ServicioRecepcionControl.css";

type OrdenDisponible = ReturnType<typeof ordenesDisponiblesParaRecepcion>[number];

const opciones = ["Registrar recepción", "Recepciones registradas"];

function FormularioRecepcion({
    seleccion,
    onMensaje,
}: {
    seleccion: OrdenDisponible;
    onMensaje: (mensaje: string) => void;
}) {
    const [fecha, setFecha] = useState(fechaHoy);
    const [documento, setDocumento] = useState("");
    const [cantidades, setCantidades] = useState<Record<number, string>>({});
    const [error, setError] = useState("");

    function guardar(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault();
        setError("");
        onMensaje("");

        try {
            registrarRecepcion({
                idOrden: seleccion.orden.idOrden,
                fecha,
                documento,
                detalles: seleccion.lineas.flatMap(linea => {
                    const cantidad = cantidades[linea.idDetalle] ?? "";
                    return cantidad.trim() ? [{ idDetalleOrden: linea.idDetalle, cantidad }] : [];
                }),
            });

            onMensaje(`Entrega de ${seleccion.orden.numero} guardada. Quedó pendiente de inspección.`);
            setDocumento("");
            setCantidades({});
        } catch (fallo) {
            setError(fallo instanceof Error ? fallo.message : "No se pudo registrar la recepción.");
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
                    <span>Línea {linea.idDetalle} · {linea.producto}</span>
                    <span>
                        Ordenadas: {linea.ordenadas} · Aceptadas: {linea.aceptadas} ·
                        En inspección: {linea.enInspeccion} · Disponible: {linea.disponible}
                    </span>
                    <input
                        type="number"
                        min="1"
                        max={linea.disponible}
                        step="1"
                        disabled={linea.disponible === 0}
                        placeholder="Cantidad recibida"
                        value={cantidades[linea.idDetalle] ?? ""}
                        onChange={evento => {
                            const valor = evento.target.value;
                            setCantidades(actuales => ({ ...actuales, [linea.idDetalle]: valor }));
                        }}
                    />
                </label>
            ))}

            {error && <p className="ordenes-compra__error" role="alert">{error}</p>}

            <button type="submit">Registrar recepción</button>
        </form>
    );
}

export default function ServicioRecepcionControl() {
    const compras = useRequisiciones();
    const [opcionActiva, setOpcionActiva] = useState(0);
    const [menuAbierto, setMenuAbierto] = useState(true);
    const [idOrden, setIdOrden] = useState("");
    const [mensaje, setMensaje] = useState("");

    const disponibles = ordenesDisponiblesParaRecepcion(
        compras.ordenes,
        compras.recepcionesValidadas,
        compras.recepcionesRegistradas,
    );

    const seleccion = disponibles.find(item => String(item.orden.idOrden) === idOrden);

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
                    <p className="ordenes-compra__error" role="alert">{compras.errorCarga}</p>
                ) : opcionActiva === 0 ? (
                    <>
                        {mensaje && <p className="ordenes-compra__exito" role="status">{mensaje}</p>}

                        {disponibles.length === 0 ? (
                            <p>No hay órdenes confirmadas con saldo pendiente.</p>
                        ) : (
                            <label className="ordenes-compra__campo">
                                Orden de compra
                                <select
                                    value={idOrden}
                                    onChange={evento => {
                                        setIdOrden(evento.target.value);
                                        setMensaje("");
                                    }}
                                >
                                    <option value="">Selecciona una orden</option>
                                    {disponibles.map(({ orden }) => (
                                        <option key={orden.idOrden} value={orden.idOrden}>{orden.numero}</option>
                                    ))}
                                </select>
                            </label>
                        )}

                        {seleccion && (
                            <FormularioRecepcion
                                key={seleccion.orden.idOrden}
                                seleccion={seleccion}
                                onMensaje={setMensaje}
                            />
                        )}
                    </>
                ) : (
                    <section className="ordenes-compra__tarjeta">
                        {compras.recepcionesRegistradas.length === 0 ? (
                            <p>Todavía no hay recepciones registradas.</p>
                        ) : (
                            [...compras.recepcionesRegistradas].reverse().map(recepcion => {
                                const orden = compras.ordenes.find(item => item.idOrden === recepcion.idOrden);

                                return (
                                    <details key={recepcion.idRecepcion}>
                                        <summary>
                                            {recepcion.documento} · {orden?.numero ?? `Orden ${recepcion.idOrden}`} · {recepcion.estado}
                                        </summary>
                                        <p>Fecha: {recepcion.fecha}</p>
                                        <ResumenCantidadesRecepcion
                                            recepcion={recepcion}
                                            validadas={compras.recepcionesValidadas}
                                        />
                                        <EditorRecepcion
                                            recepcion={recepcion}
                                            orden={orden}
                                            recepcionesValidadas={compras.recepcionesValidadas}
                                        />
                                        <CostoTransporteRecepcion
                                            recepcion={recepcion}
                                            recepcionesValidadas={compras.recepcionesValidadas}
                                        />
                                    </details>
                                );
                            })
                        )}
                    </section>
                )}
            </section>
        </div>
    );
}