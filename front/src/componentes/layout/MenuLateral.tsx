import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ModuloConfig } from '../../app/tiposModulo';
import './MenuLateral.css';

const CLAVE_MENU = 'erp-menu-lateral-abierto';

function leerPreferencia(): boolean {
  try {
    return localStorage.getItem(CLAVE_MENU) !== 'false';
  } catch {
    return true;
  }
}

interface Props {
  modulo: ModuloConfig;
}

/** Menú lateral con las secciones del módulo actual, en el orden del flujo. */
export default function MenuLateral({ modulo }: Props) {
  const [abierto, setAbierto] = useState(leerPreferencia);
  const Icono = modulo.icono;

  const alternar = () => {
    setAbierto((actual) => {
      try {
        localStorage.setItem(CLAVE_MENU, String(!actual));
      } catch {
        // Preferencia solo en memoria.
      }
      return !actual;
    });
  };

  const secciones = modulo.secciones.filter((seccion) => !seccion.oculta);

  return (
    <aside className={`menu-lateral ${abierto ? '' : 'menu-lateral--cerrado'}`}>
      <div className="menu-lateral__cabecera">
        <Icono size={18} aria-hidden="true" />
        <span className="menu-lateral__texto">{modulo.titulo}</span>
      </div>

      <nav className="menu-lateral__opciones" aria-label={`Secciones de ${modulo.titulo}`}>
        {secciones.map((seccion, indice) => (
          <NavLink
            key={seccion.ruta}
            to={`${modulo.ruta}/${seccion.ruta}`}
            className={({ isActive }) => `menu-lateral__opcion ${isActive ? 'menu-lateral__opcion--activa' : ''}`}
            title={abierto ? undefined : seccion.etiqueta}
          >
            <span className="menu-lateral__paso">{indice + 1}</span>
            <span className="menu-lateral__texto">{seccion.etiqueta}</span>
          </NavLink>
        ))}
      </nav>

      <button
        type="button"
        className="menu-lateral__alternar"
        onClick={alternar}
        aria-expanded={abierto}
        aria-label={abierto ? 'Contraer menú' : 'Expandir menú'}
      >
        {abierto ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>
    </aside>
  );
}
