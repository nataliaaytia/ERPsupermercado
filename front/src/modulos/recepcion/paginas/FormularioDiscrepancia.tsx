import { useState } from "react";
import type { FormEvent } from "react";
import { conexion } from "../../../servicios/api/configuracion";
import type { OrdenCompra } from "../../ordenesCompra/tipos";
import type { RecepcionRegistrada } from "../tipos/recepcion";
import type { DatosDiscrepancia } from "../tipos/discrepancia";
import "./FormularioDiscrepancia.css";

interface PropsFormularioDiscrepancia {
    recepciones: readonly RecepcionRegistrada[];
    ordenes: readonly OrdenCompra[];
    onSubmit: (discrepancia: DatosDiscrepancia) => Promise<void>;
}

interface ErroresFormulario {
    recepcion?: string;
    linea?: string;
    cantidad?: string;
    producto?: string;
    descripcion?: string;
    envio?: string;
}

export default function FormularioDiscrepancia({
    recepciones,
    ordenes,
    onSubmit,
}: PropsFormularioDiscrepancia) {
    const [idRecepcion, setIdRecepcion] = useState("");
    const [idDetalleOrden, setIdDetalleOrden] = useState("");
    const [tipo, setTipo] = useState<"cantidad" | "producto">("cantidad");
    const [cantidadDiscrepante, setCantidadDiscrepante] = useState("");
    const [productoRecibido, setProductoRecibido] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [errores, setErrores] = useState<ErroresFormulario>({});
    const [sentido, setSentido] = useState<"" | "faltante" | "exceso">("");
    const [cantidadProducto, setCantidadProducto] = useState("");
    const [guardando, setGuardando] = useState(false);
    /** Con la conexión activa el servidor pide faltante/exceso y la cantidad afectada. */
    const datosServidor = conexion.recepcion;

    const recepcionSeleccionada = recepciones.find(
        recepcion => String(recepcion.idRecepcion) === idRecepcion,
    );
    const ordenSeleccionada = recepcionSeleccionada
        ? ordenes.find(
              orden => orden.idOrden === recepcionSeleccionada.idOrden,
          )
        : undefined;
    function nombreProductoEsperado(idDetalleOrden: number): string {
        const descripcionProducto = ordenSeleccionada?.detalles.find(
            linea => linea.idDetalle === idDetalleOrden,
        )?.producto.descripcion;

        return descripcionProducto?.trim() || "Producto esperado no disponible";
    }

    const { envio: errorEnvio, ...erroresCampos } = errores;
    const erroresActivos = Object.values(erroresCampos).filter(
        (error): error is string => Boolean(error),
    );

    async function enviar(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault();
        if (guardando) return;

        const nuevosErrores: ErroresFormulario = {};
        const recepcion = recepciones.find(
            item => String(item.idRecepcion) === idRecepcion,
        );
        const detalle = recepcion?.detalles.find(
            item => String(item.idDetalleOrden) === idDetalleOrden,
        );

        if (!recepcion) {
            nuevosErrores.recepcion = "Selecciona una recepción registrada.";
        }
        if (!detalle) {
            nuevosErrores.linea = "Selecciona una línea de la recepción.";
        }

        let cantidad = 0;
        if (tipo === "cantidad") {
            const textoCantidad = cantidadDiscrepante.trim();
            cantidad = Number(textoCantidad);
            if (
                !/^\d+$/.test(textoCantidad) ||
                !Number.isSafeInteger(cantidad) ||
                cantidad <= 0
            ) {
                nuevosErrores.cantidad =
                    "Ingresa una cantidad discrepante entera mayor que cero.";
            }
            if (datosServidor && !sentido) {
                nuevosErrores.cantidad =
                    "Indica si la diferencia es un faltante o un exceso.";
            }
        } else {
            if (!productoRecibido.trim()) {
                nuevosErrores.producto =
                    "Describe el producto recibido en lugar del esperado.";
            }
            if (datosServidor) {
                const textoCantidad = cantidadProducto.trim();
                cantidad = Number(textoCantidad);
                if (
                    !/^\d+$/.test(textoCantidad) ||
                    !Number.isSafeInteger(cantidad) ||
                    cantidad <= 0
                ) {
                    nuevosErrores.cantidad =
                        "Ingresa la cantidad de unidades afectadas (entera mayor que cero).";
                }
            }
        }

        const descripcionLimpia = descripcion.trim();
        if (!descripcionLimpia) {
            nuevosErrores.descripcion =
                "Describe el problema para registrar la discrepancia.";
        }

        setErrores(nuevosErrores);
        if (
            Object.keys(nuevosErrores).length > 0 ||
            !recepcion ||
            !detalle
        ) {
            return;
        }

        const datosBase = {
            idRecepcion: recepcion.idRecepcion,
            idDetalleOrden: detalle.idDetalleOrden,
            descripcion: descripcionLimpia,
        };

        setGuardando(true);
        try {
            if (tipo === "cantidad") {
                await onSubmit({
                    ...datosBase,
                    tipo,
                    cantidadDiscrepante: cantidad,
                    ...(datosServidor && sentido ? { sentido } : {}),
                });
            } else {
                await onSubmit({
                    ...datosBase,
                    tipo,
                    productoRecibido: productoRecibido.trim(),
                    ...(datosServidor ? { cantidadDiscrepante: cantidad } : {}),
                });
            }
            if (datosServidor) {
                setCantidadDiscrepante("");
                setCantidadProducto("");
                setProductoRecibido("");
                setDescripcion("");
                setSentido("");
            }
        } catch (fallo) {
            setErrores({
                envio:
                    fallo instanceof Error
                        ? fallo.message
                        : "No se pudo registrar la discrepancia.",
            });
        } finally {
            setGuardando(false);
        }
    }

    return (
        <form
            className="formulario-discrepancia"
            onSubmit={evento => void enviar(evento)}
            noValidate
        >
            <h2>Registrar discrepancia de recepción</h2>

            <label className="formulario-discrepancia__campo">
                Recepción registrada
                <select
                    value={idRecepcion}
                    onChange={evento => {
                        setIdRecepcion(evento.target.value);
                        setIdDetalleOrden("");
                    }}
                    aria-invalid={Boolean(errores.recepcion)}
                    aria-describedby={
                        errores.recepcion ? "discrepancia-errores" : undefined
                    }
                >
                    <option value="">Selecciona una recepción</option>
                    {recepciones.map(recepcion => (
                        <option
                            key={recepcion.idRecepcion}
                            value={recepcion.idRecepcion}
                        >
                            {recepcion.documento} · {recepcion.fecha} · Recepción{" "}
                            {recepcion.idRecepcion}
                        </option>
                    ))}
                </select>
            </label>

            <label className="formulario-discrepancia__campo">
                Línea de la recepción
                <select
                    value={idDetalleOrden}
                    onChange={evento => setIdDetalleOrden(evento.target.value)}
                    disabled={!recepcionSeleccionada}
                    aria-invalid={Boolean(errores.linea)}
                    aria-describedby={
                        errores.linea ? "discrepancia-errores" : undefined
                    }
                >
                    <option value="">Selecciona una línea</option>
                    {recepcionSeleccionada?.detalles.map(detalle => (
                        <option
                            key={detalle.idDetalleOrden}
                            value={detalle.idDetalleOrden}
                        >
                            Línea {detalle.idDetalleOrden} ·{" "}
                            {nombreProductoEsperado(detalle.idDetalleOrden)} ·{" "}
                            {detalle.cantidadRecibida} recibidas
                        </option>
                    ))}
                </select>
            </label>

            <fieldset className="formulario-discrepancia__tipos">
                <legend>Tipo de discrepancia</legend>
                <label>
                    <input
                        type="radio"
                        name="tipo-discrepancia"
                        value="cantidad"
                        checked={tipo === "cantidad"}
                        onChange={() => setTipo("cantidad")}
                    />
                    Cantidad
                </label>
                <label>
                    <input
                        type="radio"
                        name="tipo-discrepancia"
                        value="producto"
                        checked={tipo === "producto"}
                        onChange={() => setTipo("producto")}
                    />
                    Producto
                </label>
            </fieldset>

            {datosServidor && tipo === "cantidad" && (
                <label className="formulario-discrepancia__campo">
                    Tipo de diferencia
                    <select
                        value={sentido}
                        onChange={evento => {
                            const valor = evento.target.value;
                            if (valor === "" || valor === "faltante" || valor === "exceso") {
                                setSentido(valor);
                            }
                        }}
                    >
                        <option value="">Selecciona faltante o exceso</option>
                        <option value="faltante">Faltante (llegó menos de lo indicado)</option>
                        <option value="exceso">Exceso (llegó más de lo indicado)</option>
                    </select>
                </label>
            )}

            {datosServidor && tipo === "cantidad" && sentido === "exceso" && (
                <p className="alerta alerta--advertencia" role="note">
                    Un exceso queda pendiente de resolución y, por ahora, el
                    sistema no permite resolverlo: la orden de compra no podrá
                    cerrarse mientras exista.
                </p>
            )}

            {tipo === "cantidad" ? (
                <label className="formulario-discrepancia__campo">
                    Cantidad discrepante
                    <input
                        type="text"
                        inputMode="numeric"
                        value={cantidadDiscrepante}
                        onChange={evento =>
                            setCantidadDiscrepante(evento.target.value)
                        }
                        aria-invalid={Boolean(errores.cantidad)}
                        aria-describedby={
                            errores.cantidad
                                ? "discrepancia-errores"
                                : undefined
                        }
                    />
                </label>
            ) : (
                <>
                {datosServidor && (
                    <label className="formulario-discrepancia__campo">
                        Unidades afectadas
                        <input
                            type="text"
                            inputMode="numeric"
                            value={cantidadProducto}
                            onChange={evento =>
                                setCantidadProducto(evento.target.value)
                            }
                            aria-invalid={Boolean(errores.cantidad)}
                        />
                    </label>
                )}
                <label className="formulario-discrepancia__campo">
                    Producto recibido en lugar del esperado
                    <input
                        type="text"
                        value={productoRecibido}
                        onChange={evento =>
                            setProductoRecibido(evento.target.value)
                        }
                        aria-invalid={Boolean(errores.producto)}
                        aria-describedby={
                            errores.producto
                                ? "discrepancia-errores"
                                : undefined
                        }
                    />
                </label>
                </>
            )}

            <label className="formulario-discrepancia__campo">
                Descripción del problema
                <textarea
                    value={descripcion}
                    onChange={evento => setDescripcion(evento.target.value)}
                    rows={4}
                    aria-invalid={Boolean(errores.descripcion)}
                    aria-describedby={
                        errores.descripcion
                            ? "discrepancia-errores"
                            : undefined
                    }
                />
            </label>

            {erroresActivos.length > 0 && (
                <div
                    className="formulario-discrepancia__errores"
                    id="discrepancia-errores"
                    role="alert"
                >
                    <p>Revisa los siguientes campos:</p>
                    <ul>
                        {erroresActivos.map(error => (
                            <li key={error}>{error}</li>
                        ))}
                    </ul>
                </div>
            )}

            {errorEnvio && (
                <p className="alerta alerta--error" role="alert">
                    {errorEnvio}
                </p>
            )}

            <button type="submit" disabled={guardando}>
                {guardando ? "Guardando…" : "Enviar discrepancia"}
            </button>
        </form>
    );
}
