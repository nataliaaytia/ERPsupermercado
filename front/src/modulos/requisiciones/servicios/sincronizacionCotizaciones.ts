/**
 * Sincroniza requisiciones, solicitudes de cotización y ofertas con su microservicio
 * cuando la conexión está activa.
 */
import { actualizarCompras } from '../../../estado/almacenCompras';
import { conexion } from '../../../servicios/api/configuracion';
import { leerCotizaciones } from './cotizacionesApi';

/** Reemplaza los datos del almacén por los del microservicio. */
export async function cargarCotizacionesDesdeApi(): Promise<void> {
  if (!conexion.cotizaciones) return;
  const { requisiciones, solicitudes, ofertas } = await leerCotizaciones();
  actualizarCompras((actual) => ({ ...actual, requisiciones, solicitudes, ofertas }));
}
