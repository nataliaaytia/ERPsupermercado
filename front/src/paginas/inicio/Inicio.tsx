import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { modulos } from '../../app/modulos';
import GradientWaves from '../../componentes/efectos/GradientWaves';
import SpotlightCard from '../../componentes/efectos/SpotlightCard';
import TextType from '../../componentes/efectos/TextType';
import { useSesion } from '../../contexto/SesionContext';
import { useVariablesCss } from '../../hooks/useVariableCss';
import './Inicio.css';

const COLORES_ONDA = ['onda-horizonte', 'onda-color', 'onda-cresta'] as const;

/** Portada: presenta el sistema, el flujo del proceso de compra y los módulos. */
export default function Inicio() {
  const { usuario } = useSesion();
  const colores = useVariablesCss(COLORES_ONDA);
  const destinoInicial = usuario ? modulos[0].ruta : '/login';

  return (
    <div className="inicio">
      <section className="inicio__hero">
        <div className="inicio__fondo" aria-hidden="true">
          <GradientWaves
            horizonColor={colores['onda-horizonte']}
            waveColor={colores['onda-color']}
            crestColor={colores['onda-cresta']}
            speed={0.35}
            amplitude={2.2}
            mouseInteraction
          />
        </div>

        <div className="inicio__hero-contenido">
          <p className="inicio__etiqueta">ERP · Supermercado</p>
          <h1 className="inicio__titulo">
            <TextType
              text={['Gestión de compras y proveedores', 'De la requisición a la factura', 'Todo en un solo lugar']}
              typingSpeed={70}
              pauseDuration={1800}
              deletingSpeed={40}
              loop
              showCursor
              cursorCharacter="|"
            />
          </h1>
          <p className="inicio__subtitulo">
            Centraliza proveedores, requisiciones, cotizaciones, órdenes de compra, recepción de mercadería y
            validación de facturas, con trazabilidad en cada etapa.
          </p>
          <Link to={destinoInicial} className="inicio__cta">
            {usuario ? 'Ir al sistema' : 'Iniciar sesión'} <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="inicio__seccion" aria-labelledby="flujo-titulo">
        <h2 id="flujo-titulo" className="inicio__seccion-titulo">
          Cómo fluye una compra
        </h2>
        <ol className="inicio__flujo">
          {modulos.map((modulo, indice) => {
            const Icono = modulo.icono;
            return (
              <li key={modulo.id} className="inicio__paso">
                <span className="inicio__paso-numero">{indice + 1}</span>
                <Icono size={22} aria-hidden="true" />
                <strong>{modulo.titulo}</strong>
                <span>{modulo.secciones.filter((s) => !s.oculta).map((s) => s.etiqueta).slice(0, 3).join(' · ')}</span>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="inicio__seccion" aria-labelledby="modulos-titulo">
        <h2 id="modulos-titulo" className="inicio__seccion-titulo">
          Módulos
        </h2>
        <div className="inicio__modulos">
          {modulos.map((modulo) => {
            const Icono = modulo.icono;
            return (
              <SpotlightCard key={modulo.id} className="inicio__modulo">
                <div className="inicio__modulo-imagen" style={{ backgroundImage: `url(${modulo.imagen})` }} />
                <div className="inicio__modulo-cuerpo">
                  <h3>
                    <Icono size={18} aria-hidden="true" /> {modulo.titulo}
                  </h3>
                  <p>{modulo.descripcion}</p>
                  <Link to={modulo.ruta} className="inicio__modulo-enlace">
                    Abrir módulo <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </div>
              </SpotlightCard>
            );
          })}
        </div>
      </section>
    </div>
  );
}
