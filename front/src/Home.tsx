import React from 'react';
import TextType from './TextType';
import GradientWaves from './GradientWaves';
import { useTheme } from './ThemeContext';
import './Home.css';

export const Home = () => {
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
                            'Bienvenido a nuestra plataforma',
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
    );
};

export default Home;