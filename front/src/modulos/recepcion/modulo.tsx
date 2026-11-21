import { PackageCheck } from 'lucide-react';
import type { ModuloConfig } from '../../app/tiposModulo';
import { PaginaDespacho, PaginaDevoluciones, PaginaDiscrepancias, PaginaRecepciones, PaginaRegistrar, PaginaRevisionFinal } from './vistas';

export const moduloRecepcion: ModuloConfig = {
  id: 'recepcion',
  ruta: '/recepcion',
  titulo: 'Recepción y control',
  descripcion: 'Recepción de mercadería, control de calidad, discrepancias, devoluciones y disponibilidad para despacho.',
  icono: PackageCheck,
  imagen: '/multimedia/imagenes/proveedor2.avif',
  secciones: [
    {
      ruta: 'registrar',
      etiqueta: 'Registrar recepción',
      descripcion: 'Registra la mercadería que entregó el proveedor contra una orden de compra confirmada.',
      elemento: <PaginaRegistrar />,
    },
    {
      ruta: 'recepciones',
      etiqueta: 'Inspección y seguimiento',
      descripcion: 'Inspecciona la calidad, concilia con la orden, registra costos de transporte y corrige recepciones.',
      elemento: <PaginaRecepciones />,
    },
    {
      ruta: 'discrepancias',
      etiqueta: 'Discrepancias',
      descripcion: 'Registra diferencias de cantidad o productos distintos a los solicitados.',
      elemento: <PaginaDiscrepancias />,
    },
    {
      ruta: 'revision-final',
      etiqueta: 'Revisión final',
      descripcion: 'Confirma las cantidades aceptadas. Esto actualiza los saldos de la orden y habilita la facturación.',
      elemento: <PaginaRevisionFinal />,
    },
    {
      ruta: 'devoluciones',
      etiqueta: 'Devoluciones',
      descripcion: 'Gestiona la devolución, retiro o reposición de los productos rechazados.',
      elemento: <PaginaDevoluciones />,
    },
    {
      ruta: 'despacho',
      etiqueta: 'Disponibilidad para despacho',
      descripcion: 'Comunica a Inventarios y a Entregas la mercadería aceptada y disponible.',
      elemento: <PaginaDespacho />,
    },
  ],
};
