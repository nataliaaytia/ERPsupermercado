import { useId, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";

import type {
    DatosRequisicion,
    Prioridad,
    ProductoFormulario,
    Requisicion,
} from "./tipos";

import {
    validarRequisicion,
    hayErrores,
} from "./validacionRequisicion";

import { codigoRequisicion } from "./formatoRequisicion";

import "./FormularioRequisicion.css";
import "./EditarRequisicion.css";

interface Props {
    requisicion: Requisicion;
    bloqueada: boolean;
    onGuardar: (datos: DatosRequisicion) => void;
    onCancelar: () => void;
}

export default function EditarRequisicion({
    requisicion,
    bloqueada,
    onGuardar,
    onCancelar,
}: Props) {
    const id = useId();

    const [datos, setDatos] = useState<DatosRequisicion>(
        () => ({
            solicitante: requisicion.solicitante,
            prioridad: requisicion.prioridad,
            motivo: requisicion.observacion,
            productos: requisicion.detalles.map(detalle => ({
                id: detalle.idDetalle,
                nombre: detalle.producto.descripcion,
                cantidad: String(detalle.cantidad),
                observacion: detalle.observacion,
            })),
        }),
    );

    const siguienteId = useRef(
        Math.max(
            0,
            ...requisicion.detalles.map(d => d.idDetalle),
        ) + 1,
    );

    const [errores, setErrores] = useState<string[]>([]);

    const cambiarDatos = (
        cambios: Partial<DatosRequisicion>,
    ) => {
        setDatos(actuales => ({
            ...actuales,
            ...cambios,
        }));

        setErrores([]);
    };

    const cambiarProducto = (
        idFila: number,
        campo: "nombre" | "cantidad" | "observacion",
        valor: string,
    ) => {
        setDatos(actuales => ({
            ...actuales,
            productos: actuales.productos.map(producto =>
                producto.id === idFila
                    ? { ...producto, [campo]: valor }
                    : producto,
            ),
        }));

        setErrores([]);
    };

    const agregarProducto = () => {
        const nuevo: ProductoFormulario = {
            id: siguienteId.current++,
            nombre: "",
            cantidad: "",
            observacion: "",
        };

        setDatos(actuales => ({
            ...actuales,
            productos: [...actuales.productos, nuevo],
        }));

        setErrores([]);
    };

    const quitarProducto = (idFila: number) => {
        setDatos(actuales => ({
            ...actuales,
            productos: actuales.productos.filter(
                producto => producto.id !== idFila,
            ),
        }));

        setErrores([]);
    };

    const guardar = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (bloqueada) {
            setErrores([
                "Esta requisición ya fue procesada y no se puede editar.",
            ]);
            return;
        }

        const resultado = validarRequisicion(datos);

        if (hayErrores(resultado)) {
            const mensajes = [
                resultado.general,
                resultado.motivo,
                ...Object.values(resultado.productos).flatMap(
                    error => [error.nombre, error.cantidad],
                ),
            ].filter(
                (mensaje): mensaje is string =>
                    typeof mensaje === "string",
            );

            setErrores(mensajes);
            return;
        }

        setErrores([]);
        onGuardar(datos);
    };

    return (
        <form
            className="formulario-requisicion editar-requisicion"
            onSubmit={guardar}
            noValidate
        >
            <header>
                <h2>
                    Editar {codigoRequisicion(requisicion.idRequisicion)}
                </h2>

                <p>
                    Fecha original: {requisicion.fecha}
                    {" · "}
                    Estado: {requisicion.estado}
                </p>
            </header>

            {bloqueada && (
                <p role="alert" className="editar-requisicion__errores">
                    La requisición ya fue procesada. La edición está
                    bloqueada.
                </p>
            )}

            {errores.length > 0 && (
                <div
                    role="alert"
                    className="editar-requisicion__errores"
                >
                    <strong>Revisa estos datos:</strong>

                    <ul>
                        {errores.map((error, indice) => (
                            <li key={indice}>{error}</li>
                        ))}
                    </ul>
                </div>
            )}

            <fieldset disabled={bloqueada}>
                <label className="formulario-requisicion__campo">
                    Solicitante

                    <input
                        className="formulario-requisicion__input"
                        value={datos.solicitante}
                        maxLength={120}
                        autoFocus
                        onChange={event =>
                            cambiarDatos({
                                solicitante: event.target.value,
                            })
                        }
                    />
                </label>

                <label className="formulario-requisicion__campo">
                    Prioridad

                    <select
                        className="formulario-requisicion__input"
                        value={datos.prioridad}
                        onChange={event =>
                            cambiarDatos({
                                prioridad: event.target.value as Prioridad,
                            })
                        }
                    >
                        <option value="Baja">Baja</option>
                        <option value="Media">Media</option>
                        <option value="Alta">Alta</option>
                    </select>
                </label>

                <div className="formulario-requisicion__productos">
                    <div className="formulario-requisicion__encabezado">
                        <span>Producto</span>
                        <span>Cantidad</span>
                        <span />
                    </div>

                    {datos.productos.map((producto, indice) => (
                        <div
                            key={producto.id}
                            className="formulario-requisicion__fila"
                        >
                            <div className="formulario-requisicion__campo">
                                <label htmlFor={`${id}-nombre-${producto.id}`}>
                                    Nombre
                                </label>

                                <input
                                    id={`${id}-nombre-${producto.id}`}
                                    className="formulario-requisicion__input"
                                    value={producto.nombre}
                                    maxLength={120}
                                    placeholder="Nombre del producto"
                                    onChange={event =>
                                        cambiarProducto(
                                            producto.id,
                                            "nombre",
                                            event.target.value,
                                        )
                                    }
                                />

                                <label htmlFor={`${id}-obs-${producto.id}`}>
                                    Observación del detalle
                                </label>

                                <input
                                    id={`${id}-obs-${producto.id}`}
                                    className="formulario-requisicion__input"
                                    value={producto.observacion}
                                    maxLength={300}
                                    placeholder="Opcional"
                                    onChange={event =>
                                        cambiarProducto(
                                            producto.id,
                                            "observacion",
                                            event.target.value,
                                        )
                                    }
                                />
                            </div>

                            <div className="formulario-requisicion__campo">
                                <label htmlFor={`${id}-cantidad-${producto.id}`}>
                                    Unidades
                                </label>

                                <input
                                    id={`${id}-cantidad-${producto.id}`}
                                    className="formulario-requisicion__input"
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={5}
                                    value={producto.cantidad}
                                    onChange={event =>
                                        cambiarProducto(
                                            producto.id,
                                            "cantidad",
                                            event.target.value,
                                        )
                                    }
                                />
                            </div>

                            <button
                                type="button"
                                className="formulario-requisicion__quitar"
                                aria-label={`Quitar producto ${indice + 1}`}
                                disabled={datos.productos.length === 1}
                                onClick={() => quitarProducto(producto.id)}
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}

                    <button
                        type="button"
                        className="formulario-requisicion__agregar"
                        onClick={agregarProducto}
                    >
                        <Plus size={16} />
                        Agregar producto
                    </button>
                </div>

                <label className="formulario-requisicion__campo">
                    Motivo de la requisición

                    <textarea
                        className="formulario-requisicion__input formulario-requisicion__motivo"
                        rows={3}
                        maxLength={300}
                        value={datos.motivo}
                        onChange={event =>
                            cambiarDatos({
                                motivo: event.target.value,
                            })
                        }
                    />
                </label>
            </fieldset>

            <div className="editar-requisicion__acciones">
                <button
                    type="button"
                    className="editar-requisicion__cancelar"
                    onClick={onCancelar}
                >
                    Cerrar edición
                </button>

                <button
                    type="submit"
                    className="formulario-requisicion__guardar"
                    disabled={bloqueada}
                >
                    Guardar cambios
                </button>
            </div>
        </form>
    );
}