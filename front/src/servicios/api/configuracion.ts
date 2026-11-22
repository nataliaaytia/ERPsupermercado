/**
 * Configuración de conexión con el backend (microservicios Spring Boot).
 * Los valores se leen de variables de entorno (ver front/.env.example).
 */
export const configuracionApi = {
  /** ms-proveedores-catalogo */
  proveedores: import.meta.env.VITE_API_PROVEEDORES ?? 'http://localhost:8080',
  /** ms-cotizaciones-requisiciones */
  cotizaciones: import.meta.env.VITE_API_COTIZACIONES ?? 'http://localhost:8082',
  /**
   * true  → la app usa los datos de prueba de src/data (modo actual).
   * false → los servicios deben consultar la API real.
   */
  usarDatosPrueba: (import.meta.env.VITE_USAR_DATOS_PRUEBA ?? 'true') !== 'false',
};
