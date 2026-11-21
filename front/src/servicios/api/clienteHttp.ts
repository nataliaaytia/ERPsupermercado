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
  const respuesta = await fetch(url, {
    method: metodo,
    headers: {
      Accept: 'application/json',
      ...(cuerpo !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined,
  });

  const texto = await respuesta.text();
  const datos: unknown = texto ? JSON.parse(texto) : undefined;

  if (!respuesta.ok) {
    // Ambos microservicios devuelven { mensaje } en sus errores.
    const mensaje =
      (datos as { mensaje?: string } | undefined)?.mensaje ?? `Error ${respuesta.status} al llamar a ${url}`;
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
