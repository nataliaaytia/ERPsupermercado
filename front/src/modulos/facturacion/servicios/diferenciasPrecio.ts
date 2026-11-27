/**
 * SCRUM-674 · Diferencias entre el precio facturado y el acordado.
 *
 * Dado que la factura y la orden tienen líneas equivalentes, se evalúan precios
 * y descuentos línea por línea: precio de lista y descuento pactados en la orden
 * frente al precio cobrado en la factura. Se marcan las líneas que exceden la
 * tolerancia vigente o, si no hay una definida, cualquier diferencia (coincidencia
 * exacta).
 */
import { catalogos } from '../../../config/catalogos';
import type { EstadoCompartido } from '../../../estado/almacenCompras';
import { redondear } from '../../../utilidades/formato';

export type EstadoPrecio = 'Coincide' | 'Dentro de la tolerancia' | 'Excede la tolerancia';

export interface LineaPrecioFactura {
  idDetalleOrden: number;
  cantidad: number;
  precioUnitario: number;
}

export interface DiferenciaPrecioLinea {
  idDetalleOrden: number;
  descripcion: string;
  cantidad: number;
  /** Precio de lista de la orden, antes del descuento. */
  precioLista: number;
  /** Descuento pactado en la orden (%). */
  descuentoAcordado: number;
  /** Precio neto pactado: precio de lista con el descuento aplicado. */
  precioAcordado: number;
  precioFacturado: number;
  /** Descuento que resulta del precio facturado frente al de lista (%). */
  descuentoFacturado: number;
  /** Positivo: se cobra más de lo acordado. Negativo: se cobra menos. */
  diferenciaUnitaria: number;
  variacionPorcentaje: number;
  /** cantidad × diferencia unitaria. */
  impacto: number;
  estado: EstadoPrecio;
}

export interface ResultadoDiferenciasPrecio {
  /** null cuando no hay tolerancia definida: se exige coincidencia exacta. */
  tolerancia: number | null;
  lineas: DiferenciaPrecioLinea[];
  totalAcordado: number;
  totalFacturado: number;
  impactoTotal: number;
  lineasQueExceden: number;
  conforme: boolean;
}

/** Tolerancia de precio vigente (%), o null si no hay una definida. */
export function toleranciaVigente(): number | null {
  const valor: number | undefined = catalogos.toleranciaMatchingPorcentaje;
  return valor !== undefined && valor > 0 ? valor : null;
}

function porcentaje(parte: number, base: number): number {
  return base > 0 ? redondear((parte / base) * 100) : 0;
}

function clasificar(diferencia: number, precioAcordado: number, tolerancia: number | null): EstadoPrecio {
  if (diferencia === 0) return 'Coincide';
  if (tolerancia !== null && Math.abs(diferencia) <= precioAcordado * (tolerancia / 100)) {
    return 'Dentro de la tolerancia';
  }
  return 'Excede la tolerancia';
}

/** Evalúa precios y descuentos de las líneas facturadas frente a los acordados en la orden. */
export function analizarDiferenciasPrecio(
  compras: EstadoCompartido,
  idOrden: number,
  lineasFactura: readonly LineaPrecioFactura[],
): ResultadoDiferenciasPrecio | null {
  const orden = compras.ordenes.find((item) => item.idOrden === idOrden);
  if (!orden) return null;

  const tolerancia = toleranciaVigente();

  const lineas = lineasFactura
    .filter((linea) => linea.cantidad > 0 && linea.precioUnitario > 0)
    .flatMap((linea): DiferenciaPrecioLinea[] => {
      const detalle = orden.detalles.find((item) => item.idDetalle === linea.idDetalleOrden);
      if (!detalle || detalle.cantidad <= 0) return [];

      const precioAcordado = redondear(detalle.subtotal / detalle.cantidad);
      const precioLista = detalle.precio > 0 ? redondear(detalle.precio) : precioAcordado;
      const precioFacturado = redondear(linea.precioUnitario);
      const diferenciaUnitaria = redondear(precioFacturado - precioAcordado);

      return [
        {
          idDetalleOrden: detalle.idDetalle,
          descripcion: detalle.producto.descripcion,
          cantidad: linea.cantidad,
          precioLista,
          descuentoAcordado: porcentaje(precioLista - precioAcordado, precioLista),
          precioAcordado,
          precioFacturado,
          descuentoFacturado: porcentaje(precioLista - precioFacturado, precioLista),
          diferenciaUnitaria,
          variacionPorcentaje: porcentaje(diferenciaUnitaria, precioAcordado),
          impacto: redondear(diferenciaUnitaria * linea.cantidad),
          estado: clasificar(diferenciaUnitaria, precioAcordado, tolerancia),
        },
      ];
    });

  const totalAcordado = redondear(lineas.reduce((total, linea) => total + linea.precioAcordado * linea.cantidad, 0));
  const totalFacturado = redondear(lineas.reduce((total, linea) => total + linea.precioFacturado * linea.cantidad, 0));
  const lineasQueExceden = lineas.filter((linea) => linea.estado === 'Excede la tolerancia').length;

  return {
    tolerancia,
    lineas,
    totalAcordado,
    totalFacturado,
    impactoTotal: redondear(totalFacturado - totalAcordado),
    lineasQueExceden,
    conforme: lineasQueExceden === 0,
  };
}
