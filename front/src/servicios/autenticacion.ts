/**
 * Autenticación contra los usuarios de prueba (data/usuarios.json).
 * Al conectar el backend, reemplazar por POST /auth/login del
 * microservicio de proveedores (ver servicios/api/endpoints.ts).
 */
import type { UsuarioSesion } from '../contexto/tiposSesion';
import { obtenerUsuarios } from './datosPrueba';

export function iniciarSesion(usuario: string, contrasena: string): UsuarioSesion | null {
  const encontrado = obtenerUsuarios().find(
    (item) => item.usuario === usuario.trim() && item.contrasena === contrasena,
  );
  if (!encontrado) return null;

  const datos: Partial<typeof encontrado> = { ...encontrado };
  delete datos.contrasena;
  return datos as UsuarioSesion;
}
