/**
 * Cierre común de las operaciones conectadas al microservicio de órdenes:
 * vuelve a leer las órdenes y muestra el mensaje del servidor.
 */
import { notificarMensaje } from '../../../estado/almacenCompras';
import { recargar } from '../../../servicios/sincronizacion';

export async function finalizarOperacion(mensaje: string): Promise<void> {
  await recargar('ordenes');
  notificarMensaje(mensaje, 'exito');
}
