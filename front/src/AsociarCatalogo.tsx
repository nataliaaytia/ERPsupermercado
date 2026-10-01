import { useMemo, useState } from "react";
import {
  Search,
  Filter,
  Package,
  Building2,
  Plus,
  X,
  Check,
} from "lucide-react";
import "./AsociarCatalogo.css";
import type { ProductoCatalogo, Proveedor } from "./Catalogo";

interface AsociarCatalogoProps {
  proveedores: Proveedor[];
  onAsociarProductos: (
    idProveedor: number,
    productos: ProductoCatalogo[],
  ) => void;
}

const AsociarCatalogo = ({
  proveedores,
  onAsociarProductos,
}: AsociarCatalogoProps) => {
  const [idProveedorSeleccionado, setIdProveedorSeleccionado] = useState<
    number | null
  >(proveedores[0]?.idProveedor ?? null);

  const proveedorSeleccionado =
    proveedores.find(
      (proveedor) => proveedor.idProveedor === idProveedorSeleccionado,
    ) ??
    proveedores[0] ??
    null;

  const [busquedaProducto, setBusquedaProducto] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("Todas");

  const [productosSeleccionados, setProductosSeleccionados] = useState<
    ProductoCatalogo[]
  >([]);

  const categoriasDisponibles = useMemo(() => {
    const productosUnicos = new Map<number, ProductoCatalogo>();
    proveedores
      .flatMap((proveedor) => proveedor.catalogoProductos)
      .forEach((producto) => {
        if (!productosUnicos.has(producto.idProducto)) {
          productosUnicos.set(producto.idProducto, producto);
        }
      });

    return [
      "Todas",
      ...new Set(
        Array.from(productosUnicos.values()).map(
          (producto) => producto.categoria,
        ),
      ),
    ];
  }, [proveedores]);

  const productosDisponibles = useMemo(() => {
    if (!proveedorSeleccionado) {
      return [];
    }

    const productosUnicos = new Map<number, ProductoCatalogo>();
    proveedores
      .flatMap((proveedor) => proveedor.catalogoProductos)
      .forEach((producto) => {
        if (!productosUnicos.has(producto.idProducto)) {
          productosUnicos.set(producto.idProducto, producto);
        }
      });

    const idsAsociados = new Set(
      proveedorSeleccionado.catalogoProductos.map(
        (producto) => producto.idProducto,
      ),
    );

    return Array.from(productosUnicos.values()).filter(
      (producto) => !idsAsociados.has(producto.idProducto),
    );
  }, [proveedores, proveedorSeleccionado]);

  const productosFiltrados = useMemo(() => {
    const busqueda = busquedaProducto.toLowerCase().trim();

    return productosDisponibles.filter((producto) => {
      const coincideBusqueda =
        producto.nombre.toLowerCase().includes(busqueda) ||
        producto.sku.toLowerCase().includes(busqueda) ||
        producto.descripcion.toLowerCase().includes(busqueda);

      const coincideCategoria =
        categoriaFiltro === "Todas" || producto.categoria === categoriaFiltro;

      return coincideBusqueda && coincideCategoria;
    });
  }, [productosDisponibles, busquedaProducto, categoriaFiltro]);

  const productoYaSeleccionado = (idProducto: number) => {
    return productosSeleccionados.some(
      (producto) => producto.idProducto === idProducto,
    );
  };

  const asociarProducto = (producto: ProductoCatalogo) => {
    if (productoYaSeleccionado(producto.idProducto)) {
      return;
    }

    setProductosSeleccionados((actuales) => [...actuales, producto]);
  };

  const quitarProducto = (idProducto: number) => {
    setProductosSeleccionados((actuales) =>
      actuales.filter((producto) => producto.idProducto !== idProducto),
    );
  };

  const cambiarProveedor = (idProveedor: number) => {
    setIdProveedorSeleccionado(idProveedor);
    setProductosSeleccionados([]);
  };

  const guardarAsociaciones = () => {
    if (!proveedorSeleccionado || productosSeleccionados.length === 0) {
      return;
    }

    onAsociarProductos(
      proveedorSeleccionado.idProveedor,
      productosSeleccionados,
    );
    setProductosSeleccionados([]);
  };

  return (
    <div className="asociar-catalogo-container">
      <div className="asociar-catalogo-header">
        <div>
          <span className="asociar-catalogo-subtitle">
            Gestión de proveedores
          </span>

          <h2 className="asociar-catalogo-title">Asociar Catálogo</h2>

          <p className="asociar-catalogo-description">
            Asocia productos existentes a un proveedor para registrar los
            productos que este ofrece.
          </p>
        </div>
      </div>

      <div className="asociar-catalogo-grid">
        <section className="proveedor-selector-card">
          <div className="section-heading">
            <Building2 size={18} />

            <div>
              <h3>Proveedor</h3>
              <span>
                Selecciona el proveedor al que deseas asociar productos.
              </span>
            </div>
          </div>

          <label className="form-label">Proveedor seleccionado</label>

          <div className="select-wrapper">
            <Building2 size={16} />

            <select
              value={proveedorSeleccionado?.idProveedor ?? ""}
              onChange={(e) => cambiarProveedor(Number(e.target.value))}
              disabled={proveedores.length === 0}
            >
              {proveedores.map((proveedor) => (
                <option
                  key={proveedor.idProveedor}
                  value={proveedor.idProveedor}
                >
                  {proveedor.razonSocial} ({proveedor.nitRuc})
                </option>
              ))}
            </select>
          </div>

          {proveedorSeleccionado ? (
            <div className="proveedor-seleccionado-info">
              <span>Proveedor actual</span>
              <strong>{proveedorSeleccionado.razonSocial}</strong>
              <small>NIT/RUC: {proveedorSeleccionado.nitRuc}</small>
            </div>
          ) : (
            <div className="seleccion-vacia">
              <p>No hay proveedores registrados.</p>
            </div>
          )}
        </section>

        <section className="productos-disponibles-card">
          <div className="section-heading">
            <Package size={18} />

            <div>
              <h3>Productos disponibles</h3>
              <span>Selecciona los productos que ofrece el proveedor.</span>
            </div>
          </div>

          <div className="filtros-productos">
            <div className="busqueda-productos">
              <Search size={16} />

              <input
                type="text"
                placeholder="Buscar por SKU, nombre o descripción..."
                value={busquedaProducto}
                onChange={(e) => setBusquedaProducto(e.target.value)}
              />
            </div>

            <div className="filtro-categoria">
              <Filter size={15} />

              <select
                value={categoriaFiltro}
                onChange={(e) => setCategoriaFiltro(e.target.value)}
              >
                {categoriasDisponibles.map((categoria) => (
                  <option key={categoria} value={categoria}>
                    {categoria}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {!proveedorSeleccionado || productosDisponibles.length === 0 ? (
            <div className="seleccion-vacia">
              <Package size={22} />
              <p>
                {proveedores.length === 0
                  ? "No hay proveedores registrados."
                  : "No hay productos disponibles para asociar a este proveedor."}
              </p>
            </div>
          ) : <div className="productos-tabla-wrapper">
            <table className="productos-tabla">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Acción</th>
                </tr>
              </thead>

              <tbody>
                {productosFiltrados.length > 0 ? (
                  productosFiltrados.map((producto) => {
                    const seleccionado = productoYaSeleccionado(
                      producto.idProducto,
                    );

                    return (
                      <tr key={producto.idProducto}>
                        <td>
                          <span className="sku-badge">{producto.sku}</span>
                        </td>

                        <td>
                          <div className="producto-info">
                            <strong>{producto.nombre}</strong>
                            <span>{producto.descripcion}</span>
                          </div>
                        </td>

                        <td>
                          <span className="categoria-badge">
                            {producto.categoria}
                          </span>
                        </td>

                        <td>{producto.precioPactado.toFixed(2)} Bs.</td>

                        <td>
                          <button
                            type="button"
                            className={
                              seleccionado
                                ? "producto-action seleccionado"
                                : "producto-action"
                            }
                            disabled={seleccionado}
                            onClick={() => asociarProducto(producto)}
                          >
                            {seleccionado ? (
                              <>
                                <Check size={14} />
                                Asociado
                              </>
                            ) : (
                              <>
                                <Plus size={14} />
                                Asociar
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="tabla-vacia">
                      No se encontraron productos que coincidan con la búsqueda o categoría.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>}
        </section>
      </div>

      <section className="productos-seleccionados-card">
        <div className="productos-seleccionados-header">
          <div className="section-heading">
            <Check size={18} />

            <div>
              <h3>Productos seleccionados</h3>
              <span>Productos que serán asociados al proveedor.</span>
            </div>
          </div>

          <span className="contador-productos">
            {productosSeleccionados.length} seleccionados
          </span>
        </div>

        {productosSeleccionados.length > 0 ? (
          <div className="productos-seleccionados-lista">
            {productosSeleccionados.map((producto) => (
              <div className="producto-seleccionado" key={producto.idProducto}>
                <div>
                  <strong>{producto.nombre}</strong>
                  <span>
                    {producto.sku} · {producto.categoria}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => quitarProducto(producto.idProducto)}
                  title="Quitar producto"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="seleccion-vacia">
            <Package size={22} />

            <p>Todavía no has seleccionado productos para este proveedor.</p>
          </div>
        )}

        <div className="asociar-footer">
          <button
            type="button"
            className="btn-asociar"
            disabled={!proveedorSeleccionado || productosSeleccionados.length === 0}
            onClick={guardarAsociaciones}
          >
            <Check size={16} />
            Asociar productos
          </button>
        </div>
      </section>
    </div>
  );
};

export default AsociarCatalogo;
