import { ChevronLeft, ChevronRight, Package, Truck, X } from "lucide-react";
import type { ProductoCatalogo } from "./tipos";
import { useModal } from "./useModal";
import { useId } from "react";
import "./ProductoDetalle.css";
interface ProductoDetalleProps {
  producto: ProductoCatalogo;
  productos: ProductoCatalogo[];
  onCerrar: () => void;
  onCambiarProducto: (producto: ProductoCatalogo) => void;
}
const ProductoDetalle = ({
  producto,
  productos,
  onCerrar,
  onCambiarProducto,
}: ProductoDetalleProps) => {
  const dialogRef = useModal();
  const tituloId = useId();
  const indiceActual = productos.findIndex(
    (item) => item.idProducto === producto.idProducto,
  );
  const tieneAnterior = indiceActual > 0;
  const tieneSiguiente =
    indiceActual >= 0 && indiceActual < productos.length - 1;
  const irAnterior = () => {
    if (tieneAnterior) {
      onCambiarProducto(productos[indiceActual - 1]);
    }
  };
  const irSiguiente = () => {
    if (tieneSiguiente) {
      onCambiarProducto(productos[indiceActual + 1]);
    }
  };
  return (
    <dialog
      ref={dialogRef}
      className="catalogo-dialog producto-detalle-modal"
      aria-labelledby={tituloId}
      onCancel={onCerrar}
    >
      <div className="modal-header">
        <div>
          <span className="modal-subtitle">Detalle del producto</span>
          <h2 id={tituloId} className="modal-title">
            {producto.nombre}
          </h2>
          <span className="sku-badge">{producto.sku}</span>
        </div>

        <button
          className="btn-close-modal"
          onClick={onCerrar}
          aria-label="Cerrar detalle"
        >
          <X size={18} />
        </button>
      </div>

      <div className="producto-detalle-descripcion">
        <span className="field-label">Descripción</span>
        <p>{producto.descripcion}</p>
      </div>

      <div className="producto-detalle-grid">
        <div className="dato-field">
          <span className="field-label">Categoría</span>
          <span className="field-value">{producto.categoria}</span>
        </div>

        <div className="dato-field precio-pactado-detalle">
          <div className="precio-pactado-header">
            <span className="field-label">Precio pactado</span>
            <span className="precio-pactado-vigente">Vigente</span>
          </div>

          <span className="precio-pactado-valor">
            {producto.precioPactado.toFixed(2)} Bs.
          </span>

          <span className="precio-pactado-unidad">
            por {producto.unidadMedida}
          </span>
        </div>

        <div className="dato-field">
          <span className="field-label">Tiempo estimado de entrega</span>
          <span className="field-value producto-detalle-icono">
            <Truck size={16} />
            {producto.tiempoEntregaEstimado}
          </span>
        </div>

        <div className="dato-field">
          <span className="field-label">Stock disponible</span>
          <span className="field-value producto-detalle-icono">
            <Package size={16} />
            {producto.stockDisponible} {producto.unidadMedida}
          </span>
        </div>
      </div>

      <div className="producto-detalle-navegacion">
        <button
          className="btn-producto-nav"
          onClick={irAnterior}
          disabled={!tieneAnterior}
        >
          <ChevronLeft size={16} />
          Anterior
        </button>

        <span className="producto-contador">
          {indiceActual + 1} de {productos.length}
        </span>

        <button
          className="btn-producto-nav"
          onClick={irSiguiente}
          disabled={!tieneSiguiente}
        >
          Siguiente
          <ChevronRight size={16} />
        </button>
      </div>
    </dialog>
  );
};
export default ProductoDetalle;
