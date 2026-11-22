/**
 * Lógica de facturación y validación de tres vías (3-Way Matching):
 * factura comercial  vs.  orden de compra  vs.  recepción validada.
 */
import { actualizarCompras, obtenerCompras, siguienteId, type EstadoCompartido } from '../../../estado/almacenCompras';
import { catalogos } from '../../../config/catalogos';
import { fechaHoy, sumarDias } from '../../../utilidades/fechas';
import { redondear } from '../../../utilidades/formato';
import type { OrdenCompra } from '../../ordenesCompra/tipos';
import type { DatosRegistroFactura, Factura, LineaMatching, ResultadoMatching } from '../tipos';

/** Estados de factura que ya "consumen" cantidades de la orden. */
const ESTADOS_ACTIVOS: Factura['estado'][] = ['Registrada', 'Validada', 'Con inconsistencias', 'Enviada a pagos'];

export interface LineaFacturable {
  idDetalleOrden: number;
  descripcion: string;
  cantidadOrdenada: number;
  cantidadAceptada: number;
  cantidadFacturada: number;
  cantidadPorFacturar: number;
  precioUnitario: number;
}

/** Precio unitario efectivo de la orden (con el descuento de la oferta aplicado). */
export function precioUnitarioOrden(orden: OrdenCompra, idDetalle: number): number {
  const linea = orden.detalles.find((detalle) => detalle.idDetalle === idDetalle);
  return linea ? redondear(linea.subtotal / linea.cantidad) : 0;
}

function aceptadasPorLinea(compras: EstadoCompartido, idOrden: number): Map<number, number> {
  const totales = new Map<number, number>();
  for (const recepcion of compras.recepcionesValidadas) {
    if (recepcion.idOrden !== idOrden) continue;
    for (const detalle of recepcion.detalles) {
      totales.set(detalle.idDetalleOrden, (totales.get(detalle.idDetalleOrden) ?? 0) + detalle.cantidadAceptada);
    }
  }
  return totales;
}

function facturadasPorLinea(compras: EstadoCompartido, idOrden: number, excluirFactura?: number): Map<number, number> {
  const totales = new Map<number, number>();
  for (const factura of compras.facturas) {
    if (factura.idOrden !== idOrden || factura.idFactura === excluirFactura) continue;
    if (!ESTADOS_ACTIVOS.includes(factura.estado)) continue;
    for (const detalle of factura.detalles) {
      totales.set(detalle.idDetalleOrden, (totales.get(detalle.idDetalleOrden) ?? 0) + detalle.cantidad);
    }
  }
  return totales;
}

/** Líneas de una orden con cantidades recibidas y aceptadas pendientes de facturar. */
export function lineasFacturables(compras: EstadoCompartido, orden: OrdenCompra): LineaFacturable[] {
  const aceptadas = aceptadasPorLinea(compras, orden.idOrden);
  const facturadas = facturadasPorLinea(compras, orden.idOrden);

  return orden.detalles.map((detalle) => {
    const cantidadAceptada = aceptadas.get(detalle.idDetalle) ?? 0;
    const cantidadFacturada = facturadas.get(detalle.idDetalle) ?? 0;
    return {
      idDetalleOrden: detalle.idDetalle,
      descripcion: detalle.producto.descripcion,
      cantidadOrdenada: detalle.cantidad,
      cantidadAceptada,
      cantidadFacturada,
      cantidadPorFacturar: Math.max(0, cantidadAceptada - cantidadFacturada),
      precioUnitario: precioUnitarioOrden(orden, detalle.idDetalle),
    };
  });
}

/** Órdenes que tienen mercadería aceptada pendiente de facturar. */
export function ordenesFacturables(compras: EstadoCompartido): OrdenCompra[] {
  return compras.ordenes.filter((orden) =>
    lineasFacturables(compras, orden).some((linea) => linea.cantidadPorFacturar > 0),
  );
}

