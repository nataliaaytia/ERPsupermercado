/**
 * Conexión con el microservicio ms-cotizaciones-requisiciones.
 * Convierte las respuestas del backend al modelo que usan las pantallas
 * (requisiciones, solicitudes de cotización y ofertas).
 */
import { http } from '../../../servicios/api/clienteHttp';
import { endpoints } from '../../../servicios/api/endpoints';
import { obtenerCompras } from '../../../estado/almacenCompras';
import { codigoRequisicion } from './formatoRequisicion';
import type {
  EstadoRequisicion,
  OfertaProveedor,
  Prioridad,
  ProveedorReferencia,
  RegistroHistorialRequisicion,
  Requisicion,
  SolicitudCotizacion,
} from '../tipos';

/* ---------- Respuestas del backend ---------- */

type PrioridadApi = 'ALTA' | 'MEDIA' | 'BAJA';

interface DetalleRequisicionApi {
  idDetalle: number;
  productoId: number;
  cantidad: number;
  observacion: string | null;
}

export interface RequisicionApi {
  idRequisicion: number;
  fecha: string;
  prioridad: PrioridadApi;
  estado: string;
  solicitante: string;
  observacion: string | null;
  detalles: DetalleRequisicionApi[] | null;
}

interface HistorialApi {
  idHistorial: number;
  idRequisicion: number;
  tipoCambio: string;
  valorAnterior: string | null;
  valorNuevo: string | null;
  fechaCambio: string;
}

export interface SolicitudApi {
  idSolicitud: number;
  idRequisicion: number | null;
  fecha: string;
  fechaLimite: string;
  estado: string;
  idConsolidacion: number | null;
  idsRequisicionesConsolidadas: number[] | null;
  productosConsolidados: { productoId: number; cantidad: number }[] | null;
}

interface DetalleOfertaApi {
  idDetalle: number;
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  plazoEntrega: number;
}

interface OfertaApi {
  idOferta: number;
  proveedorId: number;
  fecha: string;
  validez: string;
  estado: string;
  totalOferta: number;
  detalles: DetalleOfertaApi[] | null;
}

interface EvaluacionApi {
  ofertas: OfertaApi[] | null;
}

/** Respuesta típica de las operaciones: siempre trae un mensaje para el usuario. */
export interface RespuestaOperacion {
  mensaje?: string;
}

/* ---------- Cuerpos que espera el backend ---------- */

export interface CuerpoRequisicion {
  fecha: string;
  prioridad: PrioridadApi;
  solicitante: string;
  observacion?: string;
  detalles: { productoId: number; cantidad: number; observacion?: string }[];
}

export interface DetalleOfertaCuerpo {
  productoId: number;
  cantidad: number;
  precio: number;
  plazoEntrega: number;
}

/* ---------- Conversión al modelo del frontend ---------- */

/** Las requisiciones agrupadas se muestran con este identificador (no existen como tales en el backend). */
export const BASE_ID_CONSOLIDACION = 100000;

export const esRequisicionConsolidada = (idRequisicion: number) => idRequisicion >= BASE_ID_CONSOLIDACION;

const prioridades: Record<PrioridadApi, Prioridad> = { ALTA: 'Alta', MEDIA: 'Media', BAJA: 'Baja' };

export const aPrioridadApi = (prioridad: Prioridad): PrioridadApi =>
  prioridad === 'Alta' ? 'ALTA' : prioridad === 'Baja' ? 'BAJA' : 'MEDIA';

const aPrioridad = (prioridad: string): Prioridad => prioridades[prioridad as PrioridadApi] ?? 'Media';

const estadosRequisicion: Record<string, EstadoRequisicion> = {
  PENDIENTE: 'Pendiente',
  APROBADA: 'Aprobada',
  RECHAZADA: 'Anulada',
  ANULADA: 'Cancelada',
};

const estadosSolicitud: Record<string, SolicitudCotizacion['estado']> = {
  GENERADA: 'Generada',
  ENVIADA: 'Enviada',
  CERRADA: 'Cerrada',
};

const estadosOferta: Record<string, OfertaProveedor['estado']> = {
  REGISTRADA: 'Registrada',
  SELECCIONADA: 'Seleccionada',
  RECHAZADA: 'Rechazada',
};

