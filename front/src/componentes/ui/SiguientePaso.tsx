import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import './SiguientePaso.css';

interface Props {
  /** Explicación breve de lo que sigue en el flujo. */
  texto: string;
  /** Ruta de la pantalla siguiente. */
  a: string;
  etiqueta: string;
}

/** Aviso que guía al usuario a la siguiente etapa del proceso de compra. */
export default function SiguientePaso({ texto, a, etiqueta }: Props) {
  return (
    <aside className="siguiente-paso" aria-label="Siguiente paso">
      <div>
        <strong>Siguiente paso</strong>
        <p>{texto}</p>
      </div>
      <Link to={a} className="siguiente-paso__enlace">
        {etiqueta} <ArrowRight size={16} aria-hidden="true" />
      </Link>
    </aside>
  );
}
