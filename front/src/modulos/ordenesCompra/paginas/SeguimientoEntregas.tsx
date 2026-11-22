
import { useState } from "react";
import { useCompras } from "../../../estado/useCompras";
import { calcularSaldosEntrega } from "../servicios/utilidadesSeguimientoEntregas";
import { servicioCierreOrden } from "../servicios/cierreOrden";
import { consultarCantidadesAutorizadas } from "../../recepcion/servicios/servicioConsultaValidaciones";

import CierreOrden from "../componentes/CierreOrden";


export default function SeguimientoEntregas() {
    const { ordenes, recepcionesValidadas } = useCompras();
    const [idOrden, setIdOrden] = useState("");
    const [soloPendientes, setSoloPendientes] = useState(true);

    const orden = ordenes.find(
        item => String(item.idOrden) === idOrden,
    );

    const recepciones = orden
        ? recepcionesValidadas.filter(
            item => item.idOrden === orden.idOrden && item.estado === "Validada",
        )
        : [];

    const lineas = orden ? calcularSaldosEntrega(orden, recepciones) : [];
    const cantidadesAutorizadas = orden
        ? consultarCantidadesAutorizadas(orden.idOrden)
        : [];
    const cantidadesPorLinea = new Map<
        number,
        {
            recibidas: number;
            aceptadas: number;
            rechazadas: number;
            autorizadas: number;
        }
    >();

    for (const detalle of cantidadesAutorizadas) {
        const acumuladas = cantidadesPorLinea.get(detalle.idDetalleOrden) ?? {
            recibidas: 0,
            aceptadas: 0,
            rechazadas: 0,
            autorizadas: 0,
        };
        cantidadesPorLinea.set(detalle.idDetalleOrden, {
            recibidas: acumuladas.recibidas + detalle.cantidadRecibida,
            aceptadas: acumuladas.aceptadas + detalle.cantidadAceptada,
            rechazadas: acumuladas.rechazadas + detalle.cantidadRechazada,
            autorizadas: acumuladas.autorizadas + detalle.cantidadAutorizada,
        });
    }

    const visibles = soloPendientes
        ? lineas.filter(
              linea =>
                  linea.pendientes > 0 ||
                  cantidadesPorLinea.has(linea.idDetalle),
          )
        : lineas;

    return (
        <section className="tarjeta">
            <h2>Seguimiento de entregas y cantidades autorizadas</h2>

            {ordenes.length === 0 ? (
                <p>Todavía no hay órdenes de compra.</p>
            ) : (
                <label className="campo">
                    Orden de compra
                    <select
                        value={idOrden}
                        onChange={evento => {
                            setIdOrden(evento.target.value);
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
                        servicio={servicioCierreOrden}
                    />
                    {recepciones.length === 0 && (
                        <p>No hay recepciones validadas cargadas para esta orden.</p>
                    )}

                    <label className="campo">
                        Mostrar líneas
                        <select
                            value={soloPendientes ? "pendientes" : "todas"}
                            onChange={evento =>
                                setSoloPendientes(evento.target.value === "pendientes")
                            }
                        >
                            <option value="pendientes">
                                Pendientes o con recepciones validadas
                            </option>
                            <option value="todas">Todas las líneas</option>
                        </select>
                    </label>

                    {visibles.length === 0 ? (
                        <p>No hay líneas para el filtro seleccionado.</p>
                    ) : (
                        <div className="tabla-contenedor">
                            <table>
                                <thead>
                                    <tr>
                                        <th scope="col">Línea</th>
                                        <th scope="col">Producto</th>
                                        <th scope="col">Ordenadas</th>
                                        <th scope="col">Recibidas</th>
                                        <th scope="col">Aceptadas</th>
                                        <th scope="col">Rechazadas</th>
                                        <th scope="col">Autorizadas</th>
                                        <th scope="col">Pendientes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {visibles.map(linea => (
                                        <tr key={linea.idDetalle}>
                                            <td>{linea.idDetalle}</td>
                                            <td>{linea.producto}</td>
                                            <td>{linea.ordenadas}</td>
                                            <td>
                                                {cantidadesPorLinea.get(linea.idDetalle)?.recibidas ?? 0}
                                            </td>
                                            <td>
                                                {cantidadesPorLinea.get(linea.idDetalle)?.aceptadas ?? 0}
                                            </td>
                                            <td>
                                                {cantidadesPorLinea.get(linea.idDetalle)?.rechazadas ?? 0}
                                            </td>
                                            <td>
                                                {cantidadesPorLinea.get(linea.idDetalle)?.autorizadas ?? 0}
                                            </td>
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
