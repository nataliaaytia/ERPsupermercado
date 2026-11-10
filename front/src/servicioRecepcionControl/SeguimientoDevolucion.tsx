import { useState } from "react";
import type { FormEvent } from "react";
import type {
    DevolucionSeguimiento as DatosDevolucion,
    TipoResolucionDevolucion,
} from "./tiposDevolucion";
import { registrarResolucionDevolucion } from "./servicioDevoluciones";

interface PropsSeguimientoDevolucion {
    devolucion: DatosDevolucion;
}

export default function SeguimientoDevolucion({
    devolucion,
}: PropsSeguimientoDevolucion) {
    const [tipo, setTipo] = useState<TipoResolucionDevolucion>("retiro");
    const [evidencia, setEvidencia] = useState("");
    const [error, setError] = useState("");

    function guardar(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault();
        setError("");

        try {
            registrarResolucionDevolucion({
                idDevolucion: devolucion.idDevolucion,
                tipo,
                evidencia,
            });
        } catch (fallo) {
            setError(
                fallo instanceof Error
                    ? fallo.message
                    : "No se pudo registrar la resolución de la devolución.",
            );
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

            {resolucion ? (
                <div className="ordenes-compra__exito">
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
                    onSubmit={guardar}
                    noValidate
                >
                    <label className="ordenes-compra__campo">
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

                    <label className="ordenes-compra__campo">
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
                        <p className="ordenes-compra__error" role="alert">
                            {error}
                        </p>
                    )}

                    <button type="submit">Registrar resolución</button>
                </form>
            )}
        </article>
    );
}
