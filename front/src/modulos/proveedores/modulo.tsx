import { Building2 } from 'lucide-react';
import type { ModuloConfig } from '../../app/tiposModulo';
import { PaginaAsociar, PaginaCatalogo, PaginaComparacion, PaginaGestion, PaginaRanking, PaginaReportes } from './vistas';

export const moduloProveedores: ModuloConfig = {
  id: 'proveedores',
  ruta: '/proveedores',
  titulo: 'Proveedores',
  descripcion: 'Registro de proveedores, documentación, catálogo de productos y evaluación de desempeño.',
  icono: Building2,
  imagen: '/multimedia/imagenes/proveedor3.webp',
  secciones: [
    {
      ruta: 'gestion',
      etiqueta: 'Gestionar proveedores',
      descripcion: 'Registra proveedores, valida sus datos, cambia su estado y administra sus documentos.',
      elemento: <PaginaGestion />,
    },
    {
      ruta: 'asociar-catalogo',
      etiqueta: 'Asociar catálogo',
      descripcion: 'Asocia productos al catálogo comercial de un proveedor.',
      elemento: <PaginaAsociar />,
    },
    {
      ruta: 'catalogo',
      etiqueta: 'Ver catálogo',
      descripcion: 'Consulta los productos, precios pactados y tiempos de entrega de cada proveedor.',
      elemento: <PaginaCatalogo />,
    },
    {
      ruta: 'comparacion',
      etiqueta: 'Comparar productos',
      descripcion: 'Compara precio, descuentos, tiempo de entrega y stock de un mismo producto entre proveedores.',
      elemento: <PaginaComparacion />,
    },
    {
      ruta: 'ranking',
      etiqueta: 'Ranking de proveedores',
      descripcion: 'Ordena a los proveedores por descuento, desempeño o tiempo de entrega.',
      elemento: <PaginaRanking />,
    },
    {
      ruta: 'reportes',
      etiqueta: 'Reportes e indicadores',
      descripcion: 'Indicadores de cumplimiento, calidad y alertas de documentos por vencer.',
      elemento: <PaginaReportes />,
    },
  ],
};
