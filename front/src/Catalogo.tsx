import React, { useState } from 'react';
import { LineSidebar } from './LineSidebar';
import './Catalogo.css';

const menuItems = [
  'Gestionar Proveedores',
  'Asociar Catálogo',
  'Ver Información',
  'Ver Catálogo',
  'Ranking'
];

export const Catalogo = () => {
  const [activeIndex, setActiveIndex] = useState<number>(0);

  return (
    <div className="catalogo-container">
      <aside className="catalogo-sidebar">
        <LineSidebar
          items={menuItems}
          defaultActive={activeIndex}
          onItemClick={(index) => setActiveIndex(index)}
        />
      </aside>

      <section className="catalogo-content">
        <h1 className="catalogo-title">{menuItems[activeIndex]}</h1>
        <div className="catalogo-card">
          <p className="catalogo-card-text">
            Contenido correspondiente a: {menuItems[activeIndex]}
          </p>
        </div>
      </section>
    </div>
  );
};

export default Catalogo;