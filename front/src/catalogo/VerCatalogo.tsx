import { useState } from "react";
import { Building2, Search, Filter, Package, Tag, Truck } from "lucide-react";
import type { Proveedor, ProductoCatalogo } from "./tipos";
import ProductoDetalle from "./ProductoDetalle";
interface Props {
  proveedores: Proveedor[];
  proveedorSeleccionado: Proveedor;
  onSeleccionar: (id: number) => void;
}
export default function VerCatalogo({
  proveedores,
  proveedorSeleccionado,
  onSeleccionar,
}: Props) {
  const [busquedaProducto, setBusquedaProducto] = useState<string>("");
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("Todas");
  const [productoSeleccionado, setProductoSeleccionado] =
    useState<ProductoCatalogo | null>(null);
  const productosFiltrados = proveedorSeleccionado.catalogoProductos.filter(
    (prod) => {
      const coincideTexto =
        prod.nombre.toLowerCase().includes(busquedaProducto.toLowerCase()) ||
        prod.sku.toLowerCase().includes(busquedaProducto.toLowerCase()) ||
        prod.descripcion.toLowerCase().includes(busquedaProducto.toLowerCase());
      const coincideCategoria =
        categoriaFiltro === "Todas" || prod.categoria === categoriaFiltro;
      return coincideTexto && coincideCategoria;
    },
  );
  const categoriasDisponibles = [
    "Todas",
    ...Array.from(
      new Set(proveedorSeleccionado.catalogoProductos.map((p) => p.categoria)),
    ),
  ];
  return (
    <div className="catalogo-productos-layout">
      <div className="selector-proveedor-card">
        <div className="selector-header">
          <div className="selector-info">
            <span className="selector-label">Seleccionar Proveedor:</span>
            <div className="select-wrapper">
              <Building2 size={16} className="select-icon" />
              <select
                className="proveedor-dropdown"
                value={proveedorSeleccionado.idProveedor}
                onChange={(e) => {
                  const prov = proveedores.find(
                    (p) => p.idProveedor === Number(e.target.value),
                  );
                  if (prov) {
                    onSeleccionar(prov.idProveedor);
                    setBusquedaProducto("");
                    setCategoriaFiltro("Todas");
                    setProductoSeleccionado(null);
                  }
                }}
              >
                {proveedores.map((p) => (
                  <option key={p.idProveedor} value={p.idProveedor}>
                    {p.razonSocial} ({p.nitRuc})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="proveedor-meta-pills">
            <span
              className={`badge-estado badge-${proveedorSeleccionado.estado.toLowerCase()}`}
            >
              Estado: {proveedorSeleccionado.estado}
            </span>
            <span className="pill-metric">
              Puntaje:{" "}
              <strong>{proveedorSeleccionado.puntajeDesempeno}%</strong>
            </span>
            <span className="pill-metric">
              Productos:{" "}
              <strong>{proveedorSeleccionado.catalogoProductos.length}</strong>
            </span>
          </div>
        </div>
      </div>

      <div className="filtros-catalogo-bar">
        <div className="busqueda-box-amplia">
          <Search size={16} className="busqueda-icon" />
          <input
            type="text"
            placeholder="Buscar por SKU, Nombre o Descripción del producto..."
            value={busquedaProducto}
            onChange={(e) => setBusquedaProducto(e.target.value)}
            className="busqueda-input"
          />
        </div>

        <div className="filtro-categoria-box">
          <Filter size={15} className="filtro-icon" />
          <select
            className="categoria-dropdown"
            value={categoriaFiltro}
            onChange={(e) => setCategoriaFiltro(e.target.value)}
          >
            {categoriasDisponibles.map((cat) => (
              <option key={cat} value={cat}>
                Categoría: {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="tabla-catalogo-card">
        <div className="tabla-header-info">
          <div className="titulo-tabla-group">
            <Package size={18} className="icono-seccion" />
            <h3 className="titulo-tabla">Catalogo de productos</h3>
          </div>
          <span className="conteo-resultados">
            Mostrando {productosFiltrados.length} de{" "}
            {proveedorSeleccionado.catalogoProductos.length} productos
          </span>
        </div>

        <div className="documentos-tabla-wrapper">
          <table className="documentos-tabla">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Producto / Descripción</th>
                <th>Categoría</th>
                <th>Precio Pactado</th>
                <th>Tiempo Estimado Entrega</th>
                <th>Stock Dispon.</th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.length > 0 ? (
                productosFiltrados.map((prod) => (
                  <tr
                    key={prod.idProducto}
                    onClick={() => setProductoSeleccionado(prod)}
                    className="producto-fila"
                    tabIndex={0}
                    aria-label={`Ver detalle de ${prod.nombre}`}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setProductoSeleccionado(prod);
                      }
                    }}
                  >
                    <td>
                      <span className="sku-badge">
                        <Tag size={12} />
                        {prod.sku}
                      </span>
                    </td>
                    <td>
                      <div className="producto-info-cell">
                        <span className="producto-nombre">{prod.nombre}</span>
                        <span className="producto-desc">
                          {prod.descripcion}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="categoria-tag">{prod.categoria}</span>
                    </td>
                    <td>
                      <span className="precio-pactado-tag">
                        {prod.precioPactado.toFixed(2)} Bs.
                      </span>
                      <span className="unidad-sub"> / {prod.unidadMedida}</span>
                    </td>
                    <td>
                      <div className="entrega-cell">
                        <Truck size={14} className="icon-truck" />
                        <span>{prod.tiempoEntregaEstimado}</span>
                      </div>
                    </td>
                    <td>
                      <span className="stock-val">
                        {prod.stockDisponible} {prod.unidadMedida}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="tabla-vacia">
                    {proveedorSeleccionado.catalogoProductos.length === 0
                      ? "Este proveedor no cuenta con productos asociados en su catálogo."
                      : "No se encontraron productos que coincidan con la búsqueda."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {productoSeleccionado && (
        <ProductoDetalle
          producto={productoSeleccionado}
          productos={proveedorSeleccionado.catalogoProductos}
          onCerrar={() => setProductoSeleccionado(null)}
          onCambiarProducto={setProductoSeleccionado}
        />
      )}
    </div>
  );
}
