import { useSyncExternalStore } from 'react';
import type { DatosRequisicion, ProductoReferencia } from '../modulos/requisiciones/tipos';
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

/**
 * Hook para leer el almacén global de compras desde cualquier pantalla.
 * Se vuelve a renderizar automáticamente cuando el estado cambia.
 */
export function useCompras() {
  const estado = useSyncExternalStore(suscribirCompras, obtenerCompras);

  return {
    ...estado,
    dispatch: despacharCompras,
    registrarRequisicion: (datos: DatosRequisicion) =>
      despacharCompras({ tipo: 'crear', datos, hoy: fechaHoy(), catalogo: productosDelCatalogo(estado.proveedores) }),
    validar: (id: number) => despacharCompras({ tipo: 'aprobar', id }),
    anular: (id: number) => despacharCompras({ tipo: 'anular', id }),
  };
}
