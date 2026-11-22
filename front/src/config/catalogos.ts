/**
 * Listas fijas que usa la aplicación (no son datos de negocio:
 * los proveedores, requisiciones, órdenes, etc. vienen siempre del backend).
 */
export const catalogos = {
  prioridades: ['Baja', 'Media', 'Alta'],
  estadosProveedor: ['Activo', 'Inactivo', 'Observado', 'Pendiente'],
  tiposDocumentoProveedor: [
    'Ficha RUC',
    'Certificado de Homologación',
    'Licencia de Funcionamiento',
    'Registro Sanitario SENASAG',
    'Certificación ISO',
  ],
  condicionesPagoFactura: [
    { codigo: 'CONTADO', nombre: 'Contado', dias: 0 },
    { codigo: 'CREDITO_15', nombre: 'Crédito 15 días', dias: 15 },
    { codigo: 'CREDITO_30', nombre: 'Crédito 30 días', dias: 30 },
  ],
  /** Diferencia de precio aceptada en la validación de tres vías (%). */
  toleranciaMatchingPorcentaje: 1,
} as const;
