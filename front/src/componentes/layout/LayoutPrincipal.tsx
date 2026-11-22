import { Outlet } from 'react-router-dom';
import Cabecera from './Cabecera';
import SinConexion from './SinConexion';

/** Cabecera común + contenido de la ruta actual. */
export default function LayoutPrincipal() {
  return (
    <>
      <Cabecera />
      <Outlet />
      <SinConexion />
    </>
  );
}
