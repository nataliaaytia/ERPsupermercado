/**
 * Conexión con el microservicio ms-ordenes-compra.
 * Convierte las respuestas del backend al modelo que usan las pantallas y
 * expone una función por cada operación del flujo de la orden.
 */
import { ErrorApi, http } from '../../../servicios/api/clienteHttp';
import { endpoints } from '../../../servicios/api/endpoints';
import { obtenerCompras } from '../../../estado/almacenCompras';
import type {
  CompromisoEntrega,
  CondicionesLogisticas,
  DetalleOrdenCompra,
  HistorialEstadoOrden,
  OrdenCompra,
} from '../tipos';

/* ---------- Respuestas del backend ---------- */

interface PaginaApi<T> {
  content: T[];
}

interface OrdenResumenApi {
  idOrden: number;
  numero: string;
  idOferta: number | null;
  proveedorId: number | null;
  fecha: string;
  estado: string;
  total: number;
}

interface DetalleOrdenApi {
  idDetalle: number;
  productoId: number;
  cantidad: number;
  precio: number;
  subtotal: number;
}

interface OrdenDetalleApi extends OrdenResumenApi {
  observacion: string | null;
  detalles: DetalleOrdenApi[];
}

interface CambioEstadoApi {
  idHistorial: number;
  estadoAnterior: string | null;
  estadoNuevo: string;
  responsable: string | null;
  fechaCambio: string;
  observacion: string | null;
}

interface HistorialApi {
  historial: CambioEstadoApi[];
}

interface CondicionesLogisticasApi {
  destinoEntrega: string;
  horarioEntrega: string;
  responsableEntrega: string;
}

export interface RespuestaConMensajeApi {
  mensaje?: string;
  idOrden: number;
  numero: string;
}

export interface ResultadoEnvioApi {
  idOrden: number;
  numero: string;
  estadoOrden: string;
  resultado: 'ACEPTADO_POR_SMTP' | 'FALLIDO' | string;
  destinatario: string | null;
  detalleError: string | null;
}

export interface ResultadoRespuestaProveedorApi {
  idOrden: number;
  numero: string;
  estadoOrden: string;
  respuesta: string;
  referencia: string;
  observacion: string | null;
  fechaRespuesta: string | null;
  yaRegistrada: boolean;
}

export interface CompromisoEntregaApi {
  idCompromiso: number;
  idOrden: number;
  idDetalle: number;
  productoId: number;
  fechaEntrega: string;
  cantidad: number;
  estado: string;
  observacion: string | null;
}

export interface CompromisoVencidoApi {
  idCompromiso: number;
  idOrden: number;
  numeroOrden: string;
  proveedorId: number | null;
  idDetalle: number;
  productoId: number;
  fechaComprometida: string;
  cantidadPendiente: number;
}

export interface SaldoDetalleApi {
  idDetalle: number;
  productoId: number;
  cantidadOrdenada: number;
  cantidadAceptada: number;
  cantidadPendiente: number;
}

interface SaldosApi {
  detalles: SaldoDetalleApi[];
}

export interface ResultadoAnulacionApi {
  idOrden: number;
  numero: string;
  estadoOrden: string;
  motivoAnulacion: string;
  fechaAnulacion: string;
}

export interface ResultadoCierreApi {
  idOrden: number;
  numero: string;
  estado: string;
  responsable: string;
  fechaCierre: string;
}

/* ---------- Conversión al modelo del frontend ---------- */

const ESTADOS: Record<string, string> = {
  BORRADOR: 'Borrador',
  PENDIENTE_APROBACION: 'Pendiente de aprobación',
  APROBADA: 'Aprobada',
  ENVIADA: 'Enviada',
  ACEPTADA_PROVEEDOR: 'Confirmada',
  RECHAZADA_PROVEEDOR: 'Rechazada',
  ANULADA: 'Anulada',
  CERRADA: 'Cerrada',
};

/** Estado del backend (BORRADOR, APROBADA...) con el nombre que muestran las pantallas. */
export function aEstadoFrontend(estado: string | null | undefined): string {
  if (!estado) return '';
  return ESTADOS[estado.toUpperCase()] ?? estado;
}

/** Nombre del producto según los catálogos de proveedores (o el maestro de productos). */
export function nombreProducto(idProducto: number): string {
  for (const proveedor of obtenerCompras().proveedores) {
    const producto = proveedor.catalogoProductos.find((item) => item.idProducto === idProducto);
    if (producto) return producto.nombre;
  }
  return `Producto ${idProducto}`;
}

/** Razón social del proveedor de una orden (por su proveedor o por la oferta de origen). */
export function nombreProveedorOrden(orden: Pick<OrdenCompra, 'proveedorId' | 'idOfertaOrigen'>): string | undefined {
  const compras = obtenerCompras();
  if (orden.proveedorId !== undefined) {
    const proveedor = compras.proveedores.find((item) => item.idProveedor === orden.proveedorId);
    if (proveedor) return proveedor.razonSocial;
  }
  return compras.ofertas.find((item) => item.idOferta === orden.idOfertaOrigen)?.proveedor?.razonSocial;
}

