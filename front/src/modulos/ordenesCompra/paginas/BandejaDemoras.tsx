// natalia: scrum 526

import { useEffect, useState } from "react";
import { useCompras } from "../../../estado/useCompras";
import { conexion } from "../../../servicios/api/configuracion";
import { calcularDemoras } from "../servicios/calcularDemoras";
import type { DemoraEntrega } from "../servicios/calcularDemoras";
import { fechaHoy } from "../servicios/compromisosEntrega";
import {
    consultarCompromisosVencidos,
    mensajeDeError,
    nombreProducto,
    type CompromisoVencidoApi,
} from "../servicios/ordenesApi";

/** Con el servidor conectado los compromisos vencidos se consultan allí. */
const conServidor = conexion.ordenes;

interface ConsultaVencidos {
    cargando: boolean;
    error: string;
    vencidos: CompromisoVencidoApi[];
}

function useCompromisosVencidos(): ConsultaVencidos {
    const [consulta, setConsulta] = useState<ConsultaVencidos>({
        cargando: conServidor,
        error: "",
        vencidos: [],
    });

    useEffect(() => {
        if (!conServidor) return;
        let activo = true;

        consultarCompromisosVencidos()
            .then(vencidos => {
                if (activo) setConsulta({ cargando: false, error: "", vencidos: vencidos ?? [] });
            })
            .catch(fallo => {
                if (activo) {
                    setConsulta({
                        cargando: false,
                        error: mensajeDeError(fallo, "No se pudieron consultar los compromisos vencidos."),
                        vencidos: [],
                    });
                }
            });

        return () => {
            activo = false;
        };
    }, []);

    return consulta;
}

interface Props {
    onVerCompromiso: (demora: DemoraEntrega) => void;
}

export default function BandejaDemoras({ onVerCompromiso }: Props) {
    const { ordenes, ofertas, proveedores, recepcionesValidadas } = useCompras();
    const [fechaPrueba, setFechaPrueba] = useState("");
    const consulta = useCompromisosVencidos();

    const hoy = fechaHoy();
    const fechaConsulta =
        import.meta.env.DEV && !conServidor && fechaPrueba ? fechaPrueba : hoy;

    const demoras: DemoraEntrega[] = conServidor
        ? consulta.vencidos.map(vencido => ({
              idOrden: vencido.idOrden,
              numeroOrden: vencido.numeroOrden,
              idDetalle: vencido.idDetalle,
              idCompromiso: vencido.idCompromiso,
              proveedor:
                  proveedores.find(item => item.idProveedor === vencido.proveedorId)
                      ?.razonSocial ?? "Proveedor no identificado",
              producto: nombreProducto(vencido.productoId),
              fechaEntrega: String(vencido.fechaComprometida).slice(0, 10),
              cantidadPendiente: vencido.cantidadPendiente,
          }))
        : calcularDemoras(
              ordenes,
              ofertas,
              recepcionesValidadas,
              fechaConsulta,
          );

    return (
        <section className="tarjeta">
            <h2>Compromisos de entrega vencidos</h2>

            {import.meta.env.DEV && !conServidor && (
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

            {consulta.error && (
                <p className="alerta alerta--error" role="alert">
                    {consulta.error}
                </p>
            )}

            {consulta.cargando ? (
                <p>Consultando compromisos vencidos…</p>
            ) : demoras.length === 0 ? (
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