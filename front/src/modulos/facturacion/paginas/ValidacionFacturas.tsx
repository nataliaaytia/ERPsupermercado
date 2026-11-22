import { useState } from 'react';
import { useCompras } from '../../../estado/useCompras';
import { notificarMensaje } from '../../../estado/almacenCompras';
import { formatearFecha } from '../../../utilidades/fechas';
import { moneda } from '../../../utilidades/formato';
import { enviarAPagos, rechazarFactura, validarFactura } from '../servicios/facturas';
import type { EstadoFactura, Factura } from '../tipos';

const CLASE_ESTADO: Record<EstadoFactura, string> = {
  Registrada: 'etiqueta etiqueta--info',
  Validada: 'etiqueta etiqueta--exito',
  'Con inconsistencias': 'etiqueta etiqueta--error',
  'Enviada a pagos': 'etiqueta etiqueta--exito',
  Rechazada: 'etiqueta',
};

function ejecutar(accion: () => void) {
  try {
    accion();
  } catch (fallo) {
    notificarMensaje(fallo instanceof Error ? fallo.message : 'No se pudo completar la acción.', 'error');
  }
}

function DetalleMatching({ factura }: { factura: Factura }) {
  const resultado = factura.resultadoMatching;
  if (!resultado) return <p className="texto-secundario">Todavía no se ejecutó la validación de tres vías.</p>;

  return (
    <>
      <div className="tabla-contenedor">
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Orden (cant.)</th>
              <th>Recepción (aceptadas)</th>
              <th>Factura (cant.)</th>
              <th>Precio orden</th>
              <th>Precio factura</th>
              <th>Resultado</th>
            </tr>
          </thead>
          <tbody>
            {resultado.lineas.map((linea) => (
              <tr key={linea.idDetalleOrden}>
                <td>{linea.descripcion}</td>
                <td>{linea.cantidadOrdenada}</td>
                <td>{linea.cantidadAceptada}</td>
                <td>{linea.cantidadFacturada}</td>
                <td>{moneda(linea.precioOrden)}</td>
                <td>{moneda(linea.precioFacturado)}</td>
                <td>
                  <span className={linea.conforme ? 'etiqueta etiqueta--exito' : 'etiqueta etiqueta--error'}>
                    {linea.conforme ? 'Conforme' : 'Diferencia'}
                  </span>
                  {!linea.conforme && <p className="texto-secundario">{linea.observacion}</p>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {resultado.observaciones.map((observacion) => (
        <p key={observacion} className="alerta alerta--advertencia">
          {observacion}
        </p>
      ))}
    </>
  );
}

/** Validación de facturas con 3-way matching y envío a Gestión de Pagos. */
export default function ValidacionFacturas() {
  const { facturas, ordenes } = useCompras();
  const [idAbierta, setIdAbierta] = useState<number | null>(null);

  if (facturas.length === 0) {
    return <p className="estado-vacio">Todavía no hay facturas registradas.</p>;
  }

  const ordenadas = [...facturas].sort((a, b) => b.idFactura - a.idFactura);

  return (
    <div className="lista-facturas">
      {ordenadas.map((factura) => {
        const abierta = idAbierta === factura.idFactura;
        const orden = ordenes.find((item) => item.idOrden === factura.idOrden);

        return (
          <article key={factura.idFactura} className="tarjeta">
            <header className="resumen">
              <div>
                <h2>Factura {factura.numeroFactura}</h2>
                <p className="texto-secundario">
                  {factura.razonSocialProveedor} · NIT {factura.nitProveedor} · {orden?.numero}
                </p>
              </div>
              <span className={CLASE_ESTADO[factura.estado]}>{factura.estado}</span>
            </header>

            <dl className="cantidades">
              <div>
                <dt>Emisión</dt>
                <dd>{formatearFecha(factura.fechaEmision)}</dd>
              </div>
              <div>
                <dt>Total facturado</dt>
                <dd>{moneda(factura.total)}</dd>
              </div>
              <div>
                <dt>Vencimiento</dt>
                <dd>{factura.fechaVencimiento ? formatearFecha(factura.fechaVencimiento) : '—'}</dd>
              </div>
            </dl>

            <div className="acciones">
              {(factura.estado === 'Registrada' || factura.estado === 'Con inconsistencias') && (
                <button type="button" onClick={() => ejecutar(() => validarFactura(factura.idFactura))}>
                  Validar (3 vías)
                </button>
              )}
              {factura.estado === 'Validada' && (
                <button type="button" onClick={() => ejecutar(() => enviarAPagos(factura.idFactura))}>
                  Enviar a pagos
                </button>
              )}
              {factura.estado === 'Con inconsistencias' && (
                <button
                  type="button"
                  className="btn-peligro"
                  onClick={() => ejecutar(() => rechazarFactura(factura.idFactura))}
                >
                  Rechazar factura
                </button>
              )}
              <button
                type="button"
                className="btn-secundario"
                onClick={() => setIdAbierta(abierta ? null : factura.idFactura)}
                aria-expanded={abierta}
              >
                {abierta ? 'Ocultar comparación' : 'Ver comparación'}
              </button>
            </div>

            {abierta && <DetalleMatching factura={factura} />}
          </article>
        );
      })}
    </div>
  );
}
