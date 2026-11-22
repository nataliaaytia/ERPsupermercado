export interface Usuario {
  idUsuario: number;
  usuario: string;
  contrasena: string;
  nombre: string;
  rol: string;
}

/** Datos del usuario autenticado (nunca se guarda la contraseña). */
export type UsuarioSesion = Omit<Usuario, 'contrasena'>;
