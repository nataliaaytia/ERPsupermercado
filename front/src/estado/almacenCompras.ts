/**
 * Almacén global del módulo de Compras y Proveedores.
 *
 * Es la única fuente de verdad que comparten todas las pantallas
 * (proveedores, requisiciones, órdenes, recepción y facturación), así los
 * datos fluyen de una etapa a la siguiente.
 *
 * - Empieza vacío y se llena con los datos de cada microservicio (ver servicios/sincronizacion).
 * - Los cambios se guardan en localStorage para no perderlos al recargar.
 * - `reiniciarEstado()` descarta lo guardado en el navegador.
 */
import { estadoInicial, type AccionCompras, type EstadoCompras } from '../modulos/requisiciones/servicios/modeloCompras';
import { reducirComprasConHistorial } from '../modulos/requisiciones/servicios/historialRequisiciones';
import type { Proveedor } from '../modulos/proveedores/tipos';
import type { OrdenCompra, RecepcionValidada } from '../modulos/ordenesCompra/tipos';
import type { ErrorRespuestaContabilidad, EventoOrdenCompraConfirmada } from '../modulos/ordenesCompra/tipos/eventoContabilidad';
import type { RecepcionRegistrada } from '../modulos/recepcion/tipos/recepcion';
import type { ResolucionDevolucion } from '../modulos/recepcion/tipos/devolucion';
import type { ErrorRespuestaDisponibilidad, EventoMercaderiaDisponible } from '../modulos/recepcion/tipos/disponibilidad';
import type { InspeccionCalidadRecepcion } from '../modulos/recepcion/tipos/inspeccion';
import type { Discrepancia } from '../modulos/recepcion/tipos/discrepancia';
import type { Factura } from '../modulos/facturacion/tipos';

export { fechaHoy } from '../utilidades/fechas';

/** Cambiar la versión invalida los datos guardados con un formato anterior. */
const CLAVE_ALMACENAMIENTO = 'erp-compras-v4';

export interface EstadoCompartido extends EstadoCompras {
  proveedores: Proveedor[];
  ordenes: OrdenCompra[];
  recepcionesRegistradas: RecepcionRegistrada[];
  inspeccionesCalidad: InspeccionCalidadRecepcion[];
  discrepancias: Discrepancia[];
  recepcionesValidadas: RecepcionValidada[];
  resolucionesDevoluciones: ResolucionDevolucion[];
  eventosMercaderiaDisponible: EventoMercaderiaDisponible[];
  erroresRespuestasDisponibilidad: ErrorRespuestaDisponibilidad[];
  eventosOrdenCompraContabilidad: EventoOrdenCompraConfirmada[];
  erroresRespuestasContabilidad: ErrorRespuestaContabilidad[];
  facturas: Factura[];
  /** Se mantiene por compatibilidad con las pantallas; vacío si todo cargó bien. */
  errorCarga: string;
}

/** Estado vacío: todos los datos se cargan después desde los microservicios. */
function crearEstadoInicial(): EstadoCompartido {
  return {
    ...estadoInicial,
    proveedores: [],
    ordenes: [],
    recepcionesRegistradas: [],
    inspeccionesCalidad: [],
    discrepancias: [],
    recepcionesValidadas: [],
    resolucionesDevoluciones: [],
    eventosMercaderiaDisponible: [],
    erroresRespuestasDisponibilidad: [],
    eventosOrdenCompraContabilidad: [],
    erroresRespuestasContabilidad: [],
    facturas: [],
    errorCarga: '',
  };
}

function leerEstadoGuardado(): EstadoCompartido | null {
  try {
    const guardado = localStorage.getItem(CLAVE_ALMACENAMIENTO);
    if (!guardado) return null;

    const datos = JSON.parse(guardado) as Partial<EstadoCompartido>;
    const base = crearEstadoInicial();

    // Cualquier colección que falte o esté corrupta queda vacía.
    const combinado = { ...base };
    for (const clave of Object.keys(base) as (keyof EstadoCompartido)[]) {
      const valor = datos[clave];
      if (Array.isArray(base[clave]) && Array.isArray(valor)) {
        (combinado as Record<string, unknown>)[clave] = valor;
      }
    }
    return { ...combinado, mensaje: '', tipoMensaje: 'neutro', errorCarga: '' };
  } catch {
    return null;
  }
}

function guardar(nuevo: EstadoCompartido): void {
  try {
    const persistente: Partial<EstadoCompartido> = { ...nuevo };
    delete persistente.mensaje;
    delete persistente.tipoMensaje;
    delete persistente.errorCarga;
    localStorage.setItem(CLAVE_ALMACENAMIENTO, JSON.stringify(persistente));
  } catch {
    // Sin almacenamiento la aplicación sigue funcionando en memoria.
  }
}

let estado: EstadoCompartido | undefined;
const oyentes = new Set<() => void>();

function notificar(): void {
  oyentes.forEach((oyente) => oyente());
}

export function obtenerCompras(): EstadoCompartido {
  if (!estado) {
    estado = leerEstadoGuardado() ?? crearEstadoInicial();
    guardar(estado);
  }
  return estado;
}

export function suscribirCompras(oyente: () => void): () => void {
  oyentes.add(oyente);
  return () => {
    oyentes.delete(oyente);
  };
}

/** Aplica un cambio inmutable al estado, lo persiste y avisa a los suscriptores. */
export function actualizarCompras(actualizar: (actual: EstadoCompartido) => EstadoCompartido): void {
  const actual = obtenerCompras();
  const nuevo = actualizar(actual);
  if (nuevo === actual) return;

  estado = nuevo;
  guardar(nuevo);
  notificar();
}

/** Ejecuta una acción del flujo de requisiciones y cotizaciones. */
export function despacharCompras(accion: AccionCompras): void {
  actualizarCompras((actual) => ({
    ...actual,
    ...reducirComprasConHistorial(actual, { accion, fecha: new Date().toISOString() }),
  }));
}

/** Muestra un mensaje global (lo presenta el layout de los módulos). */
export function notificarMensaje(mensaje: string, tipoMensaje: EstadoCompras['tipoMensaje'] = 'exito'): void {
  actualizarCompras((actual) => ({ ...actual, mensaje, tipoMensaje }));
}

/** Descarta lo guardado en este navegador (los datos se vuelven a pedir a los servidores). */
export function reiniciarEstado(): void {
  // Facturación todavía no tiene microservicio: sus facturas solo existen aquí, se conservan.
  estado = { ...crearEstadoInicial(), facturas: obtenerCompras().facturas };
  guardar(estado);
  notificar();
}

/** Siguiente identificador numérico (máximo + 1). */
export function siguienteId(ids: number[]): number {
  return ids.reduce((maximo, id) => Math.max(maximo, id), 0) + 1;
}
