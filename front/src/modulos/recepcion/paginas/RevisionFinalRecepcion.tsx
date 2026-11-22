import { useState } from "react";
import type { FormEvent } from "react";
import type { OrdenCompra, RecepcionValidada } from "../../ordenesCompra/tipos";
import { conexion } from "../../../servicios/api/configuracion";
import { calcularSaldosEntrega } from "../../ordenesCompra/servicios/utilidadesSeguimientoEntregas";
import type { RecepcionRegistrada } from "../tipos/recepcion";
import type { InspeccionCalidadRecepcion } from "../tipos/inspeccion";
import type { DatosConfirmacionRecepcion } from "../servicios/validarRecepcion";

interface PropsRevisionFinalRecepcion {
    recepciones: readonly RecepcionRegistrada[];
    ordenes: readonly OrdenCompra[];
    recepcionesValidadas: readonly RecepcionValidada[];
    /** Inspecciones de calidad: sus cantidades conformes se proponen como aceptadas. */
    inspecciones?: readonly InspeccionCalidadRecepcion[];
    onConfirmar: (datos: DatosConfirmacionRecepcion) => Promise<string | undefined>;
    /** Usuario que autoriza (se envía al servidor con la conexión activa). */
    usuarioAutorizador?: string;
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
    inspecciones = [],
    onConfirmar,
    usuarioAutorizador,
}: PropsRevisionFinalRecepcion) {
    const [idRecepcion, setIdRecepcion] = useState("");
    const [cantidades, setCantidades] = useState<Record<number, string>>({});
    const [confirmada, setConfirmada] = useState(false);
    const [errores, setErrores] = useState<ErrorRevision>({ lineas: {} });
    const [mensaje, setMensaje] = useState("");
    const [guardando, setGuardando] = useState(false);
    /** Con la conexión activa se autorizan las cantidades conformes de la inspección. */
    const soloInspeccion = conexion.recepcion;

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

    const inspeccionSeleccionada = recepcion
        ? inspecciones.find(
              item =>
                  item.idRecepcion === recepcion.idRecepcion &&
                  item.idOrden === recepcion.idOrden,
          )
        : undefined;

    async function enviar(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault();
        if (guardando) return;
        setMensaje("");

        const nuevosErrores: ErrorRevision = { lineas: {} };
        if (!recepcion) {
            nuevosErrores.general = "Selecciona una recepción pendiente.";
        }
        if (recepcion && !orden) {
            nuevosErrores.general =
                "No se encontró la orden asociada a la recepción.";
        }
        if (recepcion && soloInspeccion && !inspeccionSeleccionada) {
            nuevosErrores.general =
                "Primero registra la inspección de calidad de esta recepción.";
        }
        if (!confirmada) {
            nuevosErrores.confirmacion =
                "Confirma que revisaste las cantidades conformes.";
        }

        const detalles: DatosConfirmacionRecepcion["detalles"] = [];
        if (recepcion && orden && !(soloInspeccion && !inspeccionSeleccionada)) {
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

        setGuardando(true);
        try {
            const mensajeServidor = await onConfirmar({
                idRecepcion: recepcion.idRecepcion,
                detalles,
                ...(soloInspeccion && usuarioAutorizador
                    ? { usuarioAutorizador }
                    : {}),
            });
            setMensaje(
                mensajeServidor ??
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
        } finally {
            setGuardando(false);
        }
    }

    return (
        <section className="tarjeta">
            <h2>Revisión final y aceptación</h2>
            <p>
                {soloInspeccion
                    ? "Se aceptan las cantidades conformes registradas en la inspección de calidad. Si alguna cantidad no es correcta, revisa la inspección antes de confirmar."
                    : "Registra solo las cantidades conformes. Lo recibido que no se acepte quedará excluido de las cantidades autorizadas."}
            </p>

            {pendientes.length === 0 ? (
                <>
                    <p>No hay recepciones pendientes de validación.</p>
                    {mensaje && (
                        <p className="alerta alerta--exito" role="status">
                            {mensaje}
                        </p>
                    )}
                </>
            ) : (
                <form onSubmit={evento => void enviar(evento)} noValidate>
                    <label className="campo">
                        Recepción pendiente
                        <select
                            value={idRecepcion}
                            onChange={evento => {
                                const id = evento.target.value;
                                const inspeccion = inspecciones.find(
                                    item => String(item.idRecepcion) === id,
                                );
                                setIdRecepcion(id);
                                setCantidades(
                                    Object.fromEntries(
                                        (inspeccion?.detalles ?? []).map(detalle => [
                                            detalle.idDetalleOrden,
                                            String(detalle.cantidadConforme),
                                        ]),
                                    ),
                                );
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

                            <div className="tabla-contenedor">
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
                                                        {soloInspeccion ? (
                                                            texto || "Sin inspección"
                                                        ) : (
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
                                                        )}
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
                                        className="alerta alerta--error"
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
                        <p className="alerta alerta--error" role="alert">
                            {errores.general}
                        </p>
                    )}
                    {errores.confirmacion && (
                        <p className="alerta alerta--error" role="alert">
                            {errores.confirmacion}
                        </p>
                    )}
                    {mensaje && (
                        <p className="alerta alerta--exito" role="status">
                            {mensaje}
                        </p>
                    )}

                    {recepcion && (
                        <button type="submit" disabled={guardando}>
                            {guardando ? "Guardando…" : "Confirmar aceptación"}
                        </button>
                    )}
                </form>
            )}
        </section>
    );
}
