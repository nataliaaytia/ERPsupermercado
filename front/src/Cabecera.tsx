import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeContext';
import './Cabecera.css';

interface CabeceraProps {
    currentPage?: string;
    onNavigate: (page: string) => void;
}

export const Cabecera: React.FC<CabeceraProps> = ({ currentPage, onNavigate }) => {
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="cabecera-container">
            <div className="cabecera-content">
                <div
                    className="cabecera-brand"
                    onClick={() => onNavigate('home')}
                    role="button"
                    tabIndex={0}
                >
                    <span className="brand-dot" />
                    <span className="brand-title">COMPRAS Y PROVEEDORES</span>
                </div>

                <nav className="cabecera-nav">
                    <button
                        className={`cabecera-link ${currentPage === 'catalogo' ? 'active' : ''}`}
                        onClick={() => onNavigate('catalogo')}
                    >
                        Catálogo
                    </button>
                </nav>

                <div className="cabecera-actions">
                    <button
                        className="cabecera-btn-login"
                        onClick={() => onNavigate('login')}
                    >
                        Iniciar sesión
                    </button>

                    <button
                        className="theme-toggle-btn"
                        onClick={toggleTheme}
                        aria-label="Cambiar tema"
                        title={theme === 'dark' ? 'Modo Día' : 'Modo Noche'}
                    >
                        {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Cabecera;