import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { iniciarSesion as autenticar } from '../servicios/autenticacion';
import type { UsuarioSesion } from './tiposSesion';

const CLAVE_SESION = 'erp-sesion';

interface SesionContextValor {
  usuario: UsuarioSesion | null;
  iniciarSesion: (usuario: string, contrasena: string) => string | null;
  cerrarSesion: () => void;
}

const SesionContext = createContext<SesionContextValor | undefined>(undefined);

function leerSesionGuardada(): UsuarioSesion | null {
  try {
    const guardada = localStorage.getItem(CLAVE_SESION);
    return guardada ? (JSON.parse(guardada) as UsuarioSesion) : null;
  } catch {
    return null;
  }
}

export function SesionProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(leerSesionGuardada);

  const iniciarSesion = useCallback((nombreUsuario: string, contrasena: string) => {
    const resultado = autenticar(nombreUsuario, contrasena);
    if (!resultado) return 'Usuario o contraseña incorrectos.';

    setUsuario(resultado);
    try {
      localStorage.setItem(CLAVE_SESION, JSON.stringify(resultado));
    } catch {
      // La sesión sigue activa en memoria aunque no se pueda guardar.
    }
    return null;
  }, []);

  const cerrarSesion = useCallback(() => {
    setUsuario(null);
    try {
      localStorage.removeItem(CLAVE_SESION);
    } catch {
      // Sin almacenamiento disponible no hay nada que limpiar.
    }
  }, []);

  const valor = useMemo(
    () => ({ usuario, iniciarSesion, cerrarSesion }),
    [usuario, iniciarSesion, cerrarSesion],
  );

  return <SesionContext.Provider value={valor}>{children}</SesionContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSesion(): SesionContextValor {
  const contexto = useContext(SesionContext);
  if (!contexto) throw new Error('useSesion debe usarse dentro de SesionProvider');
  return contexto;
}
