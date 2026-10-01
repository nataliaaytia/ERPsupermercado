import { ChevronLeft, ChevronRight } from 'lucide-react';

import { LineSidebar } from './LineSidebar';

import './CatalogoSidebar.css';

interface CatalogoSidebarProps {
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
    onItemClick
}: CatalogoSidebarProps) => {
  return (
    <aside
      className={`catalogo-sidebar ${
        abierto ? '' : 'catalogo-sidebar--cerrado'
      }`}
    >
      <div className="catalogo-sidebar__contenido">
        <LineSidebar
          items={items}
          defaultActive={activeIndex}
          onItemClick={onItemClick}
        />
      </div>

      <button
        type="button"
        className="catalogo-sidebar__toggle"
        onClick={onToggle}
        aria-label={abierto ? 'Ocultar menú' : 'Mostrar menú'}
        title={abierto ? 'Ocultar menú' : 'Mostrar menú'}
      >
        {abierto ? (
          <ChevronLeft size={16} />
        ) : (
          <ChevronRight size={16} />
        )}
      </button>
    </aside>
  );
};

export default CatalogoSidebar;