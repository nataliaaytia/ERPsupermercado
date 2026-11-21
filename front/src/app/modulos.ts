import type { ModuloConfig } from './tiposModulo';
import { moduloProveedores } from '../modulos/proveedores/modulo';
import { moduloRequisiciones } from '../modulos/requisiciones/modulo';
import { moduloOrdenesCompra } from '../modulos/ordenesCompra/modulo';
import { moduloRecepcion } from '../modulos/recepcion/modulo';
import { moduloFacturacion } from '../modulos/facturacion/modulo';

/**
 * Módulos del sistema en el orden del proceso de compra.
 * Agregar un módulo aquí lo incorpora a la cabecera, las rutas y el inicio.
 */
export const modulos: ModuloConfig[] = [
  moduloProveedores,
  moduloRequisiciones,
  moduloOrdenesCompra,
  moduloRecepcion,
  moduloFacturacion,
];
