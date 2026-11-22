/**
 * Conexión con el microservicio ms-recepcion-control.
 * Define las respuestas del backend, las llamadas y la conversión al modelo
 * que usan las pantallas. El frontend trabaja con la línea de la orden
 * (idDetalleOrden) y el backend con el producto de la orden (productoId):
 * la relación se obtiene de las líneas de la orden guardada en el almacén.
 */
import { http } from '../../../servicios/api/clienteHttp';
import { endpoints } from '../../../servicios/api/endpoints';
import type { OrdenCompra } from '../../ordenesCompra/tipos';

/* ---------- Respuestas del backend ---------- */

export interface RecepcionResumenApi {
  idRecepcion: number;
  idOrden: number;
  numeroOrden: string | null;
  proveedorId: number | null;
  fecha: string;
  documento: string;
  almacen: string | null;
  estado: string;
}

export interface LineaRecepcionApi {
  idDetalle: number;
  productoId: number;
  cantidadRecibida: number;
  cantidadAceptada: number | null;
  observacion: string | null;
}

export interface RecepcionDetalleApi extends RecepcionResumenApi {
  observacion: string | null;
  costoTransporte: number | null;
  conceptoTransporte: string | null;
  comprobanteTransporte: string | null;
  detalles: LineaRecepcionApi[];
}

export interface EntregaRegistradaApi {
  idRecepcion: number;
  idOrden: number;
  documento: string;
  estado: string;
}

export interface CostoTransporteApi {
  idRecepcion: number;
  idOrden: number;
  importe: number | null;
  concepto: string | null;
  comprobante: string | null;
}

export interface AutorizacionRecepcionApi {
  idRecepcion: number;
  estadoRecepcion: string;
  yaEstabaAutorizada: boolean;
  fechaAutorizacion: string | null;
  totalUnidadesAutorizadas: number;
  totalUnidadesExcluidas: number;
  mensaje: string | null;
}

export interface DiscrepanciaApi {
  idDiscrepancia: number;
  idDetalle: number;
  tipoDiferencia: string;
  cantidad: number;
  motivo: string;
  estado: string;
  fecha: string;
}

export interface DevolucionApi {
  idDevolucion: number;
  idDetalle: number;
  idRecepcion: number;
  productoId: number;
  cantidadDevuelta: number;
  motivo: string;
  estado: string;
  fecha: string;
}

export interface ResolucionDevolucionApi {
  idDevolucion: number;
  nuevoEstado: string;
  tipoResolucion: string;
  evidencia: string;
  mensaje: string | null;
  fechaResolucion: string;
}

export interface LineaConciliacionApi {
  productoId: number;
  cantidadSolicitada: number;
  cantidadRecibida: number;
  cantidadAceptada: number;
  diferencia: number;
  estadoLinea: string;
}

export interface ConciliacionApi {
  idRecepcion: number;
  idOrden: number;
  estadoConciliacion: string;
  tieneDiferenciasPendientes: boolean;
  mensaje: string | null;
  lineas: LineaConciliacionApi[];
}

/* ---------- Estados ---------- */

/** Estados en los que la recepción ya pasó la revisión final. */
export const ESTADOS_AUTORIZADOS = new Set(['AUTORIZADA', 'VALIDADA', 'DISPONIBLE_DESPACHO']);
/** Estados que el backend excluye de los saldos de la orden. */
export const ESTADOS_EXCLUIDOS = new Set(['ANULADA', 'CANCELADA', 'RECHAZADO_DESPACHO']);

/* ---------- Relación línea de la orden ↔ producto ---------- */

/** Línea de la orden (idDetalle) que corresponde a un producto del backend. */
export function lineaOrdenDeProducto(orden: OrdenCompra | undefined, productoId: number): number {
  return orden?.detalles.find((linea) => linea.producto.idProducto === productoId)?.idDetalle ?? productoId;
}

/** Producto del backend que corresponde a una línea de la orden. */
export function productoDeLineaOrden(orden: OrdenCompra | undefined, idDetalleOrden: number): number {
  return orden?.detalles.find((linea) => linea.idDetalle === idDetalleOrden)?.producto.idProducto ?? idDetalleOrden;
}

/** Convierte un importe en bolivianos (decimal) a centavos. */
export function aCentavos(importe: number): number {
  return Math.round(importe * 100);
}

/** Convierte centavos a un importe decimal en bolivianos. */
export function aBolivianos(centavos: number): number {
  return Math.round(centavos) / 100;
}

/* ---------- Llamadas ---------- */

export function buscarRecepciones(): Promise<RecepcionResumenApi[]> {
  return http.get<RecepcionResumenApi[]>(endpoints.recepcion.buscar);
}

export function obtenerDetalleRecepcion(idRecepcion: number): Promise<RecepcionDetalleApi> {
  return http.get<RecepcionDetalleApi>(endpoints.recepcion.detalle(idRecepcion));
}

export function registrarEntregaApi(
  idOrden: number,
  cuerpo: {
    fecha: string;
    documento: string;
    almacen: string;
    observacion?: string;
    detalles: { productoId: number; cantidadRecibida: number }[];
  },
): Promise<EntregaRegistradaApi> {
  return http.post<EntregaRegistradaApi>(endpoints.recepcion.registrarEntrega(idOrden), cuerpo);
}