/** Proveedor de una orden, a partir de la oferta que la originó. */
export function proveedorDeOrden(compras: EstadoCompartido, orden: OrdenCompra) {
  const oferta = compras.ofertas.find((item) => item.idOferta === orden.idOfertaOrigen);
  return oferta?.proveedor;
}

export function registrarFactura(datos: DatosRegistroFactura): Factura {
  const compras = obtenerCompras();
  const orden = compras.ordenes.find((item) => item.idOrden === datos.idOrden);
  if (!orden) throw new Error('Selecciona una orden de compra.');

  const proveedor = proveedorDeOrden(compras, orden);
  if (!proveedor) throw new Error('No se encontró el proveedor de la orden.');

  const numero = datos.numeroFactura.trim();
  if (!/^[A-Za-z0-9-]{3,20}$/.test(numero)) {
    throw new Error('El número de factura debe tener entre 3 y 20 letras, números o guiones.');
  }
  if (
    compras.facturas.some(
      (factura) =>
        factura.numeroFactura.toLowerCase() === numero.toLowerCase() &&
        factura.idProveedor === proveedor.idProveedor &&
        factura.estado !== 'Rechazada',
    )
  ) {
    throw new Error(`La factura ${numero} de este proveedor ya fue registrada.`);
  }
  if (!datos.fechaEmision || datos.fechaEmision > fechaHoy()) {
    throw new Error('La fecha de emisión no puede ser posterior a hoy.');
  }

  const detalles = datos.detalles
    .filter((detalle) => detalle.cantidad.trim() !== '')
    .map((detalle) => {
      const linea = orden.detalles.find((item) => item.idDetalle === detalle.idDetalleOrden);
      const cantidad = Number(detalle.cantidad);
      const precioUnitario = Number(detalle.precioUnitario);
      if (!linea) throw new Error('Una de las líneas no pertenece a la orden.');
      if (!Number.isInteger(cantidad) || cantidad <= 0) {
        throw new Error(`Cantidad no válida para ${linea.producto.descripcion}.`);
      }
      if (!Number.isFinite(precioUnitario) || precioUnitario <= 0) {
        throw new Error(`Precio no válido para ${linea.producto.descripcion}.`);
      }
      return {
        idDetalleOrden: linea.idDetalle,
        descripcion: linea.producto.descripcion,
        cantidad,
        precioUnitario: redondear(precioUnitario),
        subtotal: redondear(cantidad * precioUnitario),
      };
    });

  if (detalles.length === 0) throw new Error('Ingresa al menos una línea facturada.');

  const factura: Factura = {
    idFactura: siguienteId(compras.facturas.map((item) => item.idFactura)),
    numeroFactura: numero,
    idOrden: orden.idOrden,
    idProveedor: proveedor.idProveedor,
    razonSocialProveedor: proveedor.razonSocial,
    nitProveedor: proveedor.nitRuc,
    fechaEmision: datos.fechaEmision,
    fechaRegistro: fechaHoy(),
    condicionPago: datos.condicionPago,
    detalles,
    total: redondear(detalles.reduce((total, detalle) => total + detalle.subtotal, 0)),
    estado: 'Registrada',
  };

  actualizarCompras((actual) => ({
    ...actual,
    facturas: [...actual.facturas, factura],
    mensaje: `Factura ${factura.numeroFactura} registrada. Ahora valídala con el 3-way matching.`,
    tipoMensaje: 'exito',
  }));

  return factura;
}

