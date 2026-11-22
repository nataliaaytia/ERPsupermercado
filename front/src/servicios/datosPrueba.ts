/**
 * Punto ÚNICO de lectura de los datos de prueba (carpeta src/data).
 *
 * Ninguna pantalla importa archivos de /data directamente: todo pasa por aquí.
 * Cuando el backend esté listo, basta con reemplazar estas funciones por
 * llamadas a la API (ver servicios/api) sin tocar los componentes.
 *
 * Las fechas de los JSON están escritas respecto a FECHA_REFERENCIA y se
 * desplazan al día de hoy al cargarlas, para que los plazos, vencimientos y
 * validez de ofertas sigan siendo coherentes sin importar cuándo se ejecute.
 */
import alertasInventarioJson from '../data/alertasInventario.json';
import catalogosJson from '../data/catalogos.json';
import eventosContabilidadJson from '../data/eventosContabilidad.json';
import facturasJson from '../data/facturas.json';
import frecuenciaMensualJson from '../data/frecuenciaMensual.json';
import metricasProveedoresJson from '../data/metricasProveedores.json';
import ofertasJson from '../data/ofertas.json';
import ordenesCompraJson from '../data/ordenesCompra.json';
import productosJson from '../data/productos.json';
import recepcionesJson from '../data/recepciones.json';
import proveedoresJson from '../data/proveedores.json';
import requisicionesJson from '../data/requisiciones.json';
import solicitudesJson from '../data/solicitudesCotizacion.json';
import usuariosJson from '../data/usuarios.json';

import type { Factura } from '../modulos/facturacion/tipos';
import type { OrdenCompra, RecepcionValidada } from '../modulos/ordenesCompra/tipos';
import type { EventoOrdenCompraConfirmada } from '../modulos/ordenesCompra/tipos/eventoContabilidad';
import type { InspeccionCalidadRecepcion } from '../modulos/recepcion/tipos/inspeccion';
import type { RecepcionRegistrada } from '../modulos/recepcion/tipos/recepcion';
import type { ProductoCatalogo, Proveedor } from '../modulos/proveedores/tipos';
import type { OfertaProveedor, Requisicion, SolicitudCotizacion } from '../modulos/requisiciones/tipos';
import type { AlertaReposicion } from '../modulos/requisiciones/tipos/alertasInventario';
import type { Usuario } from '../contexto/tiposSesion';

export const FECHA_REFERENCIA = '2026-11-21';

const MS_POR_DIA = 86_400_000;
const PATRON_FECHA = /^(\d{4}-\d{2}-\d{2})(T.*)?$/;

function diasDesdeReferencia(): number {
  const hoy = new Date();
  const hoyUtc = Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  return Math.round((hoyUtc - Date.parse(`${FECHA_REFERENCIA}T00:00:00Z`)) / MS_POR_DIA);
}

function desplazarFecha(texto: string, dias: number): string {
  const coincidencia = PATRON_FECHA.exec(texto);
  if (!coincidencia) return texto;
  const fecha = new Date(`${coincidencia[1]}T00:00:00Z`);
  fecha.setUTCDate(fecha.getUTCDate() + dias);
  return fecha.toISOString().slice(0, 10) + (coincidencia[2] ?? '');
}

/** Copia profunda que desplaza todas las cadenas con formato de fecha. */
function conFechasActuales<T>(valor: T, dias = diasDesdeReferencia()): T {
  if (typeof valor === 'string') return desplazarFecha(valor, dias) as T;
  if (Array.isArray(valor)) return valor.map((item) => conFechasActuales(item, dias)) as T;
  if (valor && typeof valor === 'object') {
    return Object.fromEntries(
      Object.entries(valor).map(([clave, item]) => [clave, conFechasActuales(item, dias)]),
    ) as T;
  }
  return valor;
}

/* ------------------------------------------------------------------ */
/* Proveedores y catálogo                                               */
/* ------------------------------------------------------------------ */

