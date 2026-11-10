import { consultarDevoluciones } from "./servicioDevoluciones";
import SeguimientoDevolucion from "./SeguimientoDevolucion";
import { useRequisiciones } from "../requisicionesCotizaciones/useRequisiciones";

export default function DevolucionesRecepcion() {
    const compras = useRequisiciones();
    const devoluciones = consultarDevoluciones(compras);

    return (
        <section className="ordenes-compra__tarjeta">
            <h2>Seguimiento y resolución de devoluciones</h2>
            <p>
                Las cantidades rechazadas siguen formando parte del saldo
                pendiente de compra hasta que se reciba una reposición conforme.
            </p>

            {compras.errorCarga ? (
                <p className="ordenes-compra__error" role="alert">
                    {compras.errorCarga}
                </p>
            ) : devoluciones.length === 0 ? (
                <p>No hay devoluciones pendientes o registradas.</p>
            ) : (
                <div className="devoluciones-recepcion__lista">
                    {devoluciones.map(devolucion => (
                        <SeguimientoDevolucion
                            key={devolucion.idDevolucion}
                            devolucion={devolucion}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
