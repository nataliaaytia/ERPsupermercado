/**
 * SCRUM-673 · Conciliación de una factura con las recepciones parciales.
 *
 * Una orden puede recibirse en varias entregas. Solo lo ACEPTADO en las
 * recepciones validadas puede facturarse, descontando lo ya facturado en otras
 * facturas de la misma orden. Este servicio arma, por línea de la orden, el
 * detalle de cada recepción parcial y detecta si la factura excede lo aceptado.
 */
import type { EstadoCompartido } from '../../../estado/almacenCompras';
import type { Factura } from '../tipos';

/** Facturas que ya "consumen" cantidades de la orden (las rechazadas no cuentan). */
const ESTADOS_QUE_CONSUMEN: Factura['estado'][] = ['Registrada', 'Validada', 'Con inconsistencias', 'Enviada a pagos'];

export interface RecepcionParcialLinea {
  idRecepcion: number;
  documento: string;
  fecha: string;
  cantidadRecibida: number;
  cantidadAceptada: number;
  /** false mientras la recepción no tenga revisión final: todavía no se puede facturar. */
  validada: boolean;
}

export type EstadoLineaConciliacion = 'Conforme' | 'Excede lo aceptado' | 'Sin recepción aceptada';

export interface LineaConciliacion {
  idDetalleOrden: number;
  descripcion: string;
  cantidadOrdenada: number;
  recepciones: RecepcionParcialLinea[];
  totalAceptado: number;
  facturadoEnOtras: number;
  saldoFacturable: number;
  cantidadFacturada: number;
  exceso: number;
  estado: EstadoLineaConciliacion;
}

export interface ResultadoConciliacion {
  idOrden: number;
  numeroOrden: string;
  lineas: LineaConciliacion[];
  /** Cantidad de entregas parciales registradas para la orden. */
  totalRecepciones: number;
  conforme: boolean;
  totalExceso: number;
}

/**
 * Concilia las cantidades de una factura con las recepciones de su orden.
 *
 * @param cantidades cantidad facturada por línea de la orden (idDetalleOrden → cantidad).
 * @param idFacturaExcluida al revisar una factura ya registrada, para no contarla dos veces.
 */
export function conciliarConRecepciones(
  compras: EstadoCompartido,
  idOrden: number,
  cantidades: ReadonlyMap<number, number>,
  idFacturaExcluida?: number,
): ResultadoConciliacion | null {
  const orden = compras.ordenes.find((item) => item.idOrden === idOrden);
  if (!orden) return null;

  const registradas = compras.recepcionesRegistradas.filter((recepcion) => recepcion.idOrden === idOrden);
  const validadas = compras.recepcionesValidadas.filter((recepcion) => recepcion.idOrden === idOrden);

  const facturadoEnOtras = new Map<number, number>();
  for (const factura of compras.facturas) {
    if (factura.idOrden !== idOrden || factura.idFactura === idFacturaExcluida) continue;
    if (!ESTADOS_QUE_CONSUMEN.includes(factura.estado)) continue;
    for (const detalle of factura.detalles) {
      facturadoEnOtras.set(
        detalle.idDetalleOrden,
        (facturadoEnOtras.get(detalle.idDetalleOrden) ?? 0) + detalle.cantidad,
      );
    }
  }

  const lineas = orden.detalles.map((detalle): LineaConciliacion => {
    const recepciones: RecepcionParcialLinea[] = registradas.flatMap((recepcion) => {
      const recibida = recepcion.detalles.find((linea) => linea.idDetalleOrden === detalle.idDetalle);
      if (!recibida) return [];
      const validacion = validadas.find((item) => item.idRecepcion === recepcion.idRecepcion);
      const aceptada = validacion?.detalles.find((linea) => linea.idDetalleOrden === detalle.idDetalle);
      return [
        {
          idRecepcion: recepcion.idRecepcion,
          documento: recepcion.documento,
          fecha: recepcion.fecha,
          cantidadRecibida: recibida.cantidadRecibida,
          cantidadAceptada: aceptada?.cantidadAceptada ?? 0,
          validada: Boolean(validacion),
        },
      ];
    });

    const totalAceptado = recepciones
      .filter((recepcion) => recepcion.validada)
      .reduce((total, recepcion) => total + recepcion.cantidadAceptada, 0);
    const otras = facturadoEnOtras.get(detalle.idDetalle) ?? 0;
    const saldoFacturable = Math.max(0, totalAceptado - otras);
    const cantidadFacturada = cantidades.get(detalle.idDetalle) ?? 0;
    const exceso = Math.max(0, cantidadFacturada - saldoFacturable);

    let estado: EstadoLineaConciliacion = 'Conforme';
    if (exceso > 0) estado = 'Excede lo aceptado';
    else if (totalAceptado === 0 && cantidadFacturada === 0) estado = 'Sin recepción aceptada';

    return {
      idDetalleOrden: detalle.idDetalle,
      descripcion: detalle.producto.descripcion,
      cantidadOrdenada: detalle.cantidad,
      recepciones,
      totalAceptado,
      facturadoEnOtras: otras,
      saldoFacturable,
      cantidadFacturada,
      exceso,
      estado,
    };
  });

  const totalExceso = lineas.reduce((total, linea) => total + linea.exceso, 0);

  return {
    idOrden,
    numeroOrden: orden.numero,
    lineas,
    totalRecepciones: registradas.length,
    conforme: totalExceso === 0,
    totalExceso,
  };
}

/** Lanza un error si la factura intenta cobrar más de lo aceptado en las recepciones. */
export function verificarNoExcedeLoAceptado(
  compras: EstadoCompartido,
  idOrden: number,
  cantidades: ReadonlyMap<number, number>,
): void {
  const resultado = conciliarConRecepciones(compras, idOrden, cantidades);
  if (!resultado || resultado.conforme) return;

  const detalle = resultado.lineas
    .filter((linea) => linea.exceso > 0)
    .map((linea) => `${linea.descripcion}: se facturan ${linea.cantidadFacturada}, pero solo hay ${linea.saldoFacturable} aceptadas sin facturar`)
    .join('; ');
  throw new Error(`La factura excede lo aceptado en las recepciones. ${detalle}.`);
}
