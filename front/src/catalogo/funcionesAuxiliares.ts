import type { Proveedor, ProductoCatalogo } from "./tipos";
export const obtenerMetricasCalidadEntrega = (idProveedor: number) => {
  const metricas: Record<
    number,
    {
      porcentajeAceptados: number;
      porcentajeEntregasCompletas: number;
    }
  > = {
    1: { porcentajeAceptados: 98, porcentajeEntregasCompletas: 95 },
    2: { porcentajeAceptados: 82, porcentajeEntregasCompletas: 75 },
    3: { porcentajeAceptados: 60, porcentajeEntregasCompletas: 50 },
    4: { porcentajeAceptados: 94, porcentajeEntregasCompletas: 90 },
  };
  return (
    metricas[idProveedor] || {
      porcentajeAceptados: 0,
      porcentajeEntregasCompletas: 0,
    }
  );
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
export const fechaLocal = (fecha = new Date()) =>
  `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`;
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
