import { useState } from "react";
import type { FormEvent } from "react";
import type {
    DevolucionSeguimiento as DatosDevolucion,
    TipoResolucionDevolucion,
} from "../tipos/devolucion";
import { registrarResolucionDevolucion } from "../servicios/servicioDevoluciones";

interface PropsSeguimientoDevolucion {
    devolucion: DatosDevolucion;
}

export default function SeguimientoDevolucion({
    devolucion,
}: PropsSeguimientoDevolucion) {
    const [tipo, setTipo] = useState<TipoResolucionDevolucion>("retiro");
    const [evidencia, setEvidencia] = useState("");
    const [detalleCompromiso, setDetalleCompromiso] = useState("");
    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [guardando, setGuardando] = useState(false);

    async function guardar(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault();
        if (guardando) return;
        setError("");
        setMensaje("");
        setGuardando(true);

        try {
            const mensajeServidor = await registrarResolucionDevolucion({
                idDevolucion: devolucion.idDevolucion,
                tipo,
                evidencia,
                ...(tipo === "reposicion" ? { detalleCompromiso } : {}),
            });
            setMensaje(mensajeServidor ?? "");
        } catch (fallo) {
            setError(
                fallo instanceof Error
                    ? fallo.message
                    : "No se pudo registrar la resolución de la devolución.",
            );
        } finally {
            setGuardando(false);
        }
    }

    const resolucion = devolucion.resolucion;

    return (
        <article className="devolucion-seguimiento">
            <h3>Devolución {devolucion.idDevolucion}</h3>
            <dl className="devolucion-seguimiento__datos">
                <div>
                    <dt>Recepción</dt>
                    <dd>
                        {devolucion.documentoRecepcion} ·{" "}
                        {devolucion.fechaRecepcion || "Fecha no disponible"}
                    </dd>
                </div>
                <div>
                    <dt>Orden</dt>
                    <dd>{devolucion.numeroOrden}</dd>
                </div>
                <div>
                    <dt>Producto / línea</dt>
                    <dd>
                        {devolucion.producto} · Línea {devolucion.idDetalleOrden}
                    </dd>
                </div>
                <div>
                    <dt>Cantidad devuelta</dt>
                    <dd>{devolucion.cantidadDevuelta}</dd>
                </div>
                <div>
                    <dt>Proveedor responsable</dt>
                    <dd>{devolucion.proveedor}</dd>
                </div>
                <div>
                    <dt>Estado</dt>
                    <dd>
                        {resolucion?.tipo === "retiro"
                            ? "Retiro registrado"
                            : resolucion?.tipo === "reposicion"
                              ? "Reposición comprometida"
                              : "Pendiente de resolución"}
                    </dd>
                </div>
            </dl>

            {mensaje && (
                <p className="alerta alerta--info" role="status">
                    {mensaje}
                </p>
            )}

            {resolucion ? (
                <div className="alerta alerta--exito">
                    <p>
                        Resolución:{" "}
                        {resolucion.tipo === "retiro"
                            ? "Retiro de mercadería"
                            : "Compromiso de reposición"}
                    </p>
                    <p>
                        Registrada:{" "}
                        {new Date(resolucion.fechaRegistro).toLocaleString(
                            "es-BO",
                        )}
                    </p>
                    {resolucion.tipo === "reposicion" && (
                        <p>
                            Compromiso:{" "}
                            {resolucion.detalleCompromiso ??
                                "Detalle no disponible en el registro guardado"}
                        </p>
                    )}
                    <p>Evidencia: {resolucion.evidencia}</p>
                    {resolucion.tipo === "reposicion" && (
                        <p>
                            La reposición debe registrarse como una nueva
                            entrega en el flujo de Recepción; esta resolución
                            no modifica la recepción validada.
                        </p>
                    )}
                </div>
            ) : (
                <form
                    className="devolucion-seguimiento__formulario"
                    onSubmit={evento => void guardar(evento)}
                    noValidate
                >
                    <label className="campo">
                        Resolución
                        <select
                            value={tipo}
                            onChange={evento => {
                                const seleccion = evento.target.value;
                                if (
                                    seleccion === "retiro" ||
                                    seleccion === "reposicion"
                                ) {
                                    setTipo(seleccion);
                                }
                            }}
                        >
                            <option value="retiro">
                                Retiro de mercadería por el proveedor
                            </option>
                            <option value="reposicion">
                                Compromiso de reposición
                            </option>
                        </select>
                    </label>

                    {tipo === "reposicion" && (
                        <label className="campo">
                            Detalle del compromiso (cantidad y fecha acordada)
                            <textarea
                                value={detalleCompromiso}
                                onChange={evento =>
                                    setDetalleCompromiso(evento.target.value)
                                }
                                rows={3}
                                required
                            />
                        </label>
                    )}

                    <label className="campo">
                        Evidencia (referencia, documento o descripción)
                        <textarea
                            value={evidencia}
                            onChange={evento =>
                                setEvidencia(evento.target.value)
                            }
                            rows={3}
                            required
                        />
                    </label>

                    {tipo === "reposicion" && (
                        <p>
                            La nueva mercadería se recibirá mediante el flujo
                            habitual de Recepción. No se modificarán las
                            cantidades de la recepción original.
                        </p>
                    )}

                    {error && (
                        <p className="alerta alerta--error" role="alert">
                            {error}
                        </p>
                    )}

                    <button type="submit" disabled={guardando}>
                        {guardando ? "Guardando…" : "Registrar resolución"}
                    </button>
                </form>
            )}
        </article>
    );
}
