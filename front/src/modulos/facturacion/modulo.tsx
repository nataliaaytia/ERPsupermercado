import { Receipt } from 'lucide-react';
import type { ModuloConfig } from '../../app/tiposModulo';
import ValidacionFacturas from './paginas/ValidacionFacturas';
import { PaginaRegistrar } from './vistas';

export const moduloFacturacion: ModuloConfig = {
  id: 'facturacion',
  ruta: '/facturacion',
  titulo: 'Facturación',
  descripcion: 'Registro de facturas de proveedores y validación de tres vías antes de remitirlas a pagos.',
  icono: Receipt,
  imagen: '/multimedia/imagenes/proveedores1.avif',
  secciones: [
    {
      ruta: 'registrar',
      etiqueta: 'Registrar factura',
      descripcion: 'Registra los datos fiscales y las líneas de la factura comercial de una orden recibida.',
      elemento: <PaginaRegistrar />,
    },
    {
      ruta: 'validacion',
      etiqueta: 'Validación y pagos',
      descripcion: 'Compara factura, orden de compra y recepción (3-way matching) y envía a pagos las conformes.',
      elemento: <ValidacionFacturas />,
    },
  ],
};
