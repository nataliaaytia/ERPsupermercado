import type { Proveedor, ProductoCatalogo } from "../tipos";
import { obtenerMetricasProveedores } from "../../../servicios/datosPrueba";

const metricas = obtenerMetricasProveedores();
/** Indicadores de calidad y cumplimiento (data/metricasProveedores.json). */
export const obtenerMetricasCalidadEntrega = (idProveedor: number) =>
  metricas.find((metrica) => metrica.idProveedor === idProveedor) ?? {
    idProveedor,
    porcentajeAceptados: 0,
    porcentajeEntregasCompletas: 0,
  };
export const obtenerDescuentoMaximo = (proveedor: Proveedor) =>
  Math.max(0, ...proveedor.descuentoVolumen.map((tramo) => tramo.descuento));
export const obtenerPrecioPromedioProveedor = (proveedor: Proveedor) =>
  proveedor.catalogoProductos.length
    ? proveedor.catalogoProductos.reduce(
        (total, producto) => total + producto.precioPactado,
        0,
      ) / proveedor.catalogoProductos.length
    : 0;
export const asociarProductos = (
  proveedores: Proveedor[],
  idProveedor: number,
  productos: ProductoCatalogo[],
) =>
  proveedores.map((proveedor) => {
    if (proveedor.idProveedor !== idProveedor) return proveedor;
    const existentes = new Set(
      proveedor.catalogoProductos.map((producto) => producto.sku),
    );
    const nuevos = productos.filter((producto) => {
      if (existentes.has(producto.sku)) return false;
      existentes.add(producto.sku);
      return true;
    });
    return nuevos.length
      ? {
          ...proveedor,
          catalogoProductos: [...proveedor.catalogoProductos, ...nuevos],
        }
      : proveedor;
  });
