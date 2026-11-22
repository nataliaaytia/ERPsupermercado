/**
 * Inicio de sesión contra el microservicio de proveedores (POST /auth/login).
 */
import type { UsuarioSesion } from '../contexto/tiposSesion';
import { ErrorApi, establecerToken, http } from './api/clienteHttp';
import { endpoints } from './api/endpoints';

interface RespuestaLogin {
  token: string;
  tipoToken: string;
  idUsuario: number;
  username: string;
  rol: string;
  mensaje: string;
}

export async function iniciarSesion(usuario: string, contrasena: string): Promise<UsuarioSesion | null> {
  try {
    const respuesta = await http.post<RespuestaLogin>(endpoints.autenticacion.login, {
      username: usuario.trim(),
      password: contrasena,
    });
    establecerToken(respuesta.token);
    return {
      idUsuario: respuesta.idUsuario,
      usuario: respuesta.username,
      nombre: respuesta.username,
      rol: respuesta.rol,
      token: respuesta.token,
    };
  } catch (fallo) {
    // 400 (datos con formato inválido) y 401 (credenciales) son "usuario o contraseña incorrectos".
    if (fallo instanceof ErrorApi && (fallo.estado === 401 || fallo.estado === 400)) return null;
    throw fallo;
  }
}
