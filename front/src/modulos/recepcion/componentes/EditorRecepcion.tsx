import { useState } from "react";
import type { FormEvent } from "react";
import { conexion } from "../../../servicios/api/configuracion";
import type { OrdenCompra, RecepcionValidada } from "../../ordenesCompra/tipos";
import { corregirRecepcion, motivoBloqueoRecepcion } from "../servicios/registroRecepcion";
import type { RecepcionRegistrada } from "../tipos/recepcion";

interface Props {
    recepcion: RecepcionRegistrada;
    orden?: OrdenCompra;
    recepcionesValidadas: readonly RecepcionValidada[];
    inspeccionRegistrada?: boolean;
}

export default function EditorRecepcion({
    recepcion,
    orden,
    recepcionesValidadas,
    inspeccionRegistrada = false,
}: Props) {
    const [editando, setEditando] = useState(false);
    const [fecha, setFecha] = useState("");
    const [documento, setDocumento] = useState("");
    const [responsable, setResponsable] = useState("");
    const [almacen, setAlmacen] = useState("");
    const [observacion, setObservacion] = useState("");
    const [guardando, setGuardando] = useState(false);
    const [cantidades, setCantidades] = useState<Record<number, string>>({});
    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");

    const bloqueo = inspeccionRegistrada
        ? "La recepción ya tiene una inspección registrada y no se puede editar."
        : motivoBloqueoRecepcion(recepcion, recepcionesValidadas);

    function abrir() {
        setFecha(recepcion.fecha);
        setDocumento(recepcion.documento);
        setResponsable("");
        setAlmacen(recepcion.almacen ?? "Almacén central");
        setObservacion(recepcion.observacion ?? "");
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

    async function guardar(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault();

        if (!orden || bloqueo || guardando) return;

        setError("");
        setGuardando(true);

        try {
            const mensajeServidor = await corregirRecepcion(recepcion.idRecepcion, {
                fecha,
                documento,
                responsable,
                ...(conexion.recepcion ? { almacen, observacion } : {}),
                detalles: orden.detalles.flatMap(linea => {
                    const cantidad = cantidades[linea.idDetalle] ?? "";
                    return cantidad.trim()
                        ? [{ idDetalleOrden: linea.idDetalle, cantidad }]
                        : [];
                }),
            });

            setEditando(false);
            setMensaje(mensajeServidor ?? "Corrección guardada.");
        } catch (fallo) {
            setError(
                fallo instanceof Error
                    ? fallo.message
                    : "No se pudo guardar la corrección.",
            );
        } finally {
            setGuardando(false);
        }
    }

    // Con la conexión activa se corrigen solo las líneas recibidas (sin agregar ni quitar).
    const lineasEditables = orden
        ? conexion.recepcion
            ? orden.detalles.filter(linea =>
                recepcion.detalles.some(detalle => detalle.idDetalleOrden === linea.idDetalle),
            )
            : orden.detalles
        : [];

    return (
        <div className="tarjeta">
            {recepcion.responsableCorreccion && (
                <p>Última corrección: {recepcion.responsableCorreccion}</p>
            )}

            {mensaje && (
                <p className="alerta alerta--exito" role="status">{mensaje}</p>
            )}

            {bloqueo || !orden ? (
                <p className="alerta alerta--error" role="alert">
                    {bloqueo ?? "No se encontró la orden vinculada."}
                </p>
            ) : editando ? (
                <form className="tarjeta" onSubmit={evento => void guardar(evento)} noValidate>
                    <h2>Corregir recepción de {orden.numero}</h2>

                    <label className="campo">
                        Fecha de recepción
                        <input
                            type="date"
                            value={fecha}
                            onChange={evento => setFecha(evento.target.value)}
                            required
                        />
                    </label>

                    {conexion.recepcion ? (
                        <>
                            <p>
                                <strong>Número de documento:</strong> {recepcion.documento}
                            </p>

                            <label className="campo">
                                Almacén de recepción
                                <input
                                    value={almacen}
                                    onChange={evento => setAlmacen(evento.target.value)}
                                    required
                                />
                            </label>

                            <label className="campo">
                                Observación
                                <input
                                    value={observacion}
                                    onChange={evento => setObservacion(evento.target.value)}
                                    placeholder="Motivo de la corrección"
                                />
                            </label>

                            <p>Corrige las cantidades de los productos recibidos en esta entrega.</p>
                        </>
                    ) : (
                        <>
                            <label className="campo">
                                Número de documento
                                <input
                                    value={documento}
                                    onChange={evento => setDocumento(evento.target.value)}
                                    required
                                />
                            </label>

                            <label className="campo">
                                Responsable de la corrección
                                <input
                                    value={responsable}
                                    onChange={evento => setResponsable(evento.target.value)}
                                    required
                                />
                            </label>

                            <p>Deja la cantidad en blanco para quitar una línea de esta recepción.</p>
                        </>
                    )}

                    {lineasEditables.map(linea => (
                        <label key={linea.idDetalle} className="campo">
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
                        <p className="alerta alerta--error" role="alert">{error}</p>
                    )}

                    <div className="resumen">
                        <button type="submit" disabled={guardando}>
                            {guardando ? "Guardando…" : "Guardar corrección"}
                        </button>
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