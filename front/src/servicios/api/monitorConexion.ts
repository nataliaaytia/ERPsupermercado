/**
 * Vigila si los servidores de cada módulo responden.
 *
 * Mientras la conexión está activa, consulta cada servidor cada pocos segundos.
 * Si alguno deja de responder (por ejemplo, porque se detuvo su contenedor en
 * Docker), avisa a la interfaz al instante; cuando vuelve, avisa también para
 * que se recarguen sus datos.
 */
import { useSyncExternalStore } from 'react';
import { conexion } from './configuracion';
import { endpoints } from './endpoints';

export type IdServidor = 'proveedores' | 'cotizaciones' | 'ordenes' | 'recepcion';

interface Servidor {
  id: IdServidor;
  nombre: string;
  /** Consulta liviana que también falla si la base de datos del servicio está detenida. */
  verificacion: string;
  activo: boolean;
}

const SERVIDORES: Servidor[] = [
  { id: 'proveedores', nombre: 'Proveedores', verificacion: endpoints.proveedores.listar, activo: conexion.proveedores },
  {
    id: 'cotizaciones',
    nombre: 'Requisiciones y cotizaciones',
    verificacion: endpoints.cotizaciones.solicitudes,
    activo: conexion.cotizaciones,
  },
  { id: 'ordenes', nombre: 'Órdenes de compra', verificacion: endpoints.ordenes.buscar(0, 1), activo: conexion.ordenes },
  {
    id: 'recepcion',
    nombre: 'Recepción y control',
    verificacion: endpoints.recepcion.existencia(1),
    activo: conexion.recepcion,
  },
];

const INTERVALO_MS = 3000;
const TIEMPO_ESPERA_MS = 2500;

/** Nombres de los servidores que no responden (vacío = todo conectado). */
let caidos: readonly string[] = [];
const estadoPorServidor = new Map<IdServidor, boolean>();
let temporizador: number | undefined;
const oyentes = new Set<() => void>();
const alReconectar = new Map<IdServidor, Set<() => void>>();

async function responde(url: string): Promise<boolean> {
  const control = new AbortController();
  const limite = window.setTimeout(() => control.abort(), TIEMPO_ESPERA_MS);
  try {
    const respuesta = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: control.signal,
      cache: 'no-store',
    });
    return respuesta.ok;
  } catch {
    return false;
  } finally {
    window.clearTimeout(limite);
  }
}

/** Comprueba todos los servidores conectados y notifica los cambios. */
export async function verificarServidores(): Promise<void> {
  const activos = SERVIDORES.filter((servidor) => servidor.activo);
  const resultados = await Promise.all(activos.map((servidor) => responde(servidor.verificacion)));

  activos.forEach((servidor, indice) => {
    const ahora = resultados[indice];
    const antes = estadoPorServidor.get(servidor.id);
    estadoPorServidor.set(servidor.id, ahora);
    if (antes === false && ahora) alReconectar.get(servidor.id)?.forEach((accion) => accion());
  });

  const nuevos = activos.filter((_, indice) => !resultados[indice]).map((servidor) => servidor.nombre);
  if (nuevos.join('|') !== caidos.join('|')) {
    caidos = nuevos;
    oyentes.forEach((oyente) => oyente());
  }
}

/** Empieza a vigilar los servidores (solo si hay módulos conectados). */
export function iniciarMonitorConexion(): () => void {
  if (!SERVIDORES.some((servidor) => servidor.activo) || temporizador !== undefined) return () => undefined;

  void verificarServidores();
  temporizador = window.setInterval(() => void verificarServidores(), INTERVALO_MS);

  // Al volver a la pestaña se comprueba enseguida.
  const alVolver = () => {
    if (document.visibilityState === 'visible') void verificarServidores();
  };
  document.addEventListener('visibilitychange', alVolver);

  return () => {
    window.clearInterval(temporizador);
    temporizador = undefined;
    document.removeEventListener('visibilitychange', alVolver);
  };
}

/** Registra una acción a ejecutar cuando un servidor vuelve a responder. */
export function cuandoReconecte(servidor: IdServidor, accion: () => void): () => void {
  const acciones = alReconectar.get(servidor) ?? new Set();
  acciones.add(accion);
  alReconectar.set(servidor, acciones);
  return () => acciones.delete(accion);
}

/** Lista de servidores caídos (por nombre). */
export function useServidoresCaidos(): readonly string[] {
  return useSyncExternalStore(
    (oyente) => {
      oyentes.add(oyente);
      return () => oyentes.delete(oyente);
    },
    () => caidos,
  );
}