const soloFecha = (fecha: string | null | undefined) => (fecha ?? '').slice(0, 10);

/** Nombres de producto, tomados del catálogo de proveedores. */
export function nombresDeProductos(): Map<number, string> {
  const nombres = new Map<number, string>();
  for (const proveedor of obtenerCompras().proveedores) {
    for (const producto of proveedor.catalogoProductos) nombres.set(producto.idProducto, producto.nombre);
  }
  return nombres;
}

const nombreProducto = (nombres: Map<number, string>, id: number) => nombres.get(id) ?? `Producto ${id}`;

function referenciaProveedor(idProveedor: number): ProveedorReferencia {
  const proveedor = obtenerCompras().proveedores.find((item) => item.idProveedor === idProveedor);
  return proveedor
    ? {
        idProveedor,
        razonSocial: proveedor.razonSocial,
        nitRuc: proveedor.nitRuc,
        estado: proveedor.estado,
      }
    : { idProveedor, razonSocial: `Proveedor ${idProveedor}`, nitRuc: '', estado: '' };
}

const camposHistorial: Record<string, string> = {
  CREACION: 'Registro',
  ESTADO: 'Estado',
  PRIORIDAD: 'Prioridad',
  SOLICITANTE: 'Solicitante',
  OBSERVACION: 'Motivo',
  FECHA: 'Fecha',
  DETALLES: 'Productos',
};

const accionesHistorial: Record<string, string> = {
  CREACION: 'Registro de requisición',
  ESTADO: 'Cambio de estado',
  PRIORIDAD: 'Cambio de prioridad',
  DETALLES: 'Edición de requisición',
};

function valorHistorial(tipo: string, valor: string | null): string {
  if (!valor) return '—';
  if (tipo === 'ESTADO') return estadosRequisicion[valor] ?? valor;
  if (tipo === 'PRIORIDAD') return prioridades[valor as PrioridadApi] ?? valor;
  return valor;
}

/** Agrupa en un solo registro los cambios guardados en el mismo momento (por ejemplo, una edición). */
function aHistorial(registros: HistorialApi[]): RegistroHistorialRequisicion[] {
  const ordenados = [...registros].sort(
    (a, b) => a.fechaCambio.localeCompare(b.fechaCambio) || a.idHistorial - b.idHistorial,
  );
  const grupos: HistorialApi[][] = [];
  for (const registro of ordenados) {
    const ultimo = grupos[grupos.length - 1];
    if (ultimo && ultimo[0].fechaCambio.slice(0, 19) === registro.fechaCambio.slice(0, 19)) ultimo.push(registro);
    else grupos.push([registro]);
  }
  return grupos.map((grupo) => {
    const tipos = new Set(grupo.map((registro) => registro.tipoCambio));
    const accion = tipos.has('CREACION')
      ? accionesHistorial.CREACION
      : tipos.size === 1
        ? (accionesHistorial[grupo[0].tipoCambio] ?? 'Edición de requisición')
        : 'Edición de requisición';
    return {
      idRegistro: grupo[0].idHistorial,
      fecha: grupo[0].fechaCambio,
      accion,
      cambios: grupo.map((registro) => ({
        campo: camposHistorial[registro.tipoCambio] ?? registro.tipoCambio,
        anterior: valorHistorial(registro.tipoCambio, registro.valorAnterior),
        actual: valorHistorial(registro.tipoCambio, registro.valorNuevo),
      })),
    };
  });
}

function aRequisicion(
  requisicion: RequisicionApi,
  nombres: Map<number, string>,
  historial: HistorialApi[],
): Requisicion {
  return {
    idRequisicion: requisicion.idRequisicion,
    fecha: soloFecha(requisicion.fecha),
    prioridad: aPrioridad(requisicion.prioridad),
    estado: estadosRequisicion[requisicion.estado] ?? 'Pendiente',
    solicitante: requisicion.solicitante ?? '',
    observacion: requisicion.observacion ?? '',
    detalles: (requisicion.detalles ?? []).map((detalle) => ({
      idDetalle: detalle.idDetalle,
      producto: { idProducto: detalle.productoId, descripcion: nombreProducto(nombres, detalle.productoId) },
      cantidad: detalle.cantidad,
      observacion: detalle.observacion ?? '',
    })),
    historial: aHistorial(historial),
  };
}

