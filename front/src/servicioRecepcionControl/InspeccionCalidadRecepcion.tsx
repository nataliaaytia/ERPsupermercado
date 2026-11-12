import { useState } from "react";
import type { FormEvent } from "react";
import type { OrdenCompra } from "../servicioOrdenesCompra/tipos";
import type {
    DatosInspeccionCalidad,
    InspeccionCalidadRecepcion,
} from "./tiposInspeccion";

interface Props {
    idRecepcion: number;
    detallesRecibidos: readonly {
        idDetalleOrden: number;
        cantidadRecibida: number;
    }[];
    orden?: OrdenCompra;
    inspeccion?: InspeccionCalidadRecepcion;
    onRegistrar: (datos: DatosInspeccionCalidad) => void;
}

interface CamposLinea {
    conformes: string;
    rechazadas: string;
    motivo: string;
}

export default function InspeccionCalidadRecepcion({
    idRecepcion,
    detallesRecibidos,
    orden,
    inspeccion,
    onRegistrar,
}: Props) {
    const [cantidades, setCantidades] = useState<Record<number, CamposLinea>>(
        {},
    );
    const [error, setError] = useState("");

    function actualizarLinea(
        idDetalleOrden: number,
        campo: keyof CamposLinea,
        valor: string,
    ) {
        setCantidades(actual => ({
            ...actual,
            [idDetalleOrden]: {
                    ...(actual[idDetalleOrden] ?? {
                        conformes: "",
                        rechazadas: "",
                        motivo: "",
                    }),
                [campo]: valor,
            },
        }));
    }

    function guardar(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault();
        setError("");

        try {
            const lineas = detallesRecibidos.map(detalle => {
                const campos = cantidades[detalle.idDetalleOrden] ?? {
                    conformes: "",
                    rechazadas: "",
                    motivo: "",
                };
                const conformes = campos.conformes.trim();
                const rechazadas = campos.rechazadas.trim();

                if (!/^\d+$/.test(conformes) || !/^\d+$/.test(rechazadas)) {
                    throw new Error(
                        `Ingresa cantidades enteras para la línea ${detalle.idDetalleOrden}.`,
                    );
                }
                const cantidadConforme = Number(conformes);
                const cantidadRechazada = Number(rechazadas);
                if (
                    !Number.isSafeInteger(cantidadConforme) ||
                    !Number.isSafeInteger(cantidadRechazada)
                ) {
                    throw new Error(
                        `Las cantidades de la línea ${detalle.idDetalleOrden} están fuera del rango permitido.`,
                    );
                }
                if (
                    cantidadConforme + cantidadRechazada !==
                    detalle.cantidadRecibida
                ) {
                    throw new Error(
                        `En la línea ${detalle.idDetalleOrden}, conformes y rechazadas deben sumar ${detalle.cantidadRecibida}.`,
                    );
                }
                if (cantidadRechazada > 0 && !campos.motivo.trim()) {
                    throw new Error(
                        `Indica el motivo del rechazo para la línea ${detalle.idDetalleOrden}.`,
                    );
                }

                return {
                    idDetalleOrden: detalle.idDetalleOrden,
                    cantidadConforme,
                    cantidadRechazada,
                    ...(cantidadRechazada > 0
                        ? { motivoRechazo: campos.motivo.trim() }
                        : {}),
                };
            });

            const datos: DatosInspeccionCalidad = {
                idRecepcion,
                detalles: lineas,
            };
            onRegistrar(datos);
        } catch (fallo) {
            setError(
                fallo instanceof Error
                    ? fallo.message
                    : "No se pudo guardar la inspección.",
            );
        }
    }

    if (inspeccion) {
        return (
            <section className="inspeccion-calidad">
                <h4>
                    Inspección registrada ·{" "}
                    {new Date(inspeccion.fechaInspeccion).toLocaleString(
                        "es-BO",
                    )}
                </h4>
                <div className="ordenes-compra__tabla">
                    <table>
                        <thead>
                            <tr>
                                <th scope="col">Línea / producto</th>
                                <th scope="col">Recibidas</th>
                                <th scope="col">Conformes</th>
                                <th scope="col">Rechazadas</th>
                                <th scope="col">Motivo de rechazo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inspeccion.detalles.map(detalle => (
                                <tr key={detalle.idDetalleOrden}>
                                    <th scope="row">
                                        Línea {detalle.idDetalleOrden} ·{" "}
                                        {orden?.detalles.find(
                                            linea =>
                                                linea.idDetalle ===
                                                detalle.idDetalleOrden,
                                        )?.producto.descripcion ??
                                            "Producto no disponible"}
                                    </th>
                                    <td>{detalle.cantidadRecibida}</td>
                                    <td>{detalle.cantidadConforme}</td>
                                    <td>{detalle.cantidadRechazada}</td>
                                    <td>{detalle.motivoRechazo ?? "—"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        );
    }

    return (
        <form
            className="inspeccion-calidad"
            onSubmit={guardar}
            noValidate
        >
            <h4>Inspección de calidad</h4>
            <p>
                Registra conformes y rechazadas para cada línea. La suma debe
                coincidir con lo recibido; los datos originales no se alteran.
            </p>
            <div className="ordenes-compra__tabla">
                <table>
                    <thead>
                        <tr>
                            <th scope="col">Línea / producto</th>
                            <th scope="col">Recibidas</th>
                            <th scope="col">Conformes</th>
                            <th scope="col">Rechazadas</th>
                            <th scope="col">Motivo si hay rechazo</th>
                        </tr>
                    </thead>
                    <tbody>
                        {detallesRecibidos.map(detalle => {
                            const campos = cantidades[detalle.idDetalleOrden] ?? {
                                conformes: "",
                                rechazadas: "",
                                motivo: "",
                            };
                            const producto = orden?.detalles.find(
                                linea =>
                                    linea.idDetalle === detalle.idDetalleOrden,
                            )?.producto.descripcion;

                            return (
                                <tr key={detalle.idDetalleOrden}>
                                    <th scope="row">
                                        Línea {detalle.idDetalleOrden} ·{" "}
                                        {producto?.trim() ||
                                            "Producto no disponible"}
                                    </th>
                                    <td>{detalle.cantidadRecibida}</td>
                                    <td>
                                        <input
                                            type="number"
                                            min="0"
                                            step="1"
                                            required
                                            aria-label={`Cantidad conforme de línea ${detalle.idDetalleOrden}`}
                                            value={campos.conformes}
                                            onChange={evento =>
                                                actualizarLinea(
                                                    detalle.idDetalleOrden,
                                                    "conformes",
                                                    evento.target.value,
                                                )
                                            }
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            min="0"
                                            step="1"
                                            required
                                            aria-label={`Cantidad rechazada de línea ${detalle.idDetalleOrden}`}
                                            value={campos.rechazadas}
                                            onChange={evento =>
                                                actualizarLinea(
                                                    detalle.idDetalleOrden,
                                                    "rechazadas",
                                                    evento.target.value,
                                                )
                                            }
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            aria-label={`Motivo de rechazo de línea ${detalle.idDetalleOrden}`}
                                            value={campos.motivo}
                                            disabled={
                                                campos.rechazadas.trim() ===
                                                    "0" ||
                                                campos.rechazadas.trim() === ""
                                            }
                                            onChange={evento =>
                                                actualizarLinea(
                                                    detalle.idDetalleOrden,
                                                    "motivo",
                                                    evento.target.value,
                                                )
                                            }
                                        />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            {error && (
                <p className="ordenes-compra__error" role="alert">
                    {error}
                </p>
            )}
            <button type="submit">Guardar inspección</button>
        </form>
    );
}
