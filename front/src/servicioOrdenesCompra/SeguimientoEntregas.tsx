
import { useState } from "react";
import { useRequisiciones } from "../requisicionesCotizaciones/useRequisiciones";
import {
    calcularSaldosEntrega,
    cargarRecepcionDeEjemplo,
    esOrdenDeEjemplo,
} from "./utilidadesSeguimientoEntregas";

import CierreOrden, { VistaPreviaCierreOrden } from "./CierreOrden";


export default function SeguimientoEntregas() {
    const { ordenes, recepcionesValidadas } = useRequisiciones();
    const [idOrden, setIdOrden] = useState("");
    const [soloPendientes, setSoloPendientes] = useState(true);
    const [error, setError] = useState("");

    const orden = ordenes.find(
        item => String(item.idOrden) === idOrden,
    );

    const recepciones = orden
        ? recepcionesValidadas.filter(
            item => item.idOrden === orden.idOrden && item.estado === "Validada",
        )
        : [];

    const lineas = orden ? calcularSaldosEntrega(orden, recepciones) : [];

    const visibles = soloPendientes
        ? lineas.filter(linea => linea.pendientes > 0)
        : lineas;

    function cargarEjemplo(id: number) {
        setError("");

        try {
            cargarRecepcionDeEjemplo(id);
        } catch (fallo) {
            setError(
                fallo instanceof Error ? fallo.message : "No se pudo cargar el ejemplo.",
            );
        }
    }

    return (
        <section className="ordenes-compra__tarjeta">
            <h2>Cantidades pendientes por línea</h2>

            {import.meta.env.DEV && <VistaPreviaCierreOrden />}

            {ordenes.length === 0 ? (
                <p>Todavía no hay órdenes de compra.</p>
            ) : (
                <label className="ordenes-compra__campo">
                    Orden de compra
                    <select
                        value={idOrden}
                        onChange={evento => {
                            setIdOrden(evento.target.value);
                            setError("");
                        }}
                    >
                        <option value="">Selecciona una orden</option>

                        {ordenes.map(item => (
                            <option key={item.idOrden} value={item.idOrden}>
                                {item.numero} · {item.estado}
                            </option>
                        ))}
                    </select>
                </label>
            )}

            {orden && (
                <>
                    <CierreOrden
                        key={orden.idOrden}
                        orden={orden}
                        saldos={lineas}
                    />
                    {recepciones.length === 0 && (
                        <p>No hay recepciones validadas cargadas para esta orden.</p>
                    )}

                    {import.meta.env.DEV &&
                        recepciones.length === 0 &&
                        esOrdenDeEjemplo(orden.idOrden) && (
                            <button
                                type="button"
                                onClick={() => cargarEjemplo(orden.idOrden)}
                            >
                                Cargar recepción de prueba
                            </button>
                        )}

                    {error && (
                        <p className="ordenes-compra__error" role="alert">
                            {error}
                        </p>
                    )}

                    {recepciones.some(item => item.esEjemplo) && (
                        <p>Esta orden incluye una recepción de prueba.</p>
                    )}

                    <label className="ordenes-compra__campo">
                        Mostrar líneas
                        <select
                            value={soloPendientes ? "pendientes" : "todas"}
                            onChange={evento =>
                                setSoloPendientes(evento.target.value === "pendientes")
                            }
                        >
                            <option value="pendientes">Solo con saldo pendiente</option>
                            <option value="todas">Todas las líneas</option>
                        </select>
                    </label>

                    {visibles.length === 0 ? (
                        <p>No hay líneas para el filtro seleccionado.</p>
                    ) : (
                        <div className="ordenes-compra__tabla">
                            <table>
                                <thead>
                                    <tr>
                                        <th scope="col">Línea</th>
                                        <th scope="col">Producto</th>
                                        <th scope="col">Ordenadas</th>
                                        <th scope="col">Aceptadas</th>
                                        <th scope="col">Rechazadas</th>
                                        <th scope="col">Pendientes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {visibles.map(linea => (
                                        <tr key={linea.idDetalle}>
                                            <td>{linea.idDetalle}</td>
                                            <td>{linea.producto}</td>
                                            <td>{linea.ordenadas}</td>
                                            <td>{linea.aceptadas}</td>
                                            <td>{linea.rechazadas}</td>
                                            <td><strong>{linea.pendientes}</strong></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </section>
    );
}
