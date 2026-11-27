import { moneda } from '../../../utilidades/formato';
import type { EstadoPrecio, ResultadoDiferenciasPrecio } from '../servicios/diferenciasPrecio';
import './DiferenciasPrecio.css';

const CLASE_ESTADO: Record<EstadoPrecio, string> = {
  Coincide: 'etiqueta etiqueta--exito',
  'Dentro de la tolerancia': 'etiqueta etiqueta--info',
  'Excede la tolerancia': 'etiqueta etiqueta--error',
};

const formatoPorcentaje = new Intl.NumberFormat('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function conSigno(valor: number, texto: string): string {
  return valor > 0 ? `+${texto}` : texto;
}

function porcentaje(valor: number): string {
  return `${formatoPorcentaje.format(valor)}%`;
}

interface Props {
  resultado: ResultadoDiferenciasPrecio;
}

/** SCRUM-674 · Diferencias entre el precio facturado y el acordado en la orden. */
export default function DiferenciasPrecio({ resultado }: Props) {
  if (resultado.lineas.length === 0) return null;

  return (
    <section className="diferencias-precio" aria-labelledby="diferencias-precio-titulo">
      <header className="diferencias-precio__cabecera">
        <h3 id="diferencias-precio-titulo">Precio facturado vs. acordado</h3>
        <span className="texto-secundario">
          {resultado.tolerancia === null
            ? 'Sin tolerancia definida: se exige coincidencia exacta'
            : `Tolerancia vigente: ${porcentaje(resultado.tolerancia)} del precio acordado`}
        </span>
      </header>

      <div className="tabla-contenedor">
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio de lista</th>
              <th>Descuento acordado</th>
              <th>Precio acordado</th>
              <th>Precio facturado</th>
              <th>Descuento facturado</th>
              <th>Diferencia por unidad</th>
              <th>Impacto</th>
              <th>Resultado</th>
            </tr>
          </thead>
          <tbody>
            {resultado.lineas.map((linea) => (
              <tr key={linea.idDetalleOrden}>
                <td>{linea.descripcion}</td>
                <td>{linea.cantidad}</td>
                <td>{moneda(linea.precioLista)}</td>
                <td>{porcentaje(linea.descuentoAcordado)}</td>
                <td>{moneda(linea.precioAcordado)}</td>
                <td>{moneda(linea.precioFacturado)}</td>
                <td className={linea.descuentoFacturado !== linea.descuentoAcordado ? 'diferencias-precio__distinto' : undefined}>
                  {porcentaje(linea.descuentoFacturado)}
                </td>
                <td>
                  {conSigno(linea.diferenciaUnitaria, moneda(linea.diferenciaUnitaria))}
                  {linea.diferenciaUnitaria !== 0 && (
                    <span className="texto-secundario"> ({conSigno(linea.variacionPorcentaje, porcentaje(linea.variacionPorcentaje))})</span>
                  )}
                </td>
                <td className={linea.impacto > 0 ? 'diferencias-precio__distinto' : undefined}>
                  {conSigno(linea.impacto, moneda(linea.impacto))}
                </td>
                <td>
                  <span className={CLASE_ESTADO[linea.estado]}>{linea.estado}</span>
                  {linea.estado === 'Excede la tolerancia' && (
                    <p className="diferencias-precio__detalle">
                      {linea.diferenciaUnitaria > 0 ? 'Cobra más de lo acordado' : 'Cobra menos de lo acordado'}
                    </p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <dl className="diferencias-precio__totales">
        <div>
          <dt>Total acordado</dt>
          <dd>{moneda(resultado.totalAcordado)}</dd>
        </div>
        <div>
          <dt>Total facturado</dt>
          <dd>{moneda(resultado.totalFacturado)}</dd>
        </div>
        <div>
          <dt>Diferencia</dt>
          <dd className={resultado.impactoTotal > 0 ? 'diferencias-precio__distinto' : undefined}>
            {conSigno(resultado.impactoTotal, moneda(resultado.impactoTotal))}
          </dd>
        </div>
      </dl>

      {resultado.conforme ? (
        <p className="alerta alerta--exito">Los precios y descuentos facturados coinciden con lo acordado en la orden.</p>
      ) : (
        <p className="alerta alerta--advertencia" role="alert">
          {resultado.lineasQueExceden === 1
            ? '1 producto se cobra con un importe distinto al acordado.'
            : `${resultado.lineasQueExceden} productos se cobran con un importe distinto al acordado.`}{' '}
          Revisa el cobro con el proveedor.
        </p>
      )}
    </section>
  );
}