const pesoPrioridad: Record<Prioridad, number> = { Baja: 1, Media: 2, Alta: 3 };

/** Requisición de solo lectura que representa una consolidación (agrupa varias requisiciones). */
function requisicionConsolidada(
  solicitud: SolicitudApi,
  requisiciones: Requisicion[],
  nombres: Map<number, string>,
): Requisicion {
  const origen = solicitud.idsRequisicionesConsolidadas ?? [];
  const prioridad = requisiciones
    .filter((requisicion) => origen.includes(requisicion.idRequisicion))
    .reduce<Prioridad>(
      (maxima, requisicion) => (pesoPrioridad[requisicion.prioridad] > pesoPrioridad[maxima] ? requisicion.prioridad : maxima),
      'Baja',
    );
  return {
    idRequisicion: BASE_ID_CONSOLIDACION + (solicitud.idConsolidacion ?? solicitud.idSolicitud),
    fecha: soloFecha(solicitud.fecha),
    prioridad,
    estado: 'Aprobada',
    solicitante: 'Consolidación de requisiciones',
    observacion: origen.length
      ? `Agrupa las requisiciones ${origen.map(codigoRequisicion).join(', ')}.`
      : 'Requisiciones agrupadas para una sola cotización.',
    detalles: (solicitud.productosConsolidados ?? []).map((producto, indice) => ({
      idDetalle: indice + 1,
      producto: { idProducto: producto.productoId, descripcion: nombreProducto(nombres, producto.productoId) },
      cantidad: producto.cantidad,
      observacion: '',
    })),
  };
}

function aSolicitud(solicitud: SolicitudApi, proveedoresIds: number[]): SolicitudCotizacion {
  return {
    idSolicitud: solicitud.idSolicitud,
    requisicion:
      solicitud.idRequisicion ?? BASE_ID_CONSOLIDACION + (solicitud.idConsolidacion ?? solicitud.idSolicitud),
    fecha: soloFecha(solicitud.fecha),
    fechaLimite: soloFecha(solicitud.fechaLimite),
    estado: estadosSolicitud[solicitud.estado] ?? 'Generada',
    proveedoresIds: [...new Set(proveedoresIds)],
  };
}

function aOferta(oferta: OfertaApi, idSolicitud: number, nombres: Map<number, string>): OfertaProveedor {
  return {
    idOferta: oferta.idOferta,
    proveedor: referenciaProveedor(oferta.proveedorId),
    solicitud: idSolicitud,
    fecha: soloFecha(oferta.fecha),
    validez: soloFecha(oferta.validez),
    estado: estadosOferta[oferta.estado] ?? 'Registrada',
    // El sistema no guarda descuento ni condiciones de entrega.
    descuento: 0,
    condicionesEntrega: '',
    detalles: (oferta.detalles ?? []).map((detalle) => ({
      idDetalle: detalle.idDetalle,
      producto: { idProducto: detalle.productoId, descripcion: nombreProducto(nombres, detalle.productoId) },
      precio: detalle.precioUnitario,
      plazoEntrega: detalle.plazoEntrega,
    })),
  };
}

/* ---------- Lectura ---------- */

export interface DatosCotizaciones {
  requisiciones: Requisicion[];
  solicitudes: SolicitudCotizacion[];
  ofertas: OfertaProveedor[];
}

