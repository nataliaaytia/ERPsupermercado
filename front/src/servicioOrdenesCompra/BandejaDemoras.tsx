// natalia: scrum 526

import { useState } from "react";
import { useRequisiciones } from "../requisicionesCotizaciones/useRequisiciones";
import { calcularDemoras } from "./calcularDemoras";
import type { DemoraEntrega } from "./calcularDemoras";
import { fechaHoy } from "./compromisosEntrega";

interface Props {
    onVerCompromiso: (demora: DemoraEntrega) => void;
}

export default function BandejaDemoras({ onVerCompromiso }: Props) {
    const { ordenes, ofertas, recepcionesValidadas } = useRequisiciones();
    const [fechaPrueba, setFechaPrueba] = useState("");

    const hoy = fechaHoy();
    const fechaConsulta = import.meta.env.DEV && fechaPrueba ? fechaPrueba : hoy;

    const demoras = calcularDemoras(
        ordenes,
        ofertas,
        recepcionesValidadas,
        fechaConsulta,
    );

    return (
        <section className="ordenes-compra__tarjeta">
            <h2>Compromisos de entrega vencidos</h2>

            {import.meta.env.DEV && (
                <label className="ordenes-compra__campo">
                    Fecha de consulta para pruebas (opcional)
                    <input
                        type="date"
                        value={fechaPrueba}
                        onChange={evento => setFechaPrueba(evento.target.value)}
                    />
                </label>
            )}

            <p>Fecha de consulta: {fechaConsulta}</p>

            {demoras.length === 0 ? (
                <p>No hay compromisos vencidos con cantidades pendientes.</p>
            ) : (
                <div className="ordenes-compra__tabla">
                    <table>
                        <thead>
                            <tr>
                                <th scope="col">Proveedor</th>
                                <th scope="col">Orden</th>
                                <th scope="col">Producto</th>
                                <th scope="col">Fecha comprometida</th>
                                <th scope="col">Cantidad pendiente</th>
                                <th scope="col">Acción</th>
                            </tr>
                        </thead>

                        <tbody>
                            {demoras.map(demora => (
                                <tr key={`${demora.idOrden}-${demora.idDetalle}-${demora.idCompromiso}`}>
                                    <td>{demora.proveedor}</td>
                                    <td>{demora.numeroOrden}</td>
                                    <td>{demora.producto}</td>
                                    <td>{demora.fechaEntrega}</td>
                                    <td><strong>{demora.cantidadPendiente}</strong></td>
                                    <td>
                                        <button
                                            type="button"
                                            onClick={() => onVerCompromiso(demora)}
                                        >
                                            Ver compromiso
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}