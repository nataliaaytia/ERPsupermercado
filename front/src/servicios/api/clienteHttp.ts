/**
 * Cliente HTTP mínimo para hablar con los microservicios.
 * Centraliza cabeceras, token de sesión y manejo de errores.
 */

export class ErrorApi extends Error {
  readonly estado: number;
  readonly detalle?: unknown;

  constructor(mensaje: string, estado: number, detalle?: unknown) {
    super(mensaje);
    this.name = 'ErrorApi';
    this.estado = estado;
    this.detalle = detalle;
  }
}

let token: string | null = null;

/** Guarda el JWT que devuelve POST /auth/login para enviarlo en cada petición. */
export function establecerToken(nuevo: string | null): void {
  token = nuevo;
}

async function solicitar<T>(metodo: string, url: string, cuerpo?: unknown): Promise<T> {
  let respuesta: Response;
  try {
    respuesta = await fetch(url, {
    method: metodo,
    headers: {
      Accept: 'application/json',
      ...(cuerpo !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined,
    });
  } catch {
    throw new ErrorApi('No se pudo conectar con el servidor. Verifica que el servicio esté encendido.', 0);
  }

  const texto = await respuesta.text();
  let datos: unknown;
  try {
    datos = texto ? JSON.parse(texto) : undefined;
  } catch {
    datos = texto;
  }

  if (!respuesta.ok) {
    // Cada microservicio responde los errores a su manera:
    // { mensaje }, { message }, { errores: { campo: mensaje } } o texto plano.
    const cuerpoError =
      typeof datos === 'object' && datos !== null
        ? (datos as { mensaje?: string; message?: string; errores?: Record<string, string> })
        : undefined;
    const detalles = cuerpoError?.errores ? Object.values(cuerpoError.errores).join(' ') : '';
    const textoPlano = typeof datos === 'string' && datos.length < 300 ? datos : '';
    const mensaje =
      detalles ||
      cuerpoError?.mensaje ||
      cuerpoError?.message ||
      textoPlano ||
      `El servidor respondió con un error (${respuesta.status}).`;
    throw new ErrorApi(mensaje, respuesta.status, datos);
  }
  return datos as T;
}

export const http = {
  get: <T>(url: string) => solicitar<T>('GET', url),
  post: <T>(url: string, cuerpo?: unknown) => solicitar<T>('POST', url, cuerpo),
  put: <T>(url: string, cuerpo?: unknown) => solicitar<T>('PUT', url, cuerpo),
  patch: <T>(url: string, cuerpo?: unknown) => solicitar<T>('PATCH', url, cuerpo),
};