/** Lee requisiciones, solicitudes (con sus proveedores) y ofertas, ya convertidas al modelo de pantalla. */
export async function leerCotizaciones(): Promise<DatosCotizaciones> {
  const [requisicionesApi, solicitudesApi] = await Promise.all([
    http.get<RequisicionApi[]>(endpoints.requisiciones.listar),
    http.get<SolicitudApi[]>(endpoints.cotizaciones.solicitudes),
  ]);

  const [historiales, proveedoresPorSolicitud, ofertasPorSolicitud] = await Promise.all([
    // El historial es complementario: si falla, la requisición se muestra sin él.
    Promise.all(
      requisicionesApi.map((requisicion) =>
        http.get<HistorialApi[]>(endpoints.requisiciones.historial(requisicion.idRequisicion)).catch(() => []),
      ),
    ),
    Promise.all(
      solicitudesApi.map((solicitud) => http.get<number[]>(endpoints.cotizaciones.proveedores(solicitud.idSolicitud))),
    ),
    Promise.all(
      solicitudesApi.map((solicitud) => http.get<EvaluacionApi>(endpoints.cotizaciones.evaluacion(solicitud.idSolicitud))),
    ),
  ]);

  const nombres = nombresDeProductos();
  const requisiciones = requisicionesApi
    .map((requisicion, indice) => aRequisicion(requisicion, nombres, historiales[indice] ?? []))
    .sort((a, b) => a.idRequisicion - b.idRequisicion);

  const consolidadas = new Map<number, Requisicion>();
  for (const solicitud of solicitudesApi) {
    if (solicitud.idRequisicion !== null) continue;
    const sintetica = requisicionConsolidada(solicitud, requisiciones, nombres);
    consolidadas.set(sintetica.idRequisicion, sintetica);
  }

  const solicitudes = solicitudesApi
    .map((solicitud, indice) => aSolicitud(solicitud, proveedoresPorSolicitud[indice] ?? []))
    .sort((a, b) => a.idSolicitud - b.idSolicitud);

  const ofertas = solicitudesApi
    .flatMap((solicitud, indice) =>
      (ofertasPorSolicitud[indice]?.ofertas ?? []).map((oferta) => aOferta(oferta, solicitud.idSolicitud, nombres)),
    )
    .sort((a, b) => a.idOferta - b.idOferta);

  return { requisiciones: [...requisiciones, ...consolidadas.values()], solicitudes, ofertas };
}

/* ---------- Operaciones ---------- */

export const crearRequisicion = (cuerpo: CuerpoRequisicion) =>
  http.post<RespuestaOperacion>(endpoints.requisiciones.crear, cuerpo);

export const modificarRequisicion = (id: number, cuerpo: CuerpoRequisicion) =>
  http.put<RespuestaOperacion>(endpoints.requisiciones.porId(id), cuerpo);

export const cambiarPrioridad = (id: number, prioridad: Prioridad) =>
  http.put<RespuestaOperacion>(endpoints.requisiciones.prioridad(id), { prioridad: aPrioridadApi(prioridad) });

export const aprobarRequisicion = (id: number) => http.put<RespuestaOperacion>(endpoints.requisiciones.aprobar(id));

export const rechazarRequisicion = (id: number) => http.put<RespuestaOperacion>(endpoints.requisiciones.rechazar(id));

export const cancelarRequisicion = (id: number) => http.put<RespuestaOperacion>(endpoints.requisiciones.cancelar(id));

export const consolidarRequisiciones = (idsRequisiciones: number[], fechaLimite: string) =>
  http.post<RespuestaOperacion>(endpoints.requisiciones.consolidar, {
    idsRequisiciones,
    fechaLimite,
  });

export const generarSolicitud = (idRequisicion: number, fechaLimite: string) =>
  http.post<RespuestaOperacion>(endpoints.cotizaciones.solicitudes, { idRequisicion, fechaLimite });

export const asociarProveedores = (idSolicitud: number, proveedoresIds: number[]) =>
  http.post<RespuestaOperacion>(endpoints.cotizaciones.proveedores(idSolicitud), { proveedoresIds });

export const cerrarSolicitud = (idSolicitud: number) =>
  http.patch<RespuestaOperacion>(endpoints.cotizaciones.cerrar(idSolicitud));

export const registrarOferta = (cuerpo: {
  proveedorId: number;
  idSolicitud: number;
  validez: string;
  detalles: DetalleOfertaCuerpo[];
}) => http.post<RespuestaOperacion>(endpoints.cotizaciones.ofertas, cuerpo);

export const modificarOferta = (idOferta: number, validez: string, detalles: DetalleOfertaCuerpo[]) =>
  http.put<RespuestaOperacion>(endpoints.cotizaciones.oferta(idOferta), { validez, detalles });

export const adjudicarOferta = (idOferta: number) =>
  http.put<RespuestaOperacion>(endpoints.cotizaciones.adjudicar(idOferta));
