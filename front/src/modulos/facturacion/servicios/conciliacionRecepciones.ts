/**
 * SCRUM-673 · Conciliación de una factura con las recepciones parciales.
 *
 * Una orden puede recibirse en varias entregas. Solo lo ACEPTADO en las
 * recepciones validadas puede facturarse. Por cada línea, la cantidad facturada
 * se distribuye entre las recepciones aceptadas en orden de llegada: primero se
 * ocupan con lo ya facturado en otras facturas y luego con esta, de modo que una
 * misma unidad aceptada nunca se asigna dos veces. Lo que no entra en el saldo
 * queda como exceso y se rechaza.
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
  /** Unidades de esta recepción ya asignadas a otras facturas. */
  asignadoEnOtras: number;
  /** Unidades de esta recepción asignadas a la factura que se concilia. */
  asignadoEnEstaFactura: number;
  /** Unidades aceptadas de esta recepción que siguen libres después de la asignación. */
  saldoRestante: number;
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

  // Orden de llegada: las primeras entregas se facturan primero.
  const porLlegada = [...registradas].sort(
    (a, b) => a.fecha.localeCompare(b.fecha) || a.idRecepcion - b.idRecepcion,
  );

  const lineas = orden.detalles.map((detalle): LineaConciliacion => {
    const recepciones: RecepcionParcialLinea[] = porLlegada.flatMap((recepcion) => {
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
          asignadoEnOtras: 0,
          asignadoEnEstaFactura: 0,
          saldoRestante: 0,
        },
      ];
    });

    const totalAceptado = recepciones
      .filter((recepcion) => recepcion.validada)
      .reduce((total, recepcion) => total + recepcion.cantidadAceptada, 0);
    const otras = facturadoEnOtras.get(detalle.idDetalle) ?? 0;
    const saldoFacturable = Math.max(0, totalAceptado - otras);
    const cantidadFacturada = cantidades.get(detalle.idDetalle) ?? 0;

    // Distribución sin duplicar: primero lo facturado antes, después esta factura.
    let pendienteOtras = otras;
    let pendienteEsta = cantidadFacturada;
    for (const recepcion of recepciones) {
      if (!recepcion.validada) continue;
      let libre = recepcion.cantidadAceptada;
      recepcion.asignadoEnOtras = Math.min(libre, pendienteOtras);
      libre -= recepcion.asignadoEnOtras;
      pendienteOtras -= recepcion.asignadoEnOtras;
      recepcion.asignadoEnEstaFactura = Math.min(libre, pendienteEsta);
      libre -= recepcion.asignadoEnEstaFactura;
      pendienteEsta -= recepcion.asignadoEnEstaFactura;
      recepcion.saldoRestante = libre;
    }
    const exceso = pendienteEsta;

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
