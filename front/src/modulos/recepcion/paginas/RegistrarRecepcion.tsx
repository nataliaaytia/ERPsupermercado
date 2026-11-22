import { useState } from "react";
import type { FormEvent } from "react";
import { fechaHoy, useCompras } from "../../../estado/useCompras";
import { conexion } from "../../../servicios/api/configuracion";
import {
    ordenesDisponiblesParaRecepcion,
    registrarRecepcion,
} from "../servicios/registroRecepcion";

type OrdenDisponible = ReturnType<typeof ordenesDisponiblesParaRecepcion>[number];

function FormularioRecepcion({
    seleccion,
    onMensaje,
}: {
    seleccion: OrdenDisponible;
    onMensaje: (mensaje: string) => void;
}) {
    const [fecha, setFecha] = useState(fechaHoy);
    const [documento, setDocumento] = useState("");
    const [almacen, setAlmacen] = useState("Almacén central");
    const [cantidades, setCantidades] = useState<Record<number, string>>({});
    const [error, setError] = useState("");
    const [guardando, setGuardando] = useState(false);

    async function guardar(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault();
        if (guardando) return;
        setError("");
        onMensaje("");
        setGuardando(true);

        try {
            const mensajeServidor = await registrarRecepcion({
                idOrden: seleccion.orden.idOrden,
                fecha,
                documento,
                ...(conexion.recepcion ? { almacen } : {}),
                detalles: seleccion.lineas.flatMap(linea => {
                    const cantidad = cantidades[linea.idDetalle] ?? "";

                    return cantidad.trim()
                        ? [{ idDetalleOrden: linea.idDetalle, cantidad }]
                        : [];
                }),
            });

            onMensaje(
                mensajeServidor ??
                    `Entrega de ${seleccion.orden.numero} guardada. Quedó pendiente de inspección.`,
            );
            setDocumento("");
            setCantidades({});
        } catch (fallo) {
            setError(
                fallo instanceof Error
                    ? fallo.message
                    : "No se pudo registrar la recepción.",
            );
        } finally {
            setGuardando(false);
        }
    }

    return (
        <form className="tarjeta" onSubmit={evento => void guardar(evento)} noValidate>
            <h2>Entrega de la orden {seleccion.orden.numero}</h2>

            <label className="campo">
                Fecha de recepción
                <input
                    type="date"
                    value={fecha}
                    onChange={evento => setFecha(evento.target.value)}
                    required
                />
            </label>

            <label className="campo">
                Número de documento
                <input
                    type="text"
                    value={documento}
                    onChange={evento => setDocumento(evento.target.value)}
                    placeholder="Ej. REM-001"
                    required
                />
            </label>

            {conexion.recepcion && (
                <label className="campo">
                    Almacén de recepción
                    <input
                        type="text"
                        value={almacen}
                        onChange={evento => setAlmacen(evento.target.value)}
                        placeholder="Ej. Almacén central"
                        required
                    />
                </label>
            )}

            <p>Deja en blanco las líneas que no llegaron en esta entrega.</p>

            {seleccion.lineas.map(linea => (
                <label key={linea.idDetalle} className="campo">
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
                            setCantidades(actuales => ({
                                ...actuales,
                                [linea.idDetalle]: valor,
                            }));
                        }}
                    />
                </label>
            ))}

            {error && (
                <p className="alerta alerta--error" role="alert">{error}</p>
            )}

            <button type="submit" disabled={guardando}>
                {guardando ? "Guardando…" : "Registrar recepción"}
            </button>
        </form>
    );
}

/** Registro de la mercadería entregada por el proveedor contra una orden confirmada. */
export default function RegistrarRecepcion() {
    const compras = useCompras();
    const [idOrden, setIdOrden] = useState("");
    const [mensaje, setMensaje] = useState("");

    const disponibles = ordenesDisponiblesParaRecepcion(
        compras.ordenes,
        compras.recepcionesValidadas,
        compras.recepcionesRegistradas,
    );

    const seleccion = disponibles.find(
        item => String(item.orden.idOrden) === idOrden,
    );

    return (
        <>
            {mensaje && (
                <p className="alerta alerta--exito" role="status">{mensaje}</p>
            )}

            {disponibles.length === 0 ? (
                <p className="estado-vacio">
                    No hay órdenes confirmadas con saldo pendiente de entrega.
                </p>
            ) : (
                <label className="campo">
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
                    onMensaje={setMensaje}
                />
            )}
        </>
    );
}
