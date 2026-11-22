/**
 * Sincroniza recepciones, inspecciones y autorizaciones con su microservicio
 * cuando la conexión está activa.
 */
import { actualizarCompras, obtenerCompras } from '../../../estado/almacenCompras';
import { conexion } from '../../../servicios/api/configuracion';
import type { OrdenCompra, RecepcionValidada } from '../../ordenesCompra/tipos';
import type { ResolucionDevolucion } from '../tipos/devolucion';
import type { Discrepancia } from '../tipos/discrepancia';
import type { InspeccionCalidadRecepcion } from '../tipos/inspeccion';
import type { RecepcionRegistrada } from '../tipos/recepcion';
import {
  aCentavos,
  buscarRecepciones,
  ESTADOS_AUTORIZADOS,
  ESTADOS_EXCLUIDOS,
  leerMotivoDevolucion,
  leerMotivoDiscrepanciaProducto,
  lineaOrdenDeProducto,
  listarDevolucionesDeLinea,
  listarDiscrepanciasDeLinea,
  obtenerDetalleRecepcion,
  type DevolucionApi,
  type DiscrepanciaApi,
  type RecepcionDetalleApi,
} from './recepcionApi';

/** Clave de la devolución en pantalla (la misma que en datos de prueba). */
export function claveDevolucion(idRecepcion: number, idDetalleOrden: number): string {
  return `DEV-${idRecepcion}-${idDetalleOrden}`;
}

/** Consulta sin interrumpir la carga si falla (devuelve el valor por defecto). */
async function opcional<T>(consulta: Promise<T>, porDefecto: T): Promise<T> {
  try {
    return await consulta;
  } catch {
    return porDefecto;
  }
}

function aRecepcion(detalle: RecepcionDetalleApi, orden: OrdenCompra | undefined): RecepcionRegistrada {
  const costo =
    detalle.costoTransporte !== null && detalle.conceptoTransporte && detalle.comprobanteTransporte
      ? {
          importeCentavos: aCentavos(Number(detalle.costoTransporte)),
          concepto: detalle.conceptoTransporte,
          comprobante: detalle.comprobanteTransporte,
        }
      : undefined;

  return {
    idRecepcion: detalle.idRecepcion,
    idOrden: detalle.idOrden,
    fecha: detalle.fecha,
    documento: detalle.documento,
    estado: 'Pendiente de inspección',
    detalles: detalle.detalles.map((linea) => ({
      idDetalleOrden: lineaOrdenDeProducto(orden, linea.productoId),
      cantidadRecibida: linea.cantidadRecibida,
      idDetalleRecepcion: linea.idDetalle,
      productoId: linea.productoId,
    })),
    ...(costo ? { costoTransporte: costo } : {}),
    ...(detalle.almacen ? { almacen: detalle.almacen } : {}),
    ...(detalle.observacion ? { observacion: detalle.observacion } : {}),
    estadoServidor: detalle.estado,
  };
}

/**
 * El backend no expone las inspecciones: se deducen de la cantidad aceptada de
 * cada línea. Si en esta sesión ya se registró la inspección (con sus motivos)
 * y coincide con el servidor, se conserva la registrada.
 */
function aInspeccion(
  detalle: RecepcionDetalleApi,
  recepcion: RecepcionRegistrada,
  anteriores: readonly InspeccionCalidadRecepcion[],
): InspeccionCalidadRecepcion | undefined {
  const lineas = detalle.detalles.map((linea, indice) => ({
    idDetalleOrden: recepcion.detalles[indice].idDetalleOrden,
    cantidadRecibida: linea.cantidadRecibida,
    cantidadConforme: Math.min(linea.cantidadRecibida, Math.max(0, linea.cantidadAceptada ?? 0)),
  }));

  const anterior = anteriores.find(
    (item) => item.idRecepcion === recepcion.idRecepcion && item.idOrden === recepcion.idOrden,
  );
  const anteriorCoincide =
    anterior !== undefined &&
    anterior.detalles.length === lineas.length &&
    lineas.every((linea) =>
      anterior.detalles.some(
        (registrada) =>
          registrada.idDetalleOrden === linea.idDetalleOrden &&
          registrada.cantidadRecibida === linea.cantidadRecibida &&
          registrada.cantidadConforme === linea.cantidadConforme,
      ),
    );
  if (anterior && anteriorCoincide) return anterior;

  const inspeccionada =
    ESTADOS_AUTORIZADOS.has(detalle.estado) || detalle.detalles.some((linea) => (linea.cantidadAceptada ?? 0) > 0);
  if (!inspeccionada || lineas.length === 0) return undefined;

  return {
    idInspeccion: recepcion.idRecepcion,
    idRecepcion: recepcion.idRecepcion,
    idOrden: recepcion.idOrden,
    fechaInspeccion: `${detalle.fecha}T00:00:00`,
    detalles: lineas.map((linea, indice) => {
      const cantidadRechazada = linea.cantidadRecibida - linea.cantidadConforme;
      const observacion = detalle.detalles[indice].observacion;
      return {
        ...linea,
        cantidadRechazada,
        ...(cantidadRechazada > 0 && observacion ? { motivoRechazo: observacion } : {}),
      };
    }),
  };
}

