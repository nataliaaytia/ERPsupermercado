import { ClipboardList } from 'lucide-react';
import type { ModuloConfig } from '../../app/tiposModulo';
import { PaginaAlertas, PaginaAprobacion, PaginaConsolidar, PaginaCotizaciones, PaginaHistorial, PaginaNueva, PaginaRegistradas } from './vistas';

export const moduloRequisiciones: ModuloConfig = {
  id: 'requisiciones',
  ruta: '/requisiciones',
  titulo: 'Requisiciones y cotizaciones',
  descripcion: 'Necesidades de compra, aprobación, solicitudes de cotización, ofertas de proveedores y adjudicación.',
  icono: ClipboardList,
  imagen: '/multimedia/imagenes/requisiciones.jpg',
  secciones: [
    {
      ruta: 'alertas',
      etiqueta: 'Alertas de inventario',
      descripcion: 'Procesa las alertas de reposición publicadas por Inventarios y genera requisiciones.',
      elemento: <PaginaAlertas />,
    },
    {
      ruta: 'nueva',
      etiqueta: 'Nueva requisición',
      descripcion: 'Registra manualmente una necesidad de compra con sus productos y prioridad.',
      elemento: <PaginaNueva />,
    },
    {
      ruta: 'aprobacion',
      etiqueta: 'Aprobar requisiciones',
      descripcion: 'Revisa las requisiciones pendientes y apruébalas o anúlalas.',
      elemento: <PaginaAprobacion />,
    },
    {
      ruta: 'registradas',
      etiqueta: 'Requisiciones registradas',
      descripcion: 'Lista de todas las requisiciones: cambia su prioridad, edítalas o cancélalas.',
      elemento: <PaginaRegistradas />,
    },
    {
      ruta: 'consolidar',
      etiqueta: 'Consolidar requisiciones',
      descripcion: 'Agrupa varias requisiciones aprobadas en una sola solicitud de cotización.',
      elemento: <PaginaConsolidar />,
    },
    {
      ruta: 'cotizaciones',
      etiqueta: 'Cotizaciones y ofertas',
      descripcion: 'Genera solicitudes de cotización, invita proveedores, registra y compara ofertas y adjudica la mejor.',
      elemento: <PaginaCotizaciones />,
    },
    {
      ruta: 'historial',
      etiqueta: 'Estado e historial',
      descripcion: 'Consulta el estado, las cotizaciones vinculadas y el historial de cambios de una requisición.',
      elemento: <PaginaHistorial />,
    },
  ],
};