function aHistorial(cambio: CambioEstadoApi): HistorialEstadoOrden {
  return {
    estadoAnterior: aEstadoFrontend(cambio.estadoAnterior) || '—',
    estadoNuevo: aEstadoFrontend(cambio.estadoNuevo),
    usuario:
      !cambio.responsable || cambio.responsable === 'SIN_AUTENTICACION' ? 'Usuario no identificado' : cambio.responsable,
    fecha: cambio.fechaCambio,
    observacion: cambio.observacion ?? '',
  };
}

function aCondiciones(condiciones: CondicionesLogisticasApi | undefined): CondicionesLogisticas | undefined {
  if (!condiciones) return undefined;
  return {
    destino: condiciones.destinoEntrega ?? '',
    horario: condiciones.horarioEntrega ?? '',
    responsableEntrega: condiciones.responsableEntrega ?? '',
  };
}

export function aCompromiso(compromiso: CompromisoEntregaApi): CompromisoEntrega {
  return {
    idCompromiso: compromiso.idCompromiso,
    fechaEntrega: String(compromiso.fechaEntrega).slice(0, 10),
    cantidad: compromiso.cantidad,
    estado: compromiso.estado === 'PROGRAMADO' ? 'Programado' : compromiso.estado,
    observacion: compromiso.observacion ?? '',
  };
}

/**
 * Los envíos, la respuesta del proveedor, los compromisos y la anulación no
 * tienen consulta en el backend: se conservan los que ya estaban en el almacén
 * para la misma orden del servidor.
 */
export function conservarDatosLocales(orden: OrdenCompra, anterior: OrdenCompra | undefined): OrdenCompra {
  if (!anterior || anterior.proveedorId === undefined || anterior.numero !== orden.numero) return orden;

  return {
    ...orden,
    ...(anterior.historialEnvios ? { historialEnvios: anterior.historialEnvios } : {}),
    ...(anterior.respuestaProveedor ? { respuestaProveedor: anterior.respuestaProveedor } : {}),
    ...(anterior.anulacion ? { anulacion: anterior.anulacion } : {}),
    detalles: orden.detalles.map((detalle) => {
      const previo = anterior.detalles.find((item) => item.idDetalle === detalle.idDetalle);
      return previo?.compromisos?.length ? { ...detalle, compromisos: previo.compromisos } : detalle;
    }),
  };
}

function aOrden(
  orden: OrdenDetalleApi,
  historial: CambioEstadoApi[],
  condiciones: CondicionesLogisticasApi | undefined,
): OrdenCompra {
  const detalles: DetalleOrdenCompra[] = (orden.detalles ?? []).map((detalle) => ({
    idDetalle: detalle.idDetalle,
    producto: { idProducto: detalle.productoId, descripcion: nombreProducto(detalle.productoId) },
    cantidad: detalle.cantidad,
    precio: Number(detalle.precio),
    subtotal: Number(detalle.subtotal),
  }));

  const condicionesLogisticas = aCondiciones(condiciones);

  return {
    idOrden: orden.idOrden,
    ...(orden.idOferta != null ? { idOfertaOrigen: orden.idOferta } : {}),
    // También marca la orden como proveniente del servidor (ver conservarDatosLocales).
    proveedorId: orden.proveedorId ?? 0,
    numero: orden.numero,
    fecha: String(orden.fecha ?? '').slice(0, 10),
    estado: aEstadoFrontend(orden.estado),
    total: Number(orden.total),
    observacion: orden.observacion ?? '',
    ...(condicionesLogisticas ? { condicionesLogisticas } : {}),
    detalles,
    historialEstados: historial.map(aHistorial),
  };
}

/* ---------- Consultas ---------- */

async function consultarCondiciones(idOrden: number): Promise<CondicionesLogisticasApi | undefined> {
  try {
    return await http.get<CondicionesLogisticasApi>(endpoints.ordenes.condicionesLogisticas(idOrden));
  } catch (fallo) {
    if (fallo instanceof ErrorApi && fallo.estado === 404) return undefined;
    throw fallo;
  }
}

async function consultarHistorial(idOrden: number): Promise<CambioEstadoApi[]> {
  try {
    const respuesta = await http.get<HistorialApi>(endpoints.ordenes.historial(idOrden));
    return respuesta?.historial ?? [];
  } catch (fallo) {
    if (fallo instanceof ErrorApi && fallo.estado === 404) return [];
    throw fallo;
  }
}

async function consultarOrden(idOrden: number): Promise<OrdenCompra> {
  const [detalle, historial, condiciones] = await Promise.all([
    http.get<OrdenDetalleApi>(endpoints.ordenes.porId(idOrden)),
    consultarHistorial(idOrden),
    consultarCondiciones(idOrden),
  ]);
  return aOrden(detalle, historial, condiciones);
}