function aDiscrepancia(item: DiscrepanciaApi, recepcion: RecepcionRegistrada, idDetalleOrden: number): Discrepancia {
  const base = {
    idDiscrepancia: item.idDiscrepancia,
    idRecepcion: recepcion.idRecepcion,
    idOrden: recepcion.idOrden,
    idDetalleOrden,
    fechaRegistro: `${item.fecha}T00:00:00`,
    tipoDiferencia: item.tipoDiferencia,
    estado: item.estado,
  };
  if (item.tipoDiferencia === 'PRODUCTO_INCORRECTO' || item.tipoDiferencia === 'PRODUCTO_DISTINTO') {
    const { productoRecibido, descripcion } = leerMotivoDiscrepanciaProducto(item.motivo);
    return { ...base, tipo: 'producto', productoRecibido, descripcion, cantidadDiscrepante: item.cantidad };
  }
  return {
    ...base,
    tipo: 'cantidad',
    cantidadDiscrepante: item.cantidad,
    descripcion: item.motivo,
    ...(item.tipoDiferencia === 'FALTANTE' ? { sentido: 'faltante' as const } : {}),
    ...(item.tipoDiferencia === 'EXCESO' ? { sentido: 'exceso' as const } : {}),
  };
}

function aResolucion(
  item: DevolucionApi,
  clave: string,
  anteriores: readonly ResolucionDevolucion[],
): ResolucionDevolucion | undefined {
  if (item.estado !== 'RETIRADA' && item.estado !== 'COMPROMISO_REPOSICION') return undefined;
  const anterior = anteriores.find((resolucion) => resolucion.idDevolucion === clave);
  const { evidencia, observacion } = leerMotivoDevolucion(item.motivo);
  const tipo = item.estado === 'RETIRADA' ? 'retiro' : 'reposicion';
  const detalleCompromiso = anterior?.detalleCompromiso ?? observacion;
  return {
    idDevolucion: clave,
    tipo,
    evidencia: evidencia ?? anterior?.evidencia ?? 'Registrada en el sistema',
    fechaRegistro: anterior?.fechaRegistro ?? `${item.fecha}T00:00:00`,
    ...(tipo === 'reposicion' && detalleCompromiso ? { detalleCompromiso } : {}),
  };
}

/** Reemplaza los datos del almacén por los del microservicio. */
export async function cargarRecepcionesDesdeApi(): Promise<void> {
  if (!conexion.recepcion) return;

  const resumen = await buscarRecepciones();
  const vigentes = resumen.filter((item) => !ESTADOS_EXCLUIDOS.has(item.estado));
  const detalles = await Promise.all(vigentes.map((item) => obtenerDetalleRecepcion(item.idRecepcion)));

  const compras = obtenerCompras();
  const recepcionesRegistradas: RecepcionRegistrada[] = [];
  const inspeccionesCalidad: InspeccionCalidadRecepcion[] = [];
  const recepcionesValidadas: RecepcionValidada[] = [];
  const discrepancias: Discrepancia[] = [];
  const resolucionesDevoluciones: ResolucionDevolucion[] = [];

  await Promise.all(
    detalles.map(async (detalle) => {
      const orden = compras.ordenes.find((item) => item.idOrden === detalle.idOrden);
      const recepcion = aRecepcion(detalle, orden);
      const inspeccion = aInspeccion(detalle, recepcion, compras.inspeccionesCalidad);
      const autorizada = ESTADOS_AUTORIZADOS.has(detalle.estado);

      recepcion.estado = autorizada ? 'Validada' : inspeccion ? 'En inspección' : 'Pendiente de inspección';
      recepcionesRegistradas.push(recepcion);
      if (inspeccion) inspeccionesCalidad.push(inspeccion);

      if (autorizada) {
        recepcionesValidadas.push({
          idRecepcion: recepcion.idRecepcion,
          idOrden: recepcion.idOrden,
          estado: 'Validada',
          detalles: detalle.detalles.map((linea, indice) => ({
            idDetalleOrden: recepcion.detalles[indice].idDetalleOrden,
            cantidadRecibida: linea.cantidadRecibida,
            cantidadAceptada: Math.min(linea.cantidadRecibida, Math.max(0, linea.cantidadAceptada ?? 0)),
          })),
        });
      }

      await Promise.all(
        detalle.detalles.map(async (linea, indice) => {
          const idDetalleOrden = recepcion.detalles[indice].idDetalleOrden;
          const [diferencias, devoluciones] = await Promise.all([
            opcional(listarDiscrepanciasDeLinea(linea.idDetalle), []),
            autorizada && linea.cantidadRecibida > (linea.cantidadAceptada ?? 0)
              ? opcional(listarDevolucionesDeLinea(linea.idDetalle), [])
              : Promise.resolve([]),
          ]);
          diferencias.forEach((item) => discrepancias.push(aDiscrepancia(item, recepcion, idDetalleOrden)));
          devoluciones.forEach((item) => {
            const resolucion = aResolucion(
              item,
              claveDevolucion(recepcion.idRecepcion, idDetalleOrden),
              compras.resolucionesDevoluciones,
            );
            if (resolucion) resolucionesDevoluciones.push(resolucion);
          });
        }),
      );
    }),
  );

  const porId = (a: { idRecepcion: number }, b: { idRecepcion: number }) => a.idRecepcion - b.idRecepcion;
  actualizarCompras((actual) => ({
    ...actual,
    recepcionesRegistradas: recepcionesRegistradas.sort(porId),
    inspeccionesCalidad: inspeccionesCalidad.sort(porId),
    recepcionesValidadas: recepcionesValidadas.sort(porId),
    discrepancias: discrepancias.sort((a, b) => a.idDiscrepancia - b.idDiscrepancia),
    resolucionesDevoluciones,
  }));
}
