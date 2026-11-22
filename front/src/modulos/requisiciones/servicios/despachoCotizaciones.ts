/**
 * Ejecuta las acciones del flujo de requisiciones y cotizaciones contra el
 * microservicio (cuando la conexión está activa). Cada operación se envía al
 * servidor, luego se recargan los datos y se muestra su mensaje.
 *
 * Las alertas de Inventarios y la limpieza del mensaje siguen siendo locales.
 */
import { useSyncExternalStore } from 'react';
import { despacharCompras, notificarMensaje, obtenerCompras } from '../../../estado/almacenCompras';
import { ErrorApi } from '../../../servicios/api/clienteHttp';
import { recargar } from '../../../servicios/sincronizacion';
import type { AccionCompras } from './modeloCompras';
import type { DatosRequisicion, DetalleOferta } from '../tipos';
import {
  adjudicarOferta,
  aPrioridadApi,
  aprobarRequisicion,
  asociarProveedores,
  cambiarPrioridad,
  cancelarRequisicion,
  cerrarSolicitud,
  consolidarRequisiciones,
  crearRequisicion,
  esRequisicionConsolidada,
  generarSolicitud,
  modificarOferta,
  modificarRequisicion,
  rechazarRequisicion,
  registrarOferta,
  type CuerpoRequisicion,
  type DetalleOfertaCuerpo,
  type RespuestaOperacion,
} from './cotizacionesApi';

/** Forma de `dispatch` que reciben las pantallas (local o con el servidor). */
export type DespacharAccion = (accion: AccionCompras) => Promise<boolean> | void;

const NO_DISPONIBLE = 'Esta acción no está disponible en el sistema todavía.';

/** Error de negocio detectado antes de llamar al servidor. */
class ErrorValidacion extends Error {}

/* ---------- Operación en curso (evita envíos dobles) ---------- */

let guardando = false;
const oyentes = new Set<() => void>();

function cambiarGuardando(valor: boolean): void {
  guardando = valor;
  oyentes.forEach((oyente) => oyente());
}

/** true mientras se espera la respuesta del servidor a una operación. */
export function useGuardandoCotizaciones(): boolean {
  return useSyncExternalStore(
    (oyente) => {
      oyentes.add(oyente);
      return () => oyentes.delete(oyente);
    },
    () => guardando,
  );
}

/* ---------- Conversión de los datos de pantalla ---------- */

function cuerpoRequisicion(datos: DatosRequisicion, fecha: string): CuerpoRequisicion {
  const catalogo = new Map<string, number>();
  // Solo los productos del catálogo de proveedores (son los que existen en el sistema).
  for (const proveedor of obtenerCompras().proveedores) {
    for (const producto of proveedor.catalogoProductos) {
      catalogo.set(producto.nombre.trim().toLowerCase(), producto.idProducto);
    }
  }

  const observacion = datos.motivo.trim();
  return {
    fecha,
    prioridad: aPrioridadApi(datos.prioridad),
    solicitante: datos.solicitante.trim(),
    ...(observacion ? { observacion } : {}),
    detalles: datos.productos.map((producto) => {
      const nombre = producto.nombre.trim();
      const productoId = catalogo.get(nombre.toLowerCase());
      if (productoId === undefined) {
        throw new ErrorValidacion(`El producto «${nombre}» no existe en el catálogo de proveedores.`);
      }
      const nota = producto.observacion.trim();
      return { productoId, cantidad: Number(producto.cantidad), ...(nota ? { observacion: nota } : {}) };
    }),
  };
}

/** Cantidad solicitada de cada producto en la requisición de una solicitud. */
function cantidadesDeSolicitud(idSolicitud: number): Map<number, number> {
  const estado = obtenerCompras();
  const solicitud = estado.solicitudes.find((item) => item.idSolicitud === idSolicitud);
  const requisicion = estado.requisiciones.find((item) => item.idRequisicion === solicitud?.requisicion);
  if (!requisicion) throw new ErrorValidacion('No se encontró la requisición de esta solicitud de cotización.');
  return new Map(requisicion.detalles.map((detalle) => [detalle.producto.idProducto, detalle.cantidad]));
}

function detallesOferta(idSolicitud: number, detalles: DetalleOferta[]): DetalleOfertaCuerpo[] {
  const cantidades = cantidadesDeSolicitud(idSolicitud);
  return detalles.map((detalle) => {
    const cantidad = cantidades.get(detalle.producto.idProducto);
    if (cantidad === undefined) {
      throw new ErrorValidacion(`El producto «${detalle.producto.descripcion}» no forma parte de la solicitud.`);
    }
    return {
      productoId: detalle.producto.idProducto,
      cantidad,
      precio: detalle.precio,
      plazoEntrega: detalle.plazoEntrega,
    };
  });
}

function bloquearConsolidada(id: number): void {
  if (esRequisicionConsolidada(id)) {
    throw new ErrorValidacion('Las requisiciones consolidadas no se pueden modificar.');
  }
}

/* ---------- Envío de cada acción ---------- */