/** Todas las órdenes del servidor con sus líneas, historial y condiciones logísticas. */
export async function listarOrdenes(): Promise<OrdenCompra[]> {
  const pagina = await http.get<PaginaApi<OrdenResumenApi>>(endpoints.ordenes.buscar(0, 100));
  const ordenes = await Promise.all((pagina?.content ?? []).map((resumen) => consultarOrden(resumen.idOrden)));
  return ordenes.sort((a, b) => a.idOrden - b.idOrden);
}

export async function consultarSaldos(idOrden: number): Promise<SaldoDetalleApi[]> {
  const respuesta = await http.get<SaldosApi>(endpoints.ordenes.saldos(idOrden));
  return respuesta?.detalles ?? [];
}

export function consultarCompromisosVencidos(): Promise<CompromisoVencidoApi[]> {
  return http.get<CompromisoVencidoApi[]>(endpoints.ordenes.compromisosVencidos);
}

/* ---------- Operaciones ---------- */

export function crearDesdeOferta(idSolicitud: number, idOferta: number) {
  return http.post<RespuestaConMensajeApi>(endpoints.ordenes.desdeOferta(idSolicitud, idOferta));
}

export function editarBorrador(idOrden: number, detalles: { productoId: number; cantidad: number }[]) {
  return http.put<RespuestaConMensajeApi>(endpoints.ordenes.porId(idOrden), { detalles });
}

export function solicitarAprobacion(idOrden: number) {
  return http.post<RespuestaConMensajeApi>(endpoints.ordenes.solicitarAprobacion(idOrden));
}

/** Límite de aprobación del Jefe de Compras. */
export const LIMITE_APROBACION = 100000;

export function aprobar(idOrden: number, usuario: string) {
  return http.post<RespuestaConMensajeApi>(endpoints.ordenes.aprobar(idOrden), {
    usuario,
    rol: 'JEFE_COMPRAS',
    limiteAutorizado: LIMITE_APROBACION,
  });
}

export function devolver(idOrden: number, motivo: string) {
  return http.post<RespuestaConMensajeApi>(endpoints.ordenes.devolver(idOrden), { motivo });
}

export function guardarCondiciones(idOrden: number, datos: CondicionesLogisticas) {
  return http.put<CondicionesLogisticasApi>(endpoints.ordenes.condicionesLogisticas(idOrden), {
    destinoEntrega: datos.destino,
    horarioEntrega: datos.horario,
    responsableEntrega: datos.responsableEntrega,
  });
}

/** Envía la orden por correo. Si el correo falla (502) devuelve igualmente el resultado. */
export async function enviar(idOrden: number): Promise<ResultadoEnvioApi> {
  try {
    return await http.post<ResultadoEnvioApi>(endpoints.ordenes.enviar(idOrden));
  } catch (fallo) {
    const detalle = fallo instanceof ErrorApi ? (fallo.detalle as Partial<ResultadoEnvioApi> | undefined) : undefined;
    if (fallo instanceof ErrorApi && detalle && typeof detalle === 'object' && detalle.resultado === 'FALLIDO') {
      return detalle as ResultadoEnvioApi;
    }
    throw fallo;
  }
}

export function registrarRespuesta(
  idOrden: number,
  datos: { respuesta: 'ACEPTADA' | 'RECHAZADA'; referencia: string; observacion?: string },
) {
  return http.post<ResultadoRespuestaProveedorApi>(endpoints.ordenes.respuestaProveedor(idOrden), {
    ...datos,
    origen: 'CORREO',
  });
}

export function registrarCompromiso(
  idOrden: number,
  idDetalle: number,
  datos: { fechaEntrega: string; cantidad: number; observacion?: string },
) {
  return http.post<CompromisoEntregaApi>(endpoints.ordenes.compromisos(idOrden, idDetalle), datos);
}

export function anular(idOrden: number, motivo: string) {
  return http.post<ResultadoAnulacionApi>(endpoints.ordenes.anular(idOrden), { motivo });
}

/** Cierre coordinado por Recepción: valida saldos y devoluciones antes de cerrar la orden. */
export function cerrar(idOrden: number, responsable: string) {
  return http.post<ResultadoCierreApi>(endpoints.recepcion.cerrarOrden(idOrden), { responsable });
}

/* ---------- Sesión ---------- */

export interface UsuarioActual {
  usuario: string;
  nombre: string;
  rol: string;
}

/** Usuario con sesión iniciada (se lee del almacenamiento de la sesión). */
export function usuarioActual(): UsuarioActual {
  try {
    const guardado = localStorage.getItem('erp-sesion');
    const datos = guardado ? (JSON.parse(guardado) as Partial<UsuarioActual>) : {};
    return {
      usuario: datos.usuario ?? '',
      nombre: datos.nombre ?? datos.usuario ?? '',
      rol: datos.rol ?? '',
    };
  } catch {
    return { usuario: '', nombre: '', rol: '' };
  }
}

/** Texto de error para mostrar al usuario. */
export function mensajeDeError(fallo: unknown, alternativo: string): string {
  return fallo instanceof Error && fallo.message ? fallo.message : alternativo;
}
