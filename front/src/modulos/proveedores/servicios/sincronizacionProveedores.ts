/**
 * Mantiene los proveedores del almacén global sincronizados con el
 * microservicio cuando la conexión está activa.
 */
import { useSyncExternalStore } from 'react';
import { actualizarCompras } from '../../../estado/almacenCompras';
import { conexion } from '../../../servicios/api/configuracion';
import type { Proveedor } from '../tipos';
import { listarProveedores, obtenerProveedor } from './proveedoresApi';

export interface EstadoConexionProveedores {
  estado: 'sin-conexion' | 'cargando' | 'conectado' | 'error';
  mensaje: string;
}

let estadoActual: EstadoConexionProveedores = {
  estado: conexion.proveedores ? 'cargando' : 'sin-conexion',
  mensaje: '',
};
const oyentes = new Set<() => void>();

function cambiarEstado(nuevo: EstadoConexionProveedores): void {
  estadoActual = nuevo;
  oyentes.forEach((oyente) => oyente());
}

export function useEstadoConexionProveedores(): EstadoConexionProveedores {
  return useSyncExternalStore(
    (oyente) => {
      oyentes.add(oyente);
      return () => oyentes.delete(oyente);
    },
    () => estadoActual,
  );
}

/** Reemplaza los proveedores del almacén por los del microservicio. */
export async function cargarProveedoresDesdeApi(): Promise<void> {
  if (!conexion.proveedores) return;
  cambiarEstado({ estado: 'cargando', mensaje: '' });
  try {
    const proveedores = await listarProveedores();
    actualizarCompras((actual) => ({ ...actual, proveedores }));
    cambiarEstado({ estado: 'conectado', mensaje: '' });
  } catch (fallo) {
    cambiarEstado({
      estado: 'error',
      mensaje: fallo instanceof Error ? fallo.message : 'No se pudo cargar la lista de proveedores.',
    });
  }
}

/** Vuelve a leer un proveedor del servidor y lo reemplaza (o agrega) en el almacén. */
export async function refrescarProveedor(idProveedor: number): Promise<Proveedor> {
  const proveedor = await obtenerProveedor(idProveedor);
  actualizarCompras((actual) => ({
    ...actual,
    proveedores: actual.proveedores.some((item) => item.idProveedor === idProveedor)
      ? actual.proveedores.map((item) => (item.idProveedor === idProveedor ? proveedor : item))
      : [...actual.proveedores, proveedor],
  }));
  return proveedor;
}
