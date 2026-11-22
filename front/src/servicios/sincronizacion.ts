/**
 * Carga, desde cada microservicio conectado, los datos que usan las pantallas.
 */
import { cargarProveedoresDesdeApi } from '../modulos/proveedores/servicios/sincronizacionProveedores';
import { cargarCotizacionesDesdeApi } from '../modulos/requisiciones/servicios/sincronizacionCotizaciones';
import { cargarOrdenesDesdeApi } from '../modulos/ordenesCompra/servicios/sincronizacionOrdenes';
import { cargarRecepcionesDesdeApi } from '../modulos/recepcion/servicios/sincronizacionRecepcion';
import { notificarMensaje } from '../estado/almacenCompras';
import type { IdServidor } from './api/monitorConexion';

export const cargadores: Record<IdServidor, () => Promise<void>> = {
  proveedores: cargarProveedoresDesdeApi,
  cotizaciones: cargarCotizacionesDesdeApi,
  ordenes: cargarOrdenesDesdeApi,
  recepcion: cargarRecepcionesDesdeApi,
};

/** Carga un servicio sin romper la aplicación si falla (el monitor ya avisa). */
export async function cargarServicio(servidor: IdServidor): Promise<void> {
  try {
    await cargadores[servidor]();
  } catch (fallo) {
    console.warn(`No se pudieron cargar los datos de ${servidor}`, fallo);
  }
}

/** Carga todos los servicios conectados (al iniciar la aplicación). */
export async function cargarTodo(): Promise<void> {
  // Proveedores primero: los demás módulos usan sus nombres de productos y proveedores.
  await cargarServicio('proveedores');
  // Recepción relaciona sus productos con las líneas de cada orden, por eso va después de órdenes.
  await Promise.all([
    cargarServicio('cotizaciones'),
    cargarServicio('ordenes').then(() => cargarServicio('recepcion')),
  ]);
}

/** Recarga los datos de un servicio después de una operación (y muestra el error si falla). */
export async function recargar(servidor: IdServidor): Promise<void> {
  try {
    await cargadores[servidor]();
  } catch (fallo) {
    notificarMensaje(fallo instanceof Error ? fallo.message : 'No se pudieron actualizar los datos.', 'error');
  }
}