type Operacion = {
  llamada: () => Promise<RespuestaOperacion>;
  /** Mensaje si el servidor no envía uno. */
  exito: string;
  /** Aclaración que se agrega al mensaje de éxito. */
  nota?: string;
};

function operacionPara(accion: AccionCompras): Operacion | null {
  switch (accion.tipo) {
    case 'crear': {
      const cuerpo = cuerpoRequisicion(accion.datos, accion.hoy);
      return { llamada: () => crearRequisicion(cuerpo), exito: 'Requisición registrada.' };
    }
    case 'modificar': {
      bloquearConsolidada(accion.id);
      const actual = obtenerCompras().requisiciones.find((item) => item.idRequisicion === accion.id);
      if (!actual) throw new ErrorValidacion('La requisición no existe.');
      const cuerpo = cuerpoRequisicion(accion.datos, actual.fecha);
      return { llamada: () => modificarRequisicion(accion.id, cuerpo), exito: 'Cambios de la requisición guardados.' };
    }
    case 'cambiarPrioridad':
      bloquearConsolidada(accion.id);
      return {
        llamada: () => cambiarPrioridad(accion.id, accion.prioridad),
        exito: `Prioridad actualizada a ${accion.prioridad}.`,
      };
    case 'aprobar':
      bloquearConsolidada(accion.id);
      return { llamada: () => aprobarRequisicion(accion.id), exito: 'Requisición aprobada.' };
    case 'anular':
      bloquearConsolidada(accion.id);
      return { llamada: () => rechazarRequisicion(accion.id), exito: 'Requisición anulada.' };
    case 'cancelarRequisicion':
      bloquearConsolidada(accion.id);
      return { llamada: () => cancelarRequisicion(accion.id), exito: 'Requisición cancelada correctamente.' };
    case 'consolidar':
      return {
        llamada: () => consolidarRequisiciones(accion.ids, accion.fechaLimite),
        exito: 'Requisiciones consolidadas y solicitud de cotización generada.',
      };
    case 'generar':
      return {
        llamada: () => generarSolicitud(accion.requisicion, accion.fechaLimite),
        exito: 'Solicitud de cotización generada correctamente.',
      };
    case 'enviar':
      return {
        llamada: () => asociarProveedores(accion.id, [...new Set(accion.proveedores.map((p) => p.idProveedor))]),
        exito: 'Proveedores asociados correctamente a la solicitud de cotización.',
      };
    case 'cerrar':
      return { llamada: () => cerrarSolicitud(accion.id), exito: 'Solicitud de cotización cerrada correctamente.' };
    case 'registrarOferta': {
      const detalles = detallesOferta(accion.solicitud, accion.detalles);
      return {
        llamada: () =>
          registrarOferta({
            proveedorId: accion.proveedor.idProveedor,
            idSolicitud: accion.solicitud,
            validez: accion.validez,
            detalles,
          }),
        exito: 'Oferta del proveedor registrada correctamente.',
      };
    }
    case 'modificarOferta': {
      const oferta = obtenerCompras().ofertas.find((item) => item.idOferta === accion.id);
      if (!oferta) throw new ErrorValidacion('La oferta no existe.');
      const detalles = detallesOferta(oferta.solicitud, accion.detalles);
      return {
        llamada: () => modificarOferta(accion.id, accion.validez, detalles),
        exito: `Oferta OF-${String(accion.id).padStart(4, '0')} actualizada correctamente.`,
      };
    }
    case 'seleccionar':
      return { llamada: () => adjudicarOferta(accion.id), exito: 'Oferta adjudicada correctamente.' };
    case 'cancelar':
    case 'rechazar':
      throw new ErrorValidacion(NO_DISPONIBLE);
    default:
      // recibirAlertaInventario, limpiarAlertasInventario y limpiarMensaje: siempre locales.
      return null;
  }
}

/**
 * Envía la acción al servidor. Devuelve true si la operación se completó.
 * Mientras hay una operación en curso, las demás se ignoran.
 */
export async function despacharCotizacionesApi(accion: AccionCompras): Promise<boolean> {
  let operacion: Operacion | null;
  try {
    operacion = operacionPara(accion);
  } catch (fallo) {
    notificarMensaje(fallo instanceof Error ? fallo.message : NO_DISPONIBLE, 'error');
    return false;
  }

  if (!operacion) {
    despacharCompras(accion);
    return obtenerCompras().tipoMensaje !== 'error';
  }

  if (guardando) return false;
  cambiarGuardando(true);
  try {
    const respuesta = await operacion.llamada();
    const mensaje = respuesta?.mensaje || operacion.exito;
    notificarMensaje(operacion.nota ? `${mensaje} ${operacion.nota}` : mensaje, 'exito');
    await recargar('cotizaciones');
    return true;
  } catch (fallo) {
    const mensaje =
      fallo instanceof ErrorApi || fallo instanceof ErrorValidacion
        ? fallo.message
        : 'No se pudo completar la operación. Inténtalo nuevamente.';
    notificarMensaje(mensaje, 'error');
    return false;
  } finally {
    cambiarGuardando(false);
  }
}
