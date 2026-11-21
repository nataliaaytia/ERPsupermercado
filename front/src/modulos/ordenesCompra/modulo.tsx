import { FileText } from 'lucide-react';
import type { ModuloConfig } from '../../app/tiposModulo';
import { PaginaAprobacion, PaginaBorradores, PaginaBuscar, PaginaCompromisos, PaginaDemoras, PaginaDetalle, PaginaLogistica, PaginaNueva, PaginaSeguimiento } from './vistas';

export const moduloOrdenesCompra: ModuloConfig = {
  id: 'ordenes-compra',
  ruta: '/ordenes-compra',
  titulo: 'Órdenes de compra',
  descripcion: 'Generación, aprobación, envío y seguimiento de órdenes de compra hasta su cierre.',
  icono: FileText,
  imagen: '/multimedia/imagenes/decision.jpeg',
  secciones: [
    {
      ruta: 'nueva',
      etiqueta: 'Generar orden',
      descripcion: 'Crea el borrador de una orden de compra a partir de una oferta adjudicada.',
      elemento: <PaginaNueva />,
    },
    {
      ruta: 'borradores',
      etiqueta: 'Borradores',
      descripcion: 'Ajusta cantidades y productos del borrador y solicita su aprobación.',
      elemento: <PaginaBorradores />,
    },
    {
      ruta: 'aprobacion',
      etiqueta: 'Por aprobar',
      descripcion: 'Órdenes pendientes de aprobación. Abre el detalle para aprobarlas o devolverlas.',
      elemento: <PaginaAprobacion />,
    },
    {
      ruta: 'buscar',
      etiqueta: 'Buscar órdenes',
      descripcion: 'Busca cualquier orden por número, proveedor o estado y abre su detalle.',
      elemento: <PaginaBuscar />,
    },
    {
      ruta: 'detalle/:id?',
      etiqueta: 'Detalle de orden',
      descripcion: 'Aprobación, envío al proveedor, respuesta, anulación e historial de estados de la orden.',
      elemento: <PaginaDetalle />,
      oculta: true,
    },
    {
      ruta: 'compromisos',
      etiqueta: 'Compromisos de entrega',
      descripcion: 'Registra las fechas y cantidades de entrega comprometidas por el proveedor.',
      elemento: <PaginaCompromisos />,
    },
    {
      ruta: 'logistica',
      etiqueta: 'Condiciones logísticas',
      descripcion: 'Define destino, horario y responsable de la entrega.',
      elemento: <PaginaLogistica />,
    },
    {
      ruta: 'seguimiento',
      etiqueta: 'Seguimiento y cierre',
      descripcion: 'Saldos pendientes por línea según las recepciones validadas y cierre de la orden.',
      elemento: <PaginaSeguimiento />,
    },
    {
      ruta: 'demoras',
      etiqueta: 'Demoras de entrega',
      descripcion: 'Compromisos de entrega vencidos con cantidades pendientes.',
      elemento: <PaginaDemoras />,
    },
  ],
};
