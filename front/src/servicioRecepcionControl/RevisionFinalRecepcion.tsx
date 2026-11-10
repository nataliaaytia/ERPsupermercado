import { useState } from "react";
import type { FormEvent } from "react";
import type { OrdenCompra, RecepcionValidada } from "../servicioOrdenesCompra/tipos";
import { calcularSaldosEntrega } from "../servicioOrdenesCompra/utilidadesSeguimientoEntregas";
import type { RecepcionRegistrada } from "./tiposRecepcion";
import type { DatosConfirmacionRecepcion } from "./validarRecepcion";

interface PropsRevisionFinalRecepcion {
    recepciones: readonly RecepcionRegistrada[];
    ordenes: readonly OrdenCompra[];
    recepcionesValidadas: readonly RecepcionValidada[];
    onConfirmar: (datos: DatosConfirmacionRecepcion) => void;
}

interface ErrorRevision {
    general?: string;
    confirmacion?: string;
    lineas: Record<number, string>;
}

export default function RevisionFinalRecepcion({
    recepciones,
    ordenes,
    recepcionesValidadas,
    onConfirmar,
}: PropsRevisionFinalRecepcion) {
    const [idRecepcion, setIdRecepcion] = useState("");
    const [cantidades, setCantidades] = useState<Record<number, string>>({});
    const [confirmada, setConfirmada] = useState(false);
    const [errores, setErrores] = useState<ErrorRevision>({ lineas: {} });
    const [mensaje, setMensaje] = useState("");

    const pendientes = recepciones.filter(
        recepcion =>
            !recepcionesValidadas.some(
                validada =>
                    validada.idRecepcion === recepcion.idRecepcion &&
                    validada.idOrden === recepcion.idOrden &&
                    validada.estado === "Validada",
            ),
    );
    const recepcion = pendientes.find(
        item => String(item.idRecepcion) === idRecepcion,
    );
    const orden = recepcion
        ? ordenes.find(item => item.idOrden === recepcion.idOrden)
        : undefined;
    const saldos = orden
        ? calcularSaldosEntrega(orden, recepcionesValidadas)
        : [];

    function cantidadAceptadaPrevia(idDetalleOrden: number): number {
        return (
            saldos.find(item => item.idDetalle === idDetalleOrden)?.aceptadas ??
            0
        );
    }

    function nombreProducto(idDetalleOrden: number): string {
        const descripcion = orden?.detalles.find(
            item => item.idDetalle === idDetalleOrden,
        )?.producto.descripcion;

        return descripcion?.trim() || "Producto no disponible";
    }

    function enviar(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault();
        setMensaje("");

        const nuevosErrores: ErrorRevision = { lineas: {} };
        if (!recepcion) {
            nuevosErrores.general = "Selecciona una recepción pendiente.";
        }
        if (recepcion && !orden) {
            nuevosErrores.general =
                "No se encontró la orden asociada a la recepción.";
        }
        if (!confirmada) {
            nuevosErrores.confirmacion =
                "Confirma que revisaste las cantidades conformes.";
        }

        const detalles: DatosConfirmacionRecepcion["detalles"] = [];
        if (recepcion && orden) {
            for (const detalle of recepcion.detalles) {
                const texto = cantidades[detalle.idDetalleOrden]?.trim() ?? "";
                const cantidadAceptada = Number(texto);
                const lineaOrden = orden.detalles.find(
                    item => item.idDetalle === detalle.idDetalleOrden,
                );
                const disponible = lineaOrden
                    ? Math.max(
                          0,
                          lineaOrden.cantidad -
                              cantidadAceptadaPrevia(detalle.idDetalleOrden),
                      )
                    : 0;

                if (!lineaOrden) {
                    nuevosErrores.lineas[detalle.idDetalleOrden] =
                        "No se encontró esta línea en la orden.";
                } else if (
                    !/^\d+$/.test(texto) ||
                    !Number.isSafeInteger(cantidadAceptada) ||
                    cantidadAceptada < 0
                ) {
                    nuevosErrores.lineas[detalle.idDetalleOrden] =
                        "Ingresa una cantidad aceptada entera igual o mayor que cero.";
                } else if (cantidadAceptada > detalle.cantidadRecibida) {
                    nuevosErrores.lineas[detalle.idDetalleOrden] =
                        "La cantidad aceptada no puede superar la recibida.";
                } else if (cantidadAceptada > disponible) {
                    nuevosErrores.lineas[detalle.idDetalleOrden] =
                        `No puede superar las ${disponible} unidades pendientes de la orden.`;
                } else {
                    detalles.push({
                        idDetalleOrden: detalle.idDetalleOrden,
                        cantidadAceptada,
                    });
                }
            }
        }

        setErrores(nuevosErrores);
        if (
            nuevosErrores.general ||
            nuevosErrores.confirmacion ||
            Object.keys(nuevosErrores.lineas).length > 0 ||
            !recepcion
        ) {
            return;
        }

        try {
            onConfirmar({ idRecepcion: recepcion.idRecepcion, detalles });
            setMensaje(
                `La recepción ${recepcion.documento} quedó validada. Las cantidades rechazadas no se autorizaron.`,
            );
            setIdRecepcion("");
            setCantidades({});
            setConfirmada(false);
            setErrores({ lineas: {} });
        } catch (fallo) {
            setErrores({
                lineas: {},
                general:
                    fallo instanceof Error
                        ? fallo.message
                        : "No se pudo confirmar la recepción.",
            });
        }
    }

    return (
        <section className="ordenes-compra__tarjeta">
            <h2>Revisión final y aceptación</h2>
            <p>
                Registra solo las cantidades conformes. Lo recibido que no se
                acepte quedará excluido de las cantidades autorizadas.
            </p>

            {pendientes.length === 0 ? (
                <>
                    <p>No hay recepciones pendientes de validación.</p>
                    {mensaje && (
                        <p className="ordenes-compra__exito" role="status">
                            {mensaje}
                        </p>
                    )}
                </>
            ) : (
                <form onSubmit={enviar} noValidate>
                    <label className="ordenes-compra__campo">
                        Recepción pendiente
                        <select
                            value={idRecepcion}
                            onChange={evento => {
                                setIdRecepcion(evento.target.value);
                                setCantidades({});
                                setConfirmada(false);
                                setErrores({ lineas: {} });
                                setMensaje("");
                            }}
                            aria-invalid={Boolean(errores.general)}
                        >
                            <option value="">Selecciona una recepción</option>
                            {pendientes.map(item => (
                                <option
                                    key={item.idRecepcion}
                                    value={item.idRecepcion}
                                >
                                    {item.documento} · {item.fecha} · Orden{" "}
                                    {item.idOrden}
                                </option>
                            ))}
                        </select>
                    </label>

                    {recepcion && (
                        <>
                            <p>
                                Orden: {orden?.numero ?? `Orden ${recepcion.idOrden}`}
                                {" · "}Documento: {recepcion.documento}
                            </p>

                            <div className="ordenes-compra__tabla">
                                <table>
                                    <thead>
                                        <tr>
                                            <th scope="col">Línea / producto</th>
                                            <th scope="col">Ordenadas</th>
                                            <th scope="col">Recibidas</th>
                                            <th scope="col">Máximo aceptable</th>
                                            <th scope="col">Aceptar</th>
                                            <th scope="col">Rechazar</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recepcion.detalles.map(detalle => {
                                            const linea = orden?.detalles.find(
                                                item =>
                                                    item.idDetalle ===
                                                    detalle.idDetalleOrden,
                                            );
                                            const disponible = linea
                                                ? Math.max(
                                                      0,
                                                      linea.cantidad -
                                                          cantidadAceptadaPrevia(
                                                              detalle.idDetalleOrden,
                                                          ),
                                                  )
                                                : 0;
                                            const texto =
                                                cantidades[
                                                    detalle.idDetalleOrden
                                                ] ?? "";
                                            const cantidadIngresada =
                                                /^\d+$/.test(texto) &&
                                                Number.isSafeInteger(
                                                    Number(texto),
                                                )
                                                    ? Number(texto)
                                                    : null;
                                            const cantidadRechazada =
                                                cantidadIngresada !== null &&
                                                cantidadIngresada <=
                                                    detalle.cantidadRecibida
                                                    ? detalle.cantidadRecibida -
                                                      cantidadIngresada
                                                    : "—";

                                            return (
                                                <tr key={detalle.idDetalleOrden}>
                                                    <th scope="row">
                                                        Línea{" "}
                                                        {detalle.idDetalleOrden}
                                                        {" · "}
                                                        {nombreProducto(
                                                            detalle.idDetalleOrden,
                                                        )}
                                                    </th>
                                                    <td>{linea?.cantidad ?? "—"}</td>
                                                    <td>
                                                        {detalle.cantidadRecibida}
                                                    </td>
                                                    <td>{disponible}</td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            inputMode="numeric"
                                                            value={texto}
                                                            aria-label={`Cantidad aceptada para línea ${detalle.idDetalleOrden}`}
                                                            aria-invalid={Boolean(
                                                                errores.lineas[
                                                                    detalle
                                                                        .idDetalleOrden
                                                                ],
                                                            )}
                                                            onChange={evento =>
                                                                setCantidades(
                                                                    actuales => ({
                                                                        ...actuales,
                                                                        [detalle.idDetalleOrden]:
                                                                            evento
                                                                                .target
                                                                                .value,
                                                                    }),
                                                                )
                                                            }
                                                        />
                                                    </td>
                                                    <td>{cantidadRechazada}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {Object.entries(errores.lineas).map(
                                ([idLinea, error]) => (
                                    <p
                                        className="ordenes-compra__error"
                                        role="alert"
                                        key={idLinea}
                                    >
                                        Línea {idLinea}: {error}
                                    </p>
                                ),
                            )}

                            <label className="revision-recepcion__confirmacion">
                                <input
                                    type="checkbox"
                                    checked={confirmada}
                                    onChange={evento =>
                                        setConfirmada(evento.target.checked)
                                    }
                                    aria-invalid={Boolean(errores.confirmacion)}
                                />
                                Confirmo que revisé las líneas y que las
                                cantidades aceptadas son conformes.
                            </label>
                        </>
                    )}

                    {errores.general && (
                        <p className="ordenes-compra__error" role="alert">
                            {errores.general}
                        </p>
                    )}
                    {errores.confirmacion && (
                        <p className="ordenes-compra__error" role="alert">
                            {errores.confirmacion}
                        </p>
                    )}
                    {mensaje && (
                        <p className="ordenes-compra__exito" role="status">
                            {mensaje}
                        </p>
                    )}

                    {recepcion && (
                        <button type="submit">Confirmar aceptación</button>
                    )}
                </form>
            )}
        </section>
    );
}
