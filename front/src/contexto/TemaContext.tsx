import { createContext, useCallback, useContext, useEffect, useMemo, useState, type MouseEvent, type ReactNode } from 'react';

export type Tema = 'light' | 'dark';

const CLAVE_TEMA = 'erp-tema';

interface TemaContextValor {
  tema: Tema;
  alternarTema: (evento?: MouseEvent<HTMLElement>) => void;
}

const TemaContext = createContext<TemaContextValor | undefined>(undefined);

function temaInicial(): Tema {
  try {
    const guardado = localStorage.getItem(CLAVE_TEMA);
    if (guardado === 'light' || guardado === 'dark') return guardado;
  } catch {
    // Sin almacenamiento se usa la preferencia del sistema.
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function TemaProvider({ children }: { children: ReactNode }) {
  const [tema, setTema] = useState<Tema>(temaInicial);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', tema);
    try {
      localStorage.setItem(CLAVE_TEMA, tema);
    } catch {
      // El tema se aplica igual aunque no se pueda guardar.
    }
  }, [tema]);

  /** Cambia el tema con una transición circular que nace donde se hizo clic. */
  const alternarTema = useCallback((evento?: MouseEvent<HTMLElement>) => {
    const cambiar = () => setTema((actual) => (actual === 'light' ? 'dark' : 'light'));

    const reducirMovimiento = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!document.startViewTransition || !evento || reducirMovimiento) {
      cambiar();
      return;
    }

    const x = evento.clientX;
    const y = evento.clientY;
    const radio = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

    const transicion = document.startViewTransition(cambiar);
    transicion.ready
      .then(() => {
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radio}px at ${x}px ${y}px)`] },
          { duration: 450, easing: 'ease-in-out', pseudoElement: '::view-transition-new(root)' },
        );
      })
      .catch(() => undefined);
  }, []);

  const valor = useMemo(() => ({ tema, alternarTema }), [tema, alternarTema]);

  return <TemaContext.Provider value={valor}>{children}</TemaContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTema(): TemaContextValor {
  const contexto = useContext(TemaContext);
  if (!contexto) throw new Error('useTema debe usarse dentro de TemaProvider');
  return contexto;
}