export function editarRecepcionApi(
  idRecepcion: number,
  cuerpo: {
    fecha: string;
    almacen: string;
    observacion?: string;
    detalles: { idDetalle: number; productoId: number; cantidadRecibida: number }[];
  },
): Promise<unknown> {
  return http.put(endpoints.recepcion.editar(idRecepcion), cuerpo);
}

export function guardarCostoTransporteApi(
  idRecepcion: number,
  cuerpo: { importe: number; concepto: string; comprobante: string },
): Promise<CostoTransporteApi> {
  return http.put<CostoTransporteApi>(endpoints.recepcion.costoTransporte(idRecepcion), cuerpo);
}

export function registrarInspeccionApi(cuerpo: {
  idDetalle: number;
  cantidadConforme: number;
  cantidadRechazada: number;
  observacion?: string;
}): Promise<unknown> {
  return http.post(endpoints.recepcion.inspecciones, cuerpo);
}

export function confirmarAutorizacionApi(cuerpo: {
  idRecepcion: number;
  usuarioAutorizador?: string;
  observacion?: string;
}): Promise<AutorizacionRecepcionApi> {
  return http.post<AutorizacionRecepcionApi>(endpoints.recepcion.autorizar, cuerpo);
}

export function registrarDiscrepanciaApi(cuerpo: {
  idDetalle: number;
  tipoDiferencia: string;
  cantidad: number;
  motivo: string;
}): Promise<DiscrepanciaApi> {
  return http.post<DiscrepanciaApi>(endpoints.recepcion.discrepancias, cuerpo);
}

export function listarDiscrepanciasDeLinea(idDetalle: number): Promise<DiscrepanciaApi[]> {
  return http.get<DiscrepanciaApi[]>(endpoints.recepcion.discrepanciasDeDetalle(idDetalle));
}

export function registrarDevolucionApi(cuerpo: { idDetalle: number; motivo: string }): Promise<DevolucionApi> {
  return http.post<DevolucionApi>(endpoints.recepcion.devoluciones, cuerpo);
}

export function listarDevolucionesDeLinea(idDetalle: number): Promise<DevolucionApi[]> {
  return http.get<DevolucionApi[]>(endpoints.recepcion.devolucionesDeDetalle(idDetalle));
}

export function resolverDevolucionApi(cuerpo: {
  idDevolucion: number;
  tipoResolucion: 'RETIRO' | 'COMPROMISO_REPOSICION';
  evidencia: string;
  observacion?: string;
}): Promise<ResolucionDevolucionApi> {
  return http.patch<ResolucionDevolucionApi>(endpoints.recepcion.resolverDevolucion, cuerpo);
}

export function consultarConciliacionApi(idRecepcion: number, idOrden: number): Promise<ConciliacionApi> {
  return http.get<ConciliacionApi>(endpoints.recepcion.conciliacion(idRecepcion, idOrden));
}

/* ---------- Textos de discrepancias y devoluciones ---------- */

const PREFIJO_PRODUCTO = 'Producto recibido: ';

/** Motivo que se envía al servidor para una discrepancia de producto. */
export function motivoDiscrepanciaProducto(productoRecibido: string, descripcion: string): string {
  return `${PREFIJO_PRODUCTO}${productoRecibido}. ${descripcion}`;
}

/** Separa el producto recibido y la descripción de un motivo guardado. */
export function leerMotivoDiscrepanciaProducto(motivo: string): { productoRecibido: string; descripcion: string } {
  if (motivo.startsWith(PREFIJO_PRODUCTO)) {
    const resto = motivo.slice(PREFIJO_PRODUCTO.length);
    const corte = resto.indexOf('. ');
    if (corte >= 0) {
      return { productoRecibido: resto.slice(0, corte), descripcion: resto.slice(corte + 2) };
    }
    return { productoRecibido: resto, descripcion: '' };
  }
  return { productoRecibido: 'No indicado', descripcion: motivo };
}

/** Evidencia y observación que el servidor agrega al motivo al resolver una devolución. */
export function leerMotivoDevolucion(motivo: string): { evidencia?: string; observacion?: string } {
  const evidencia = /\| Respaldo: (.*?)(?: \| Obs: |$)/.exec(motivo)?.[1];
  const observacion = /\| Obs: (.*)$/.exec(motivo)?.[1];
  return { evidencia, observacion };
}

/** Nombre comprensible del tipo de discrepancia registrado en el servidor. */
export function etiquetaTipoDiferencia(tipo: string): string {
  switch (tipo) {
    case 'FALTANTE':
      return 'Faltante';
    case 'EXCESO':
      return 'Exceso';
    case 'PRODUCTO_INCORRECTO':
    case 'PRODUCTO_DISTINTO':
      return 'Producto distinto';
    case 'DIFERENCIA_CALIDAD':
      return 'Calidad';
    default:
      return tipo.charAt(0) + tipo.slice(1).toLowerCase().replace(/_/g, ' ');
  }
}
