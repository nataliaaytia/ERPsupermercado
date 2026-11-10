import { useState } from "react";
import type { FormEvent } from "react";
import type { OrdenCompra, RecepcionValidada } from "../servicioOrdenesCompra/tipos";
import { corregirRecepcion, motivoBloqueoRecepcion } from "./registroRecepcion";
import type { RecepcionRegistrada } from "./tiposRecepcion";

interface Props {
    recepcion: RecepcionRegistrada;
    orden?: OrdenCompra;
    recepcionesValidadas: readonly RecepcionValidada[];
}

export default function EditorRecepcion({
    recepcion,
    orden,
    recepcionesValidadas,
}: Props) {
    const [editando, setEditando] = useState(false);
    const [fecha, setFecha] = useState("");
    const [documento, setDocumento] = useState("");
    const [responsable, setResponsable] = useState("");
    const [cantidades, setCantidades] = useState<Record<number, string>>({});
    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");

    const bloqueo = motivoBloqueoRecepcion(recepcion, recepcionesValidadas);

    function abrir() {
        setFecha(recepcion.fecha);
        setDocumento(recepcion.documento);
        setResponsable("");
        setCantidades(
            Object.fromEntries(
                recepcion.detalles.map(linea => [
                    linea.idDetalleOrden,
                    String(linea.cantidadRecibida),
                ]),
            ),
        );
        setError("");
        setMensaje("");
        setEditando(true);
    }

    function guardar(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault();

        if (!orden || bloqueo) return;

        setError("");

        try {
            corregirRecepcion(recepcion.idRecepcion, {
                fecha,
                documento,
                responsable,
                detalles: orden.detalles.flatMap(linea => {
                    const cantidad = cantidades[linea.idDetalle] ?? "";
                    return cantidad.trim()
                        ? [{ idDetalleOrden: linea.idDetalle, cantidad }]
                        : [];
                }),
            });

            setEditando(false);
            setMensaje("Corrección guardada.");
        } catch (fallo) {
            setError(
                fallo instanceof Error
                    ? fallo.message
                    : "No se pudo guardar la corrección.",
            );
        }
    }

    return (
        <div className="ordenes-compra__tarjeta">
            {recepcion.responsableCorreccion && (
                <p>Última corrección: {recepcion.responsableCorreccion}</p>
            )}

            {mensaje && (
                <p className="ordenes-compra__exito" role="status">{mensaje}</p>
            )}

            {bloqueo || !orden ? (
                <p className="ordenes-compra__error" role="alert">
                    {bloqueo ?? "No se encontró la orden vinculada."}
                </p>
            ) : editando ? (
                <form className="ordenes-compra__tarjeta" onSubmit={guardar} noValidate>
                    <h2>Corregir recepción de {orden.numero}</h2>

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
                            value={documento}
                            onChange={evento => setDocumento(evento.target.value)}
                            required
                        />
                    </label>

                    <label className="ordenes-compra__campo">
                        Responsable de la corrección
                        <input
                            value={responsable}
                            onChange={evento => setResponsable(evento.target.value)}
                            required
                        />
                    </label>

                    <p>Deja la cantidad en blanco para quitar una línea de esta recepción.</p>

                    {orden.detalles.map(linea => (
                        <label key={linea.idDetalle} className="ordenes-compra__campo">
                            Línea {linea.idDetalle} · {linea.producto.descripcion}
                            <input
                                type="number"
                                min="1"
                                step="1"
                                value={cantidades[linea.idDetalle] ?? ""}
                                onChange={evento => {
                                    const valor = evento.target.value;
                                    setCantidades(actual => ({
                                        ...actual,
                                        [linea.idDetalle]: valor,
                                    }));
                                }}
                            />
                        </label>
                    ))}

                    {error && (
                        <p className="ordenes-compra__error" role="alert">{error}</p>
                    )}

                    <div className="ordenes-compra__resumen">
                        <button type="submit">Guardar corrección</button>
                        <button type="button" onClick={() => setEditando(false)}>
                            Cancelar
                        </button>
                    </div>
                </form>
            ) : (
                <button type="button" onClick={abrir}>Editar recepción</button>
            )}
        </div>
    );
}