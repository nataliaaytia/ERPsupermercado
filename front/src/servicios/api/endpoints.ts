/**
 * Rutas REST reales del backend (carpeta /back), para usar con clienteHttp.
 * Al conectar una pantalla, reemplazar la lectura de servicios/datosPrueba
 * por la llamada correspondiente de esta lista.
 */
import { configuracionApi } from './configuracion';

const P = configuracionApi.proveedores;
const C = configuracionApi.cotizaciones;

export const endpoints = {
  autenticacion: {
    login: `${P}/auth/login`, // POST { username, password }
  },

  proveedores: {
    listar: `${P}/proveedores`, // GET | POST
    porId: (id: number) => `${P}/proveedores/${id}`, // GET | PUT
    validar: (id: number) => `${P}/proveedores/${id}/validar`, // POST
    cambiarEstado: (id: number, estado: string) =>
      `${P}/proveedores/${id}/estado?estado=${encodeURIComponent(estado)}`, // PATCH
    catalogo: (id: number) => `${P}/proveedores/${id}/catalogo`, // GET
    asociarProducto: (idProveedor: number, idProducto: number) =>
      `${P}/proveedores/${idProveedor}/productos/${idProducto}`, // POST
    documentos: (id: number) => `${P}/proveedores/${id}/documentos`, // GET | POST
    alertasDocumentos: `${P}/proveedores/documentos/alertas`, // GET
    comparacionPrecios: (idProducto: number) => `${P}/proveedores/productos/${idProducto}/comparacion-precios`,
    comparacionTiempos: (idProducto: number) =>
      `${P}/proveedores/productos/${idProducto}/comparacion-tiempos-entrega`,
    ranking: (criterio: 'ENTREGAS' | 'CALIDAD' | 'PRECIO', orden: 'ASC' | 'DESC' = 'DESC') =>
      `${P}/api/proveedores/ranking?criterio=${criterio}&orden=${orden}`,
    indicadores: `${P}/proveedores/indicadores`,
    resumenComparativo: `${P}/proveedores/resumen-comparativo`,
    frecuenciaMensual: `${P}/proveedores/ordenes/frecuencia-mensual`,
    condicionesComerciales: (id: number) => `${P}/condicion-comercial/proveedor/${id}`,
    incidencias: (id: number) => `${P}/incidencias/proveedor/${id}`,
  },

  requisiciones: {
    crear: `${C}/api/requisiciones`, // POST
    porId: (id: number) => `${C}/api/requisiciones/${id}`, // GET | PUT
    validar: (id: number) => `${C}/api/requisiciones/${id}/validar`, // GET
    historial: (id: number) => `${C}/api/requisiciones/${id}/historial`, // GET
    prioridad: (id: number) => `${C}/api/requisiciones/${id}/prioridad`, // PUT { prioridad }
    aprobar: (id: number) => `${C}/api/requisiciones/${id}/aprobar`, // PUT
    rechazar: (id: number) => `${C}/api/requisiciones/${id}/rechazar`, // PUT
    cancelar: (id: number) => `${C}/api/requisiciones/${id}/cancelar`, // PUT
    consolidar: `${C}/api/consolidaciones`, // POST { idsRequisiciones, fechaLimite }
    procesarAlerta: `${C}/api/pubsub/procesar-alerta`, // POST AlertaInventario
  },

  cotizaciones: {
    solicitudes: `${C}/api/solicitudes-cotizacion`, // GET ?estado= | POST
    solicitud: (id: number) => `${C}/api/solicitudes-cotizacion/${id}`,
    cerrar: (id: number) => `${C}/api/solicitudes-cotizacion/${id}/cerrar`, // PATCH
    proveedores: (id: number) => `${C}/api/solicitudes-cotizacion/${id}/proveedores`, // GET | POST
    ofertas: `${C}/api/ofertas`, // POST
    oferta: (id: number) => `${C}/api/ofertas/${id}`, // PUT
    adjudicar: (id: number) => `${C}/api/ofertas/${id}/adjudicar`, // PUT
    comparativa: (idSolicitud: number) => `${C}/api/comparativas/solicitud/${idSolicitud}`,
    comparativaCostos: (idSolicitud: number) => `${C}/api/comparativas/costos/solicitud/${idSolicitud}`,
  },
};
