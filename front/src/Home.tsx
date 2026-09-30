import React from 'react';
import TextType from './TextType';
import GradientWaves from './GradientWaves';
import { useTheme } from './ThemeContext';
import './Home.css';
import SpotlightCard from './SpotlightCard';
import { ArrowRight, PackageCheck, ShieldCheck, Truck, BarChart3, CheckCircle2 } from 'lucide-react';

interface HomeProps {
    onNavigateToCatalogo?: () => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigateToCatalogo }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

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
                            /* hijas cambien lo que vean aki no se k poner xdxxddxdd */
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
                        Sistema orientado a la gestion de compras y proveedores.
                    </p>
                </div>
            </div>

            <section className="home-catalogo-section">
                <div className="section-header">
                    <h2 className="section-subtitle">Proveedores y Catálogo</h2>
                    <p className="section-description">
                        Apartado para poder gestionar proveedores y poder tomar decisiones informadas
                    </p>
                </div>

                <div className="catalogo-grid-container">
                    <div className="catalogo-card-wrapper">
                        <SpotlightCard
                            className="spotlight-catalogo-card spotlight-with-bg"
                            spotlightColor={isDark ? 'rgba(56, 189, 248, 0.4)' : 'rgba(255, 255, 255, 0.5)'}
                        >
                            <div className="spotlight-bg-overlay" />
                            <div className="spotlight-card-content">
                                <div className="spotlight-card-header">
                                    <PackageCheck size={28} className="spotlight-card-icon" />
                                    <span className="spotlight-badge">Vista Previa</span>
                                </div>

                                <div className="spotlight-card-bottom">
                                    <h3 className="spotlight-card-title-img">Gestión de proveedores y catalogo</h3>
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
                            <span>Catalogo</span>
                        </div>

                        <h3 className="presentation-title">
                            Proveedores y Catalogo
                        </h3>

                        <p className="presentation-text">
                            Optimice las compras tomando decisiones informadas basandose en los hechos y el historial de los proveedores del supermercado.
                        </p>

                        <div className="presentation-highlights">
                            <div className="highlight-item">
                                <CheckCircle2 size={18} className="highlight-icon" />
                                <div>
                                    <strong className="highlight-title">Control de proveedores</strong>
                                    <span className="highlight-desc">Poder verificar y actualizar informacion relevante de los proveedores</span>
                                </div>
                            </div>

                            <div className="highlight-item">
                                <Truck size={18} className="highlight-icon" />
                                <div>
                                    <strong className="highlight-title">Asociacion y Comparacion de Catalogo</strong>
                                    <span className="highlight-desc">Poder ver que proveedor tiene la mejor oferta en cuanto a su catalogo</span>
                                </div>
                            </div>

                            <div className="highlight-item">
                                <BarChart3 size={18} className="highlight-icon" />
                                <div>
                                    <strong className="highlight-title">Ranking de Desempeño:</strong>
                                    <span className="highlight-desc">Poder ver el desempenio de los proveedores </span>
                                </div>
                            </div>
                        </div>

                        <div className="presentation-action">
                            <button
                                className="btn-ir-catalogo"
                                onClick={onNavigateToCatalogo}
                            >
                                <span>Ver mas</span>
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;