/** Compara factura, orden y recepción línea por línea. */
export function calcularMatching(compras: EstadoCompartido, factura: Factura): ResultadoMatching {
  const orden = compras.ordenes.find((item) => item.idOrden === factura.idOrden);
  const tolerancia = catalogos.toleranciaMatchingPorcentaje / 100;
  const observaciones: string[] = [];

  if (!orden) {
    return {
      fecha: new Date().toISOString(),
      conforme: false,
      totalOrden: 0,
      totalFacturado: factura.total,
      lineas: [],
      observaciones: ['La orden de compra asociada no existe.'],
    };
  }

  const aceptadas = aceptadasPorLinea(compras, orden.idOrden);
  const facturadasAntes = facturadasPorLinea(compras, orden.idOrden, factura.idFactura);

  const lineas: LineaMatching[] = factura.detalles.map((detalle) => {
    const lineaOrden = orden.detalles.find((item) => item.idDetalle === detalle.idDetalleOrden);
    const precioOrden = precioUnitarioOrden(orden, detalle.idDetalleOrden);
    const disponible = (aceptadas.get(detalle.idDetalleOrden) ?? 0) - (facturadasAntes.get(detalle.idDetalleOrden) ?? 0);
    const problemas: string[] = [];

    if (!lineaOrden) problemas.push('No existe en la orden.');
    if (detalle.cantidad > disponible) {
      problemas.push(`Se facturan ${detalle.cantidad} pero solo hay ${Math.max(0, disponible)} aceptadas sin facturar.`);
    }
    if (Math.abs(detalle.precioUnitario - precioOrden) > precioOrden * tolerancia) {
      problemas.push(`Precio facturado distinto al de la orden (Bs ${precioOrden.toFixed(2)}).`);
    }

    return {
      idDetalleOrden: detalle.idDetalleOrden,
      descripcion: detalle.descripcion,
      cantidadOrdenada: lineaOrden?.cantidad ?? 0,
      cantidadAceptada: aceptadas.get(detalle.idDetalleOrden) ?? 0,
      cantidadFacturada: detalle.cantidad,
      precioOrden,
      precioFacturado: detalle.precioUnitario,
      conforme: problemas.length === 0,
      observacion: problemas.join(' ') || 'Conforme',
    };
  });

  const totalOrden = redondear(lineas.reduce((total, linea) => total + linea.cantidadFacturada * linea.precioOrden, 0));
  if (lineas.some((linea) => !linea.conforme)) {
    observaciones.push('Hay diferencias de cantidad o precio. Solicita al proveedor una factura corregida o una nota de crédito.');
  }

  return {
    fecha: new Date().toISOString(),
    conforme: lineas.length > 0 && lineas.every((linea) => linea.conforme),
    totalOrden,
    totalFacturado: factura.total,
    lineas,
    observaciones,
  };
}

function cambiarFactura(idFactura: number, cambio: (factura: Factura, compras: EstadoCompartido) => Factura, mensaje: string) {
  actualizarCompras((actual) => ({
    ...actual,
    facturas: actual.facturas.map((factura) => (factura.idFactura === idFactura ? cambio(factura, actual) : factura)),
    mensaje,
    tipoMensaje: 'exito',
  }));
}

export function validarFactura(idFactura: number): void {
  cambiarFactura(
    idFactura,
    (factura, compras) => {
      const resultado = calcularMatching(compras, factura);
      const condicion = catalogos.condicionesPagoFactura.find((item) => item.codigo === factura.condicionPago);
      return {
        ...factura,
        resultadoMatching: resultado,
        estado: resultado.conforme ? 'Validada' : 'Con inconsistencias',
        fechaVencimiento: resultado.conforme ? sumarDias(factura.fechaEmision, condicion?.dias ?? 0) : undefined,
      };
    },
    'Validación de tres vías ejecutada.',
  );
}

export function enviarAPagos(idFactura: number): void {
  cambiarFactura(
    idFactura,
    (factura) => {
      if (factura.estado !== 'Validada') throw new Error('Solo se envían a pagos facturas validadas.');
      return { ...factura, estado: 'Enviada a pagos', fechaEnvioPagos: fechaHoy() };
    },
    'Factura remitida a Gestión de Pagos y datos enviados a Contabilidad.',
  );
}

export function rechazarFactura(idFactura: number): void {
  cambiarFactura(
    idFactura,
    (factura) => ({ ...factura, estado: 'Rechazada' }),
    'Factura rechazada. Las cantidades quedan libres para registrar la factura corregida.',
  );
}
