import { useRef, type MouseEvent, type ReactNode } from 'react';
import './SpotlightCard.css';

interface Props {
  children: ReactNode;
  className?: string;
}

/** Tarjeta con un halo de luz que sigue al cursor (color: --spotlight del tema). */
export default function SpotlightCard({ children, className = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const moverLuz = (evento: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    ref.current.style.setProperty('--mouse-x', `${evento.clientX - rect.left}px`);
    ref.current.style.setProperty('--mouse-y', `${evento.clientY - rect.top}px`);
  };

  return (
    <div ref={ref} onMouseMove={moverLuz} className={`card-spotlight ${className}`}>
      {children}
    </div>
  );
}
