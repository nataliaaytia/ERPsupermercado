//natalia: scrum 528

import { useId, useRef, useState } from "react";
import type { OrdenCompra } from "../tipos";
import { formatearFecha } from "../../../utilidades/fechas";

export interface DatosCierreOrden {
    fechaCierre: string;
    responsable: string;
}

export interface ServicioCierreOrden {
    verificar: (idOrden: number) => Promise<string[]>;
    cerrar: (idOrden: number) => Promise<
        | { ok: true; cierre: DatosCierreOrden }
        | { ok: false; motivos: string[] }
    >;
}

interface SaldoLinea {
    idDetalle: number;
    producto: string;
    pendientes: number;
}

interface Props {
    orden: Pick<OrdenCompra, "idOrden" | "numero" | "estado">;
    saldos: readonly SaldoLinea[];
    servicio?: ServicioCierreOrden;
}

export default function CierreOrden({
    orden,
    saldos,
    servicio,
}: Props) {
    const dialogo = useRef<HTMLDialogElement>(null);
    const idTitulo = useId();
    const [ocupado, setOcupado] = useState(false);
    const [motivosServicio, setMotivosServicio] = useState<string[]>([]);
    const [cierre, setCierre] = useState<DatosCierreOrden | null>(null);

    const motivosLocales = [
        ...(orden.estado !== "Confirmada"
            ? [`La orden está en estado ${orden.estado}; solo se cierran órdenes confirmadas.`]
            : []),
        ...(saldos.length === 0 ? ["La orden no tiene líneas para verificar."] : []),
        ...saldos
            .filter(linea => linea.pendientes > 0)
            .map(linea =>
                `Línea ${linea.idDetalle} · ${linea.producto}: faltan ${linea.pendientes} unidades aceptadas.`,
            ),
    ];

    const puedeSolicitar = Boolean(servicio) && motivosLocales.length === 0;
    const motivos = [...motivosLocales, ...motivosServicio];

    async function revisarCierre() {
        if (!servicio || !puedeSolicitar || ocupado || cierre) return;

        setOcupado(true);
        setMotivosServicio([]);

        try {
            const motivos = await servicio.verificar(orden.idOrden);

            if (motivos.length > 0) {
                setMotivosServicio(motivos);
                return;
            }

            dialogo.current?.showModal();
        } catch {
            setMotivosServicio(["No se pudo verificar el cierre. Intenta de nuevo."]);
        } finally {
            setOcupado(false);
        }
    }

    async function confirmarCierre() {
        if (!servicio || !puedeSolicitar || ocupado || cierre) return;

        setOcupado(true);
        setMotivosServicio([]);

        try {
            const resultado = await servicio.cerrar(orden.idOrden);

            if (resultado.ok) {
                setCierre(resultado.cierre);
            } else {
                setMotivosServicio(
                    resultado.motivos.length > 0
                        ? resultado.motivos
                        : ["El servicio no autorizó el cierre."],
                );
            }
        } catch {
            setMotivosServicio([
                "No se pudo confirmar el cierre. Consulta el estado de la orden antes de reintentar.",
            ]);
        } finally {
            dialogo.current?.close();
            setOcupado(false);
        }
    }

    return (
        <section className="tarjeta ordenes-compra__cierre">
            <h2>Cierre de orden</h2>
            <p>Orden {orden.numero}</p>

            {cierre ? (
                <div className="alerta alerta--exito" role="status">
                    <p>
                        Orden cerrada.
                    </p>
                    <p>Fecha: {formatearFecha(cierre.fechaCierre)}</p>
                    <p>Responsable: {cierre.responsable}</p>
                </div>
            ) : (
                <>
                    {motivos.length > 0 && (
                        <div className="alerta alerta--error" role="alert">
                            <strong>Motivos que impiden el cierre</strong>
                            <ul>
                                {motivos.map((motivo, indice) => (
                                    <li key={indice}>{motivo}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {!servicio && (
                        <p>
                            La verificación de discrepancias y devoluciones requiere
                            el servicio de cierre.
                        </p>
                    )}

                    <button
                        type="button"
                        disabled={!puedeSolicitar || ocupado}
                        onClick={revisarCierre}
                    >
                        {ocupado ? "Procesando…" : "Solicitar cierre"}
                    </button>
                </>
            )}

            <dialog
                ref={dialogo}
                className="ordenes-compra__dialogo-cierre"
                aria-labelledby={idTitulo}
                onCancel={evento => {
                    if (ocupado) evento.preventDefault();
                }}
            >
                <div className="tarjeta">
                    <h2 id={idTitulo}>¿Cerrar la orden {orden.numero}?</h2>
                    <p>
                        La orden pasará a estado Cerrada y no admitirá más recepciones.
                    </p>

                    <div className="resumen">
                        <button
                            type="button"
                            autoFocus
                            disabled={ocupado}
                            onClick={() => dialogo.current?.close()}
                        >
                            Volver
                        </button>

                        <button
                            type="button"
                            disabled={!puedeSolicitar || ocupado}
                            onClick={confirmarCierre}
                        >
                            {ocupado ? "Procesando…" : "Confirmar cierre"}
                        </button>
                    </div>
                </div>
            </dialog>
        </section>
    );
}
