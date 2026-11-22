/**
 * Rutas REST reales del backend (carpeta /back), para usar con clienteHttp.
 * Todas las pantallas leen sus datos de estos microservicios.
 */
import { configuracionApi } from './configuracion';

const P = configuracionApi.proveedores;
const C = configuracionApi.cotizaciones;
const O = configuracionApi.ordenes;
const R = configuracionApi.recepcion;

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
    listar: `${C}/api/requisiciones`, // GET (todas)
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
    /** Ofertas de una solicitud con sus detalles. */
    evaluacion: (idSolicitud: number) => `${C}/api/evaluacion-ofertas/solicitud/${idSolicitud}`,
  },

  ordenes: {
    buscar: (pagina = 0, tamano = 100) => `${O}/api/ordenes-compra/buscar?page=${pagina}&size=${tamano}`, // GET
    porId: (id: number) => `${O}/api/ordenes-compra/${id}`, // GET | PUT (editar borrador)
    desdeOferta: (idSolicitud: number, idOferta: number) =>
      `${O}/api/ordenes-compra/desde-oferta/${idSolicitud}/${idOferta}`, // POST
    saldos: (id: number) => `${O}/api/ordenes-compra/${id}/saldos`,
    solicitarAprobacion: (id: number) => `${O}/api/ordenes-compra/${id}/solicitar-aprobacion`, // POST
    aprobar: (id: number) => `${O}/api/ordenes-compra/${id}/aprobar`, // POST { usuario, rol, limiteAutorizado }
    devolver: (id: number) => `${O}/api/ordenes-compra/${id}/devolver`, // POST { motivo }
    condicionesLogisticas: (id: number) => `${O}/api/ordenes-compra/${id}/condiciones-logisticas`, // GET | PUT
    compromisos: (idOrden: number, idDetalle: number) =>
      `${O}/api/ordenes-compra/${idOrden}/detalles/${idDetalle}/compromisos`, // POST
    compromisosVencidos: `${O}/api/compromisos-entrega/vencidos`,
    enviar: (id: number) => `${O}/api/ordenes-compra/${id}/enviar`, // POST
    respuestaProveedor: (id: number) => `${O}/api/ordenes-compra/${id}/respuesta-proveedor`, // POST
    anular: (id: number) => `${O}/api/ordenes-compra/${id}/anular`, // POST { motivo }
    cerrar: (id: number) => `${O}/api/ordenes-compra/${id}/cerrar`, // POST { responsable }
    historial: (id: number) => `${O}/api/ordenes-compra/${id}/historial-estados`,
  },

  recepcion: {
    buscar: `${R}/api/recepciones/buscar`, // GET ?idOrden=&proveedorId=&desde=&hasta=
    detalle: (id: number) => `${R}/api/recepciones/${id}/detalle`,
    editar: (id: number) => `${R}/api/recepciones/${id}`, // PUT
    registrarEntrega: (idOrden: number) => `${R}/api/recepciones/orden/${idOrden}/entregas`, // POST
    existencia: (idOrden: number) => `${R}/api/recepciones/orden/${idOrden}/existencia`,
    saldos: (idOrden: number) => `${R}/api/recepciones/orden/${idOrden}/saldos`,
    costoTransporte: (id: number) => `${R}/api/recepciones/${id}/costo-transporte`, // GET | PUT
    cerrarOrden: (idOrden: number) => `${R}/api/recepciones/orden/${idOrden}/cerrar`, // POST { responsable }
    inspecciones: `${R}/api/inspecciones`, // POST
    discrepancias: `${R}/api/discrepancias`, // POST
    discrepanciasDeDetalle: (idDetalle: number) => `${R}/api/discrepancias/detalle/${idDetalle}`,
    devoluciones: `${R}/api/devoluciones`, // POST
    devolucionesDeDetalle: (idDetalle: number) => `${R}/api/devoluciones/detalle/${idDetalle}`,
    resolverDevolucion: `${R}/api/devoluciones/resolver`, // PATCH
    conciliacion: (idRecepcion: number, idOrden: number) =>
      `${R}/api/conciliaciones/recepcion/${idRecepcion}/orden/${idOrden}`,
    autorizar: `${R}/api/autorizaciones-recepcion/confirmar`, // POST
    autorizacion: (idRecepcion: number) => `${R}/api/autorizaciones-recepcion/recepcion/${idRecepcion}`,
  },
};
