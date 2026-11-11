import type { RecepcionValidada } from "../servicioOrdenesCompra/tipos";
import { estaEnInspeccion } from "./registroRecepcion";
import type { RecepcionRegistrada } from "./tiposRecepcion";

interface Props {
    recepcion: RecepcionRegistrada;
    validadas: readonly RecepcionValidada[];
}

export default function ResumenCantidadesRecepcion({
    recepcion,
    validadas,
}: Props) {
    const validada = validadas.find(item =>
        item.estado === "Validada" &&
        item.idOrden === recepcion.idOrden &&
        item.idRecepcion === recepcion.idRecepcion,
    );

    const enInspeccion = estaEnInspeccion(recepcion, validadas);

    return (
        <div className="ordenes-compra__tabla">
            <table>
                <thead>
                    <tr>
                        <th scope="col">Línea</th>
                        <th scope="col">Recibidas</th>
                        <th scope="col">En inspección</th>
                        <th scope="col">Aceptadas</th>
                    </tr>
                </thead>
                <tbody>
                    {recepcion.detalles.map(linea => {
                        const aceptadas = validada
                            ? validada.detalles
                                .filter(detalle => detalle.idDetalleOrden === linea.idDetalleOrden)
                                .reduce((total, detalle) => total + detalle.cantidadAceptada, 0)
                            : enInspeccion ? 0 : "—";

                        return (
                            <tr key={linea.idDetalleOrden}>
                                <td>{linea.idDetalleOrden}</td>
                                <td>{linea.cantidadRecibida}</td>
                                <td>{enInspeccion ? linea.cantidadRecibida : 0}</td>
                                <td>{aceptadas}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}