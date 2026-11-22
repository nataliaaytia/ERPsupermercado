/**
 * Configuración de conexión con el backend (microservicios Spring Boot).
 * Los valores se leen de variables de entorno (ver front/.env.example).
 *
 * Por defecto se usan rutas relativas (/srv/...): en Docker las reenvía nginx
 * (front/nginx.conf) y en desarrollo el proxy de Vite (vite.config.ts), así el
 * navegador siempre habla con el mismo origen y no hay problemas de CORS.
 */
export const configuracionApi = {
  /** ms-proveedores-catalogo */
  proveedores: import.meta.env.VITE_API_PROVEEDORES ?? '/srv/proveedores',
  /** ms-cotizaciones-requisiciones */
  cotizaciones: import.meta.env.VITE_API_COTIZACIONES ?? '/srv/cotizaciones',
  /** ms-ordenes-compra */
  ordenes: import.meta.env.VITE_API_ORDENES ?? '/srv/ordenes',
  /** ms-recepcion-control */
  recepcion: import.meta.env.VITE_API_RECEPCION ?? '/srv/recepcion',
};

/**
 * Módulos que trabajan contra su microservicio. Todos leen y guardan
 * únicamente en el backend (Facturación todavía no tiene microservicio).
 */
export const conexion = {
  proveedores: true,
  autenticacion: true,
  cotizaciones: true,
  ordenes: true,
  recepcion: true,
} as const;
