import { useSyncExternalStore } from 'react';
import type { DatosRequisicion, ProductoReferencia } from '../modulos/requisiciones/tipos';
import type { AccionCompras } from '../modulos/requisiciones/servicios/modeloCompras';
import { despacharCotizacionesApi } from '../modulos/requisiciones/servicios/despachoCotizaciones';
import { conexion } from '../servicios/api/configuracion';
import type { Proveedor } from '../modulos/proveedores/tipos';
import { despacharCompras, obtenerCompras, suscribirCompras } from './almacenCompras';
import { fechaHoy } from '../utilidades/fechas';

export { fechaHoy } from '../utilidades/fechas';

/** Productos únicos de todos los catálogos de proveedores. */
export function productosDelCatalogo(proveedores: Proveedor[]): ProductoReferencia[] {
  const unicos = new Map<number, ProductoReferencia>();
  for (const proveedor of proveedores) {
    for (const producto of proveedor.catalogoProductos) {
      unicos.set(producto.idProducto, { idProducto: producto.idProducto, descripcion: producto.nombre });
    }
  }
  return [...unicos.values()].sort((a, b) => a.descripcion.localeCompare(b.descripcion));
}

/** Acciones que nunca van al servidor (simulación de alertas de Inventarios y mensajes). */
const ACCIONES_LOCALES = new Set<AccionCompras['tipo']>([
  'recibirAlertaInventario',
  'limpiarAlertasInventario',
  'limpiarMensaje',
]);

/**
 * Ejecuta una acción de requisiciones y cotizaciones. Con el microservicio
 * conectado la envía al servidor; si no, la resuelve con los datos locales.
 * Devuelve true si la operación se completó correctamente.
 */
export function despachar(accion: AccionCompras): Promise<boolean> {
  if (conexion.cotizaciones && !ACCIONES_LOCALES.has(accion.tipo)) {
    return despacharCotizacionesApi(accion);
  }
  despacharCompras(accion);
  return Promise.resolve(obtenerCompras().tipoMensaje !== 'error');
}

/**
 * Hook para leer el almacén global de compras desde cualquier pantalla.
 * Se vuelve a renderizar automáticamente cuando el estado cambia.
 */
export function useCompras() {
  const estado = useSyncExternalStore(suscribirCompras, obtenerCompras);

  return {
    ...estado,
    dispatch: despachar,
    registrarRequisicion: (datos: DatosRequisicion) =>
      despachar({ tipo: 'crear', datos, hoy: fechaHoy(), catalogo: productosDelCatalogo(estado.proveedores) }),
    validar: (id: number) => despachar({ tipo: 'aprobar', id }),
    anular: (id: number) => despachar({ tipo: 'anular', id }),
  };
}
