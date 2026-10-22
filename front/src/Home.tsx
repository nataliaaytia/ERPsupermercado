
import React, { useState } from 'react';
import TextType from './TextType';
import GradientWaves from './GradientWaves';
import { useTheme } from './ThemeContext';
import './Home.css';
import SpotlightCard from './SpotlightCard';
import {
    ArrowRight,
    ArrowLeft,
    PackageCheck,
    ShieldCheck,
    Truck,
    BarChart3,
    CheckCircle2,
    ClipboardList,
    FileText,
    CalendarClock,
    ClipboardCheck
} from 'lucide-react';

interface HomeProps {
    onNavigateToCatalogo?: () => void;
    onNavigateToRequisiciones?: () => void;
}

export const Home: React.FC<HomeProps> = ({
    onNavigateToCatalogo,
    onNavigateToRequisiciones
}) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const [moduloActivo, setModuloActivo] = useState(0);

    const waveColors = isDark
        ? {
            horizonColor: '#0a1120',
            waveColor: '#1d4ed8',
            crestColor: '#38bdf8'
        }
        : {
            horizonColor: '#f7f5f0',
            waveColor: '#bae6fd',
            crestColor: '#38bdf8'
        };

    const cambiarModulo = (direccion: number) => {
        setModuloActivo(actual => (actual + direccion + 2) % 2);
    };

    return (
        <div className="home-container">
            <div className="home-hero-section">
                <div className="home-background">
                    <GradientWaves
                        horizonColor={waveColors.horizonColor}
                        waveColor={waveColors.waveColor}
                        crestColor={waveColors.crestColor}
                        speed={0.35}
                        amplitude={2.2}
                        mouseInteraction={true}
                    />
                </div>

                <div className="home-content">
                    <h1 className="home-title">
                        <TextType
                            text={[
                                'Bienvenido a este sistema',
                                'Gestión de compras y proveedores',
                                'Todo en un solo lugar'
                            ]}
                            typingSpeed={70}
                            pauseDuration={1800}
                            deletingSpeed={40}
                            loop={true}
                            showCursor={true}
                            cursorCharacter="|"
                        />
                    </h1>

                    <p className="home-subtitle">
                        Sistema orientado a la gestión de compras y proveedores.
                    </p>
                </div>
            </div>

            <section className="home-catalogo-section">
                <div className="home-carousel-heading">
                    <h2 className="home-carousel-title">
                        Explora nuestros módulos
                    </h2>

                    <div className="home-carousel-controls">
                        <button
                            type="button"
                            className="home-carousel-arrow"
                            onClick={() => cambiarModulo(-1)}
                            aria-label="Módulo anterior"
                        >
                            <ArrowLeft size={20} />
                        </button>

                        <button
                            type="button"
                            className="home-carousel-arrow"
                            onClick={() => cambiarModulo(1)}
                            aria-label="Módulo siguiente"
                        >
                            <ArrowRight size={20} />
                        </button>
                    </div>
                </div>

                <div className="home-carousel-viewport">
                    <div
                        className="home-carousel-track"
                        style={{
                            transform: `translateX(-${moduloActivo * 50}%)`
                        }}
                    >
                        <div className="home-carousel-slide">
                            <div className="section-header">
                                <h2 className="section-subtitle">
                                    Proveedores y Catálogo
                                </h2>

                                <p className="section-description">
                                    Apartado para poder gestionar proveedores y
                                    poder tomar decisiones informadas
                                </p>
                            </div>

                            <div className="catalogo-grid-container">
                                <div className="catalogo-card-wrapper">
                                    <SpotlightCard
                                        className="spotlight-catalogo-card spotlight-with-bg"
                                        spotlightColor={
                                            isDark
                                                ? 'rgba(56, 189, 248, 0.4)'
                                                : 'rgba(255, 255, 255, 0.5)'
                                        }
                                    >
                                        <div className="spotlight-bg-overlay" />

                                        <div className="spotlight-card-content">
                                            <div className="spotlight-card-header">
                                                <PackageCheck
                                                    size={28}
                                                    className="spotlight-card-icon"
                                                />

                                                <span className="spotlight-badge">
                                                    Vista Previa
                                                </span>
                                            </div>

                                            <div className="spotlight-card-bottom">
                                                <h3 className="spotlight-card-title-img">
                                                    Gestión de proveedores y catálogo
                                                </h3>

                                                <p className="spotlight-card-subtitle-img">
                                                    Monitoreo, controles y dashboards interactivos
                                                </p>
                                            </div>
                                        </div>
                                    </SpotlightCard>
                                </div>

                                <div className="catalogo-presentation-container">
                                    <div className="presentation-badge">
                                        <ShieldCheck size={16} />
                                        <span>Catálogo</span>
                                    </div>

                                    <h3 className="presentation-title">
                                        Proveedores y Catálogo
                                    </h3>

                                    <p className="presentation-text">
                                        Optimice las compras tomando decisiones
                                        informadas basándose en los hechos y el
                                        historial de los proveedores del supermercado.
                                    </p>

                                    <div className="presentation-highlights">
                                        <div className="highlight-item">
                                            <CheckCircle2
                                                size={18}
                                                className="highlight-icon"
                                            />

                                            <div>
                                                <strong className="highlight-title">
                                                    Control de proveedores
                                                </strong>

                                                <span className="highlight-desc">
                                                    Poder verificar y actualizar información
                                                    relevante de los proveedores
                                                </span>
                                            </div>
                                        </div>

                                        <div className="highlight-item">
                                            <Truck
                                                size={18}
                                                className="highlight-icon"
                                            />

                                            <div>
                                                <strong className="highlight-title">
                                                    Asociación y Comparación de Catálogo
                                                </strong>

                                                <span className="highlight-desc">
                                                    Poder ver qué proveedor tiene la mejor
                                                    oferta en cuanto a su catálogo
                                                </span>
                                            </div>
                                        </div>

                                        <div className="highlight-item">
                                            <BarChart3
                                                size={18}
                                                className="highlight-icon"
                                            />

                                            <div>
                                                <strong className="highlight-title">
                                                    Ranking de Desempeño:
                                                </strong>

                                                <span className="highlight-desc">
                                                    Poder ver el desempeño de los proveedores
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="presentation-action">
                                        <button
                                            type="button"
                                            className="btn-ir-catalogo"
                                            onClick={onNavigateToCatalogo}
                                        >
                                            <span>Ver más</span>
                                            <ArrowRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="home-carousel-slide">
                            <div className="section-header">
                                <h2 className="section-subtitle">
                                    Requisiciones y Cotizaciones
                                </h2>

                                <p className="section-description">
                                    Gestiona solicitudes de compra, cotizaciones
                                    y ofertas de proveedores desde un solo lugar
                                </p>
                            </div>

                            <div className="catalogo-grid-container">
                                <div className="catalogo-card-wrapper">
                                    <SpotlightCard
                                        className="spotlight-catalogo-card spotlight-with-bg spotlight-requisiciones-card"
                                        spotlightColor={
                                            isDark
                                                ? 'rgba(56, 189, 248, 0.4)'
                                                : 'rgba(255, 255, 255, 0.5)'
                                        }
                                    >
                                        <div className="spotlight-bg-overlay" />

                                        <div className="spotlight-card-content">
                                            <div className="spotlight-card-header">
                                                <ClipboardList
                                                    size={28}
                                                    className="spotlight-card-icon"
                                                />

                                                <span className="spotlight-badge">
                                                    Vista Previa
                                                </span>
                                            </div>

                                            <div className="spotlight-card-bottom">
                                                <h3 className="spotlight-card-title-img">
                                                    Gestión de requisiciones y cotizaciones
                                                </h3>

                                                <p className="spotlight-card-subtitle-img">
                                                    Solicitudes, seguimiento y ofertas de proveedores
                                                </p>
                                            </div>
                                        </div>
                                    </SpotlightCard>
                                </div>

                                <div className="catalogo-presentation-container">
                                    <div className="presentation-badge">
                                        <ClipboardList size={16} />
                                        <span>Requisiciones</span>
                                    </div>

                                    <h3 className="presentation-title">
                                        Requisiciones y Cotizaciones
                                    </h3>

                                    <p className="presentation-text">
                                        Organice las necesidades de compra del
                                        supermercado y gestione las solicitudes de
                                        cotización y las ofertas recibidas de los
                                        proveedores.
                                    </p>

                                    <div className="presentation-highlights">
                                        <div className="highlight-item">
                                            <FileText
                                                size={18}
                                                className="highlight-icon"
                                            />

                                            <div>
                                                <strong className="highlight-title">
                                                    Gestión de requisiciones
                                                </strong>

                                                <span className="highlight-desc">
                                                    Registrar y consultar solicitudes de compra
                                                    y realizar su seguimiento
                                                </span>
                                            </div>
                                        </div>

                                        <div className="highlight-item">
                                            <CalendarClock
                                                size={18}
                                                className="highlight-icon"
                                            />

                                            <div>
                                                <strong className="highlight-title">
                                                    Solicitudes de cotización
                                                </strong>

                                                <span className="highlight-desc">
                                                    Gestionar proveedores, fechas límite
                                                    y periodos de recepción de ofertas
                                                </span>
                                            </div>
                                        </div>

                                        <div className="highlight-item">
                                            <ClipboardCheck
                                                size={18}
                                                className="highlight-icon"
                                            />

                                            <div>
                                                <strong className="highlight-title">
                                                    Gestión de ofertas
                                                </strong>

                                                <span className="highlight-desc">
                                                    Registrar, revisar y comparar las
                                                    propuestas de los proveedores
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="presentation-action">
                                        <button
                                            type="button"
                                            className="btn-ir-catalogo"
                                            onClick={onNavigateToRequisiciones}
                                        >
                                            <span>Ver más</span>
                                            <ArrowRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    className="home-carousel-indicators"
                    aria-label="Seleccionar módulo"
                >
                    <button
                        type="button"
                        className={`home-carousel-dot ${moduloActivo === 0 ? 'active' : ''}`}
                        onClick={() => setModuloActivo(0)}
                        aria-label="Mostrar Proveedores y Catálogo"
                        aria-pressed={moduloActivo === 0}
                    />

                    <button
                        type="button"
                        className={`home-carousel-dot ${moduloActivo === 1 ? 'active' : ''}`}
                        onClick={() => setModuloActivo(1)}
                        aria-label="Mostrar Requisiciones y Cotizaciones"
                        aria-pressed={moduloActivo === 1}
                    />
                </div>
            </section>
        </div>
    );
};

export default Home;
