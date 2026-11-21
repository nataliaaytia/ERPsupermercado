/**
 * Almacén global del módulo de Compras y Proveedores.
 *
 * Es la única fuente de verdad que comparten todas las pantallas
 * (proveedores, requisiciones, órdenes, recepción y facturación), así los
 * datos fluyen de una etapa a la siguiente.
 *
 * - La primera vez se llena con los datos de prueba (src/data, vía datosPrueba).
 * - Los cambios se guardan en localStorage para no perderlos al recargar.
 * - `reiniciarDatosPrueba()` vuelve al estado inicial de la demo.
 */
import { estadoInicial, type AccionCompras, type EstadoCompras } from '../modulos/requisiciones/servicios/modeloCompras';
import { reducirComprasConHistorial } from '../modulos/requisiciones/servicios/historialRequisiciones';
import type { AlertaReposicion } from '../modulos/requisiciones/tipos/alertasInventario';
import type { Proveedor } from '../modulos/proveedores/tipos';
import type { OrdenCompra, RecepcionValidada } from '../modulos/ordenesCompra/tipos';
import type { ErrorRespuestaContabilidad, EventoOrdenCompraConfirmada } from '../modulos/ordenesCompra/tipos/eventoContabilidad';
import type { RecepcionRegistrada } from '../modulos/recepcion/tipos/recepcion';
import type { ResolucionDevolucion } from '../modulos/recepcion/tipos/devolucion';
import type { ErrorRespuestaDisponibilidad, EventoMercaderiaDisponible } from '../modulos/recepcion/tipos/disponibilidad';
import type { InspeccionCalidadRecepcion } from '../modulos/recepcion/tipos/inspeccion';
import type { Discrepancia } from '../modulos/recepcion/tipos/discrepancia';
import type { Factura } from '../modulos/facturacion/tipos';
import {
  obtenerAlertasInventario,
  obtenerEventosContabilidad,
  obtenerFacturas,
  obtenerOfertas,
  obtenerOrdenesCompra,
  obtenerProveedores,
  obtenerRecepciones,
  obtenerRequisiciones,
  obtenerSolicitudesCotizacion,
} from '../servicios/datosPrueba';

export { fechaHoy } from '../utilidades/fechas';

/** Cambiar la versión invalida los datos guardados con un formato anterior. */
const CLAVE_ALMACENAMIENTO = 'erp-compras-v3';

export interface EstadoCompartido extends EstadoCompras {
  proveedores: Proveedor[];
  alertasPendientes: AlertaReposicion[];
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

function crearEstadoDePrueba(): EstadoCompartido {
  const recepciones = obtenerRecepciones();
  return {
    ...estadoInicial,
    proveedores: obtenerProveedores(),
    requisiciones: obtenerRequisiciones(),
    solicitudes: obtenerSolicitudesCotizacion(),
    ofertas: obtenerOfertas(),
    alertasPendientes: obtenerAlertasInventario(),
    ordenes: obtenerOrdenesCompra(),
    recepcionesRegistradas: recepciones.recepcionesRegistradas,
    inspeccionesCalidad: recepciones.inspeccionesCalidad,
    discrepancias: [],
    recepcionesValidadas: recepciones.recepcionesValidadas,
    resolucionesDevoluciones: [],
    eventosMercaderiaDisponible: [],
    erroresRespuestasDisponibilidad: [],
    eventosOrdenCompraContabilidad: obtenerEventosContabilidad(),
    erroresRespuestasContabilidad: [],
    facturas: obtenerFacturas(),
    errorCarga: '',
  };
}

function leerEstadoGuardado(): EstadoCompartido | null {
  try {
    const guardado = localStorage.getItem(CLAVE_ALMACENAMIENTO);
    if (!guardado) return null;

    const datos = JSON.parse(guardado) as Partial<EstadoCompartido>;
    const base = crearEstadoDePrueba();

    // Cualquier colección que falte o esté corrupta se toma de los datos de prueba.
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
    estado = leerEstadoGuardado() ?? crearEstadoDePrueba();
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

/** Descarta los cambios locales y vuelve a cargar los datos de la carpeta data. */
export function reiniciarDatosPrueba(): void {
  estado = crearEstadoDePrueba();
  guardar(estado);
  notificar();
}

/** Siguiente identificador numérico (máximo + 1). */
export function siguienteId(ids: number[]): number {
  return ids.reduce((maximo, id) => Math.max(maximo, id), 0) + 1;
}
