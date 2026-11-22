import { useState } from "react";
import { conexion } from "../../../servicios/api/configuracion";
import type { RecepcionValidada } from "../../ordenesCompra/tipos";
import type { InspeccionCalidadRecepcion } from "../tipos/inspeccion";
import {
    conciliarRecepcionServidor,
    consultarOrdenParaConciliacion,
} from "../servicios/servicioConciliacionRecepcion";
import type {
    ConciliacionServidor,
    OrdenConciliable,
} from "../servicios/servicioConciliacionRecepcion";
import type { RecepcionRegistrada } from "../tipos/recepcion";

interface Props {
    recepcion: RecepcionRegistrada;
    inspeccion: InspeccionCalidadRecepcion;
    validacion?: RecepcionValidada;
}

interface FilaConciliacion {
    idDetalleOrden: number;
    producto: string;
    cantidadSolicitada: number | null;
    cantidadRecibida: number;
    cantidadAceptada: number | null;
    diferenciaRecibida: number | null;
    diferenciaAceptada: number | null;
}

function construirFilas(
    orden: OrdenConciliable,
    inspeccion: InspeccionCalidadRecepcion,
    validacion: RecepcionValidada | undefined,
): FilaConciliacion[] {
    const ids = new Set([
        ...orden.detalles.map(detalle => detalle.idDetalle),
        ...inspeccion.detalles.map(detalle => detalle.idDetalleOrden),
    ]);

    return [...ids].map(idDetalleOrden => {
        const lineaOrden = orden.detalles.find(
            detalle => detalle.idDetalle === idDetalleOrden,
        );
        const lineaInspeccion = inspeccion.detalles.find(
            detalle => detalle.idDetalleOrden === idDetalleOrden,
        );
        const lineaValidada = validacion?.detalles.find(
            detalle => detalle.idDetalleOrden === idDetalleOrden,
        );
        const cantidadSolicitada = lineaOrden?.cantidad ?? null;
        const cantidadRecibida = lineaInspeccion?.cantidadRecibida ?? 0;
        const cantidadAceptada = validacion
            ? lineaValidada?.cantidadAceptada ?? 0
            : null;

        return {
            idDetalleOrden,
            producto:
                lineaOrden?.producto.descripcion.trim() ||
                "Línea recibida no encontrada en la orden",
            cantidadSolicitada,
            cantidadRecibida,
            cantidadAceptada,
            diferenciaRecibida:
                cantidadSolicitada === null
                    ? null
                    : cantidadRecibida - cantidadSolicitada,
            diferenciaAceptada:
                cantidadSolicitada === null || cantidadAceptada === null
                    ? null
                    : cantidadAceptada - cantidadSolicitada,
        };
    });
}

function diferenciaTexto(cantidad: number | null): string {
    if (cantidad === null) return "—";
    if (cantidad > 0) return `+${cantidad}`;
    return String(cantidad);
}

