// natalia: scrum 526

import { useState } from "react";
import { useCompras } from "../../../estado/useCompras";
import { calcularDemoras } from "../servicios/calcularDemoras";
import type { DemoraEntrega } from "../servicios/calcularDemoras";
import { fechaHoy } from "../servicios/compromisosEntrega";

interface Props {
    onVerCompromiso: (demora: DemoraEntrega) => void;
}

export default function BandejaDemoras({ onVerCompromiso }: Props) {
    const { ordenes, ofertas, recepcionesValidadas } = useCompras();
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
        <section className="tarjeta">
            <h2>Compromisos de entrega vencidos</h2>

            {import.meta.env.DEV && (
                <label className="campo">
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
                <div className="tabla-contenedor">
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