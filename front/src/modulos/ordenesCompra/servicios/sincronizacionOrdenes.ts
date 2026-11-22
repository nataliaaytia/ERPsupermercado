/**
 * Sincroniza órdenes de compra con su microservicio
 * cuando la conexión está activa.
 */
import { actualizarCompras } from '../../../estado/almacenCompras';
import { conexion } from '../../../servicios/api/configuracion';
import { conservarDatosLocales, listarOrdenes } from './ordenesApi';

/** Reemplaza las órdenes del almacén por las del microservicio. */
export async function cargarOrdenesDesdeApi(): Promise<void> {
  if (!conexion.ordenes) return;
  const ordenes = await listarOrdenes();
  // Envíos, respuesta del proveedor, compromisos y anulación no se pueden
  // consultar en el servidor: se conservan los ya registrados en el almacén.
  actualizarCompras((actual) => ({
    ...actual,
    ordenes: ordenes.map((orden) =>
      conservarDatosLocales(orden, actual.ordenes.find((item) => item.idOrden === orden.idOrden)),
    ),
  }));
}
