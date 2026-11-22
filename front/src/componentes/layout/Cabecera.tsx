import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LogIn, LogOut, Menu, Moon, RotateCcw, Sun, X } from 'lucide-react';
import { useSesion } from '../../contexto/SesionContext';
import { useTema } from '../../contexto/TemaContext';
import { modulos } from '../../app/modulos';
import { reiniciarEstado } from '../../estado/almacenCompras';
import { cargarTodo } from '../../servicios/sincronizacion';
import './Cabecera.css';

/** Barra superior común a todas las pantallas. */
export default function Cabecera() {
  const { tema, alternarTema } = useTema();
  const { usuario, cerrarSesion } = useSesion();
  const navegar = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const recargarDatos = () => {
    reiniciarEstado();
    void cargarTodo();
  };

  const salir = () => {
    cerrarSesion();
    navegar('/login');
  };

  return (
    <header className="cabecera">
      <div className="cabecera__contenido">
        <Link to="/" className="cabecera__marca">
          <span className="cabecera__punto" aria-hidden="true" />
          <span>COMPRAS Y PROVEEDORES</span>
        </Link>

        <nav
          id="cabecera-navegacion"
          className={`cabecera__nav ${menuAbierto ? 'cabecera__nav--abierta' : ''}`}
          aria-label="Módulos"
          onClick={() => setMenuAbierto(false)}
        >
          {modulos.map((modulo) => (
            <NavLink
              key={modulo.id}
              to={modulo.ruta}
              className={({ isActive }) => `cabecera__enlace ${isActive ? 'cabecera__enlace--activo' : ''}`}
            >
              {modulo.titulo}
            </NavLink>
          ))}
        </nav>

        <div className="cabecera__acciones">
          {usuario ? (
            <>
              <span className="cabecera__usuario" title={usuario.rol}>
                <strong>{usuario.nombre}</strong>
                <small>{usuario.rol}</small>
              </span>
              <button
                type="button"
                className="cabecera__boton"
                onClick={recargarDatos}
                aria-label="Volver a cargar los datos"
                title="Volver a cargar los datos"
              >
                <RotateCcw size={16} />
              </button>
              <button type="button" className="cabecera__boton" onClick={salir} aria-label="Cerrar sesión" title="Cerrar sesión">
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <Link to="/login" className="cabecera__boton cabecera__boton--texto">
              <LogIn size={16} /> Iniciar sesión
            </Link>
          )}

          <button
            type="button"
            className="cabecera__boton"
            onClick={alternarTema}
            aria-label={tema === 'dark' ? 'Cambiar a modo día' : 'Cambiar a modo noche'}
            title={tema === 'dark' ? 'Modo día' : 'Modo noche'}
          >
            {tema === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <button
            type="button"
            className="cabecera__boton cabecera__hamburguesa"
            onClick={() => setMenuAbierto((actual) => !actual)}
            aria-expanded={menuAbierto}
            aria-controls="cabecera-navegacion"
            aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
          >
            {menuAbierto ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
}
