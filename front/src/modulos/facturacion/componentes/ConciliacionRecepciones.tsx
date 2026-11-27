import { formatearFecha } from '../../../utilidades/fechas';
import type { EstadoLineaConciliacion, ResultadoConciliacion } from '../servicios/conciliacionRecepciones';
import './ConciliacionRecepciones.css';

const CLASE_ESTADO: Record<EstadoLineaConciliacion, string> = {
  Conforme: 'etiqueta etiqueta--exito',
  'Excede lo aceptado': 'etiqueta etiqueta--error',
  'Sin recepción aceptada': 'etiqueta',
};

interface Props {
  resultado: ResultadoConciliacion;
}

/** SCRUM-673 · Conciliación de la factura con las recepciones parciales de su orden. */
export default function ConciliacionRecepciones({ resultado }: Props) {
  return (
    <section className="conciliacion-recepciones" aria-labelledby="conciliacion-recepciones-titulo">
      <header className="conciliacion-recepciones__cabecera">
        <h3 id="conciliacion-recepciones-titulo">Conciliación con recepciones</h3>
        <span className="texto-secundario">
          {resultado.totalRecepciones === 1 ? '1 entrega registrada' : `${resultado.totalRecepciones} entregas registradas`} para{' '}
          {resultado.numeroOrden}
        </span>
      </header>

      <div className="tabla-contenedor">
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Ordenado</th>
              <th>Entregas parciales</th>
              <th>Aceptado</th>
              <th>Facturado antes</th>
              <th>Saldo facturable</th>
              <th>En esta factura</th>
              <th>Resultado</th>
            </tr>
          </thead>
          <tbody>
            {resultado.lineas.map((linea) => (
              <tr key={linea.idDetalleOrden}>
                <td>{linea.descripcion}</td>
                <td>{linea.cantidadOrdenada}</td>
                <td>
                  {linea.recepciones.length === 0 ? (
                    <span className="texto-secundario">Sin entregas</span>
                  ) : (
                    <ul className="conciliacion-recepciones__entregas">
                      {linea.recepciones.map((recepcion) => (
                        <li key={recepcion.idRecepcion}>
                          <strong>{recepcion.documento}</strong> · {formatearFecha(recepcion.fecha)}
                          <span className="texto-secundario">
                            {recepcion.validada
                              ? ` · ${recepcion.cantidadAceptada} de ${recepcion.cantidadRecibida} aceptadas`
                              : ` · ${recepcion.cantidadRecibida} recibidas, en inspección`}
                          </span>
                          {recepcion.validada && (
                            <span className="conciliacion-recepciones__asignacion">
                              {recepcion.asignadoEnOtras > 0 && `${recepcion.asignadoEnOtras} ya facturadas · `}
                              <strong>{recepcion.asignadoEnEstaFactura} en esta factura</strong> · {recepcion.saldoRestante}{' '}
                              libres
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </td>
                <td>{linea.totalAceptado}</td>
                <td>{linea.facturadoEnOtras}</td>
                <td>
                  <strong>{linea.saldoFacturable}</strong>
                </td>
                <td>{linea.cantidadFacturada}</td>
                <td>
                  <span className={CLASE_ESTADO[linea.estado]}>{linea.estado}</span>
                  {linea.exceso > 0 && (
                    <p className="conciliacion-recepciones__exceso">{linea.exceso} unidades de más</p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {resultado.conforme ? (
        <p className="alerta alerta--exito">
          Las cantidades facturadas no superan lo aceptado en las recepciones.
        </p>
      ) : (
        <p className="alerta alerta--error" role="alert">
          La factura excede en {resultado.totalExceso} unidades lo aceptado en las recepciones. Solo se puede facturar el
          saldo facturable de cada producto.
        </p>
      )}

      {resultado.lineas.some((linea) => linea.recepciones.some((recepcion) => !recepcion.validada)) && (
        <p className="alerta alerta--info">
          Hay entregas en inspección: sus cantidades se podrán facturar cuando tengan la revisión final.
        </p>
      )}
    </section>
  );
}