export default function ConciliacionRecepcion({
    recepcion,
    inspeccion,
    validacion,
}: Props) {
    const [orden, setOrden] = useState<OrdenConciliable>();
    const [error, setError] = useState("");
    const [consultando, setConsultando] = useState(false);
    const [servidor, setServidor] = useState<ConciliacionServidor>();

    async function conciliar() {
        setConsultando(true);
        setError("");
        setOrden(undefined);
        setServidor(undefined);

        try {
            if (conexion.recepcion) {
                setServidor(
                    await conciliarRecepcionServidor(
                        recepcion.idRecepcion,
                        recepcion.idOrden,
                    ),
                );
                return;
            }
            const resultado = await consultarOrdenParaConciliacion(
                recepcion.idOrden,
            );
            setOrden(resultado);
        } catch (fallo) {
            setError(
                fallo instanceof Error
                    ? fallo.message
                    : "No se pudo ejecutar la conciliación.",
            );
        } finally {
            setConsultando(false);
        }
    }

    const filas = orden
        ? construirFilas(orden, inspeccion, validacion)
        : [];
    const diferenciasPendientes = filas.some(
        fila =>
            fila.cantidadSolicitada === null ||
            fila.cantidadAceptada === null ||
            fila.diferenciaRecibida !== 0 ||
            fila.diferenciaAceptada !== 0,
    );

    return (
        <section className="conciliacion-recepcion">
            <h4>Conciliación con orden de compra</h4>
            <p>
                Compara la orden de compra con lo recibido. La conciliación usa el
                resultado de inspección y, cuando existe, la validación final.
            </p>
            <button
                type="button"
                onClick={() => void conciliar()}
                disabled={consultando}
            >
                {consultando
                    ? "Consultando orden…"
                    : "Consultar orden y ejecutar conciliación"}
            </button>

            {error && (
                <p className="alerta alerta--error" role="alert">
                    {error}
                </p>
            )}

            {servidor && (
                <>
                    <div className="tabla-contenedor">
                        <table>
                            <thead>
                                <tr>
                                    <th scope="col">Producto</th>
                                    <th scope="col">Solicitadas</th>
                                    <th scope="col">Recibidas</th>
                                    <th scope="col">Aceptadas</th>
                                    <th scope="col">Diferencia</th>
                                    <th scope="col">Resultado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {servidor.filas.map(fila => (
                                    <tr key={fila.idDetalleOrden}>
                                        <th scope="row">
                                            {fila.producto} · Línea{" "}
                                            {fila.idDetalleOrden}
                                        </th>
                                        <td>{fila.cantidadSolicitada}</td>
                                        <td>{fila.cantidadRecibida}</td>
                                        <td>{fila.cantidadAceptada}</td>
                                        <td>{diferenciaTexto(fila.diferencia)}</td>
                                        <td>{fila.estadoLinea}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p
                        className={
                            servidor.conforme
                                ? "alerta alerta--exito"
                                : "alerta alerta--error"
                        }
                        role="status"
                    >
                        {servidor.mensaje ||
                            (servidor.conforme
                                ? "Sin diferencias pendientes. La conciliación es conforme."
                                : "Hay diferencias respecto de la orden de compra.")}
                    </p>
                </>
            )}

            {orden && (
                <>
                    <p>
                        Orden consultada: {orden.numero} · ID {orden.idOrden}
                    </p>
                    <div className="tabla-contenedor">
                        <table>
                            <thead>
                                <tr>
                                    <th scope="col">Producto</th>
                                    <th scope="col">Solicitadas</th>
                                    <th scope="col">Recibidas</th>
                                    <th scope="col">Aceptadas</th>
                                    <th scope="col">Diferencia recibida - solicitada</th>
                                    <th scope="col">Diferencia aceptada - solicitada</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filas.map(fila => (
                                    <tr key={fila.idDetalleOrden}>
                                        <th scope="row">
                                            {fila.producto} · Línea{" "}
                                            {fila.idDetalleOrden}
                                        </th>
                                        <td>
                                            {fila.cantidadSolicitada ?? "No está en la orden"}
                                        </td>
                                        <td>{fila.cantidadRecibida}</td>
                                        <td>
                                            {fila.cantidadAceptada ?? "Pendiente de aceptación"}
                                        </td>
                                        <td>
                                            {diferenciaTexto(
                                                fila.diferenciaRecibida,
                                            )}
                                        </td>
                                        <td>
                                            {diferenciaTexto(
                                                fila.diferenciaAceptada,
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p
                        className={
                            diferenciasPendientes
                                ? "alerta alerta--error"
                                : "alerta alerta--exito"
                        }
                        role="status"
                    >
                        {diferenciasPendientes
                            ? "Hay diferencias o aceptación pendiente. No se puede declarar la conciliación conforme."
                            : "Sin diferencias pendientes. La conciliación puede declararse conforme."}
                    </p>
                </>
            )}
        </section>
    );
}
