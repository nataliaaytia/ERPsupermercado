import { useState } from "react";
import CatalogoSidebar from "./CatalogoSidebar";
import AsociarCatalogo from "./AsociarCatalogo";
import { ComparacionProductos } from "./ComparacionProductos";
import GestionProveedores from "./GestionProveedores";
import VerCatalogo from "./VerCatalogo";
import RankingProveedores from "./RankingProveedores";
import ReportesProveedores from "./ReportesProveedores";
import { useProveedores } from "./useProveedores";
import "./Catalogo.css";
const menuItems = [
  "Gestionar proveedores",
  "Asociar catálogo",
  "Comparación de productos",
  "Ver catálogo",
  "Ranking de proveedores",
  "Reportes",
];
export const Catalogo = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const {
    proveedores,
    proveedorSeleccionado,
    setIdSeleccionado,
    cambiarEstado,
    registrarDocumento,
    registrarProveedor,
    asociar,
  } = useProveedores();
  return (
    <div className="catalogo-container">
      <CatalogoSidebar
        items={menuItems}
        activeIndex={activeIndex}
        abierto={sidebarAbierto}
        onToggle={() => setSidebarAbierto((abierto) => !abierto)}
        onItemClick={setActiveIndex}
      />
      <section className="catalogo-content">
        <header className="catalogo-header">
          <p className="catalogo-subtitle">Proveedores y compras</p>
          <h1 className="catalogo-title">{menuItems[activeIndex]}</h1>
        </header>
        <div className="catalogo-vista" key={activeIndex}>
          {activeIndex === 0 && (
            <GestionProveedores
              proveedores={proveedores}
              proveedorSeleccionado={proveedorSeleccionado}
              onSeleccionar={setIdSeleccionado}
              cambiarEstadoProveedor={cambiarEstado}
              onRegistrarDocumento={registrarDocumento}
              onRegistrarProveedor={registrarProveedor}
            />
          )}
          {activeIndex === 1 && (
            <AsociarCatalogo
              proveedores={proveedores}
              onAsociarProductos={asociar}
            />
          )}
          {activeIndex === 2 && (
            <ComparacionProductos proveedores={proveedores} />
          )}
          {activeIndex === 3 && (
            <VerCatalogo
              proveedores={proveedores}
              proveedorSeleccionado={proveedorSeleccionado}
              onSeleccionar={setIdSeleccionado}
            />
          )}
          {activeIndex === 4 && (
            <RankingProveedores proveedores={proveedores} />
          )}
          {activeIndex === 5 && (
            <ReportesProveedores proveedores={proveedores} />
          )}
        </div>
      </section>
    </div>
  );
};
export default Catalogo;