export interface ProductoMaestro {
  idProducto: number;
  sku: string;
  nombre: string;
  categoria: string;
  descripcion: string;
  unidadMedida: string;
}

export const obtenerProductos = (): ProductoMaestro[] => structuredClone(productosJson);

/** Une cada proveedor con los datos maestros de los productos de su catálogo. */
export function obtenerProveedores(): Proveedor[] {
  const productos = new Map(obtenerProductos().map((p) => [p.idProducto, p]));

  return conFechasActuales(proveedoresJson).map(({ catalogo, ...proveedor }) => ({
    ...proveedor,
    estado: proveedor.estado as Proveedor['estado'],
    documentos: proveedor.documentos.map((documento) => ({
      ...documento,
      estadoValidacion: documento.estadoValidacion as Proveedor['documentos'][number]['estadoValidacion'],
    })),
    catalogoProductos: catalogo.map((item): ProductoCatalogo => {
      const maestro = productos.get(item.idProducto);
      if (!maestro) throw new Error(`Producto ${item.idProducto} no existe en productos.json`);
      return {
        idProducto: maestro.idProducto,
        sku: maestro.sku,
        nombre: maestro.nombre,
        categoria: maestro.categoria,
        descripcion: maestro.descripcion,
        unidadMedida: maestro.unidadMedida,
        precioPactado: item.precioPactado,
        tiempoEntregaEstimado: item.tiempoEntregaEstimado,
        stockDisponible: item.stockDisponible,
      };
    }),
  }));
}

export interface MetricaProveedor {
  idProveedor: number;
  porcentajeAceptados: number;
  porcentajeEntregasCompletas: number;
}

export const obtenerMetricasProveedores = (): MetricaProveedor[] =>
  structuredClone(metricasProveedoresJson);

export interface FrecuenciaMensual {
  mes: string;
  ordenes: number;
  monto: number;
}

export const obtenerFrecuenciaMensual = (): FrecuenciaMensual[] =>
  structuredClone(frecuenciaMensualJson);

/* ------------------------------------------------------------------ */
/* Requisiciones y cotizaciones                                         */
/* ------------------------------------------------------------------ */

export const obtenerRequisiciones = (): Requisicion[] =>
  conFechasActuales(requisicionesJson) as Requisicion[];

export const obtenerSolicitudesCotizacion = (): SolicitudCotizacion[] =>
  conFechasActuales(solicitudesJson) as SolicitudCotizacion[];

export const obtenerOfertas = (): OfertaProveedor[] =>
  conFechasActuales(ofertasJson) as OfertaProveedor[];

export const obtenerAlertasInventario = (): AlertaReposicion[] =>
  conFechasActuales(alertasInventarioJson);

/* ------------------------------------------------------------------ */
/* Órdenes, facturas, usuarios y catálogos                              */
/* ------------------------------------------------------------------ */

export const obtenerOrdenesCompra = (): OrdenCompra[] =>
  conFechasActuales(ordenesCompraJson) as OrdenCompra[];

/** Eventos de órdenes confirmadas pendientes de enviar a Contabilidad. */
export const obtenerEventosContabilidad = (): EventoOrdenCompraConfirmada[] =>
  conFechasActuales(eventosContabilidadJson) as EventoOrdenCompraConfirmada[];

export interface DatosRecepcionesPrueba {
  recepcionesRegistradas: RecepcionRegistrada[];
  inspeccionesCalidad: InspeccionCalidadRecepcion[];
  recepcionesValidadas: RecepcionValidada[];
}

/** Entregas ya registradas, inspeccionadas y validadas (OC-0001 parcial). */
export const obtenerRecepciones = (): DatosRecepcionesPrueba =>
  conFechasActuales(recepcionesJson) as DatosRecepcionesPrueba;

export const obtenerFacturas = (): Factura[] =>
  conFechasActuales(facturasJson) as Factura[];

export const obtenerUsuarios = (): Usuario[] => structuredClone(usuariosJson);

export type Catalogos = typeof catalogosJson;

export const catalogos: Catalogos = catalogosJson;
