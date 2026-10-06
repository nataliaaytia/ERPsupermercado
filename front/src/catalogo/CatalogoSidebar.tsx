import { ChevronLeft, ChevronRight } from "lucide-react";
import "./CatalogoSidebar.css";
interface Props {
  items: string[];
  activeIndex: number;
  abierto: boolean;
  onToggle: () => void;
  onItemClick?: (index: number) => void;
}
export const CatalogoSidebar = ({
  items,
  activeIndex,
  abierto,
  onToggle,
  onItemClick,
}: Props) => (
  <aside
    className={`catalogo-sidebar ${abierto ? "" : "catalogo-sidebar--cerrado"}`}
  >
    <nav
      className="catalogo-sidebar__contenido"
      aria-label="Secciones del catálogo"
      hidden={!abierto}
    >
      <span className="catalogo-sidebar__label">Administración</span>
      {items.map((item, index) => (
        <button
          type="button"
          key={item}
          className="catalogo-sidebar__item"
          aria-current={activeIndex === index ? "page" : undefined}
          onClick={() => onItemClick?.(index)}
        >
          {item}
        </button>
      ))}
    </nav>
    <button
      type="button"
      className="catalogo-sidebar__toggle"
      onClick={onToggle}
      aria-expanded={abierto}
      aria-label={abierto ? "Ocultar menú" : "Mostrar menú"}
    >
      {abierto ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
    </button>
  </aside>
);
export default CatalogoSidebar;
