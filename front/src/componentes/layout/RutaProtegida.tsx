import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSesion } from '../../contexto/SesionContext';

/** Redirige al login si no hay sesión, recordando a dónde quería ir el usuario. */
export default function RutaProtegida({ children }: { children: ReactNode }) {
  const { usuario } = useSesion();
  const ubicacion = useLocation();

  if (!usuario) {
    return <Navigate to="/login" replace state={{ desde: ubicacion.pathname }} />;
  }
  return children;
}
