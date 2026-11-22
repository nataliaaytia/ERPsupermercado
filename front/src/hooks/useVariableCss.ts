import { useEffect, useState } from 'react';
import { useTema } from '../contexto/TemaContext';

/**
 * Lee el valor actual de variables CSS del tema (p. ej. para pasarlas a un
 * canvas/WebGL que no entiende var(--...)). Se actualiza al cambiar de tema.
 */
export function useVariablesCss<T extends string>(nombres: readonly T[]): Record<T, string> {
  const { tema } = useTema();
  const leer = () => {
    const estilos = getComputedStyle(document.documentElement);
    return Object.fromEntries(nombres.map((nombre) => [nombre, estilos.getPropertyValue(`--${nombre}`).trim()])) as Record<T, string>;
  };
  const [valores, setValores] = useState(leer);

  useEffect(() => {
    // Espera a que el atributo data-theme se haya aplicado.
    const id = requestAnimationFrame(() => setValores(leer()));
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tema]);

  return valores;
}
