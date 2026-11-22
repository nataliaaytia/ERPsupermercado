import { useCallback } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import type { ModuloConfig } from '../../app/tiposModulo';
import { despacharCompras } from '../../estado/almacenCompras';
import { useCompras } from '../../estado/useCompras';
import Notificacion from '../ui/Notificacion';
import EncabezadoPagina from './EncabezadoPagina';
import MenuLateral from './MenuLateral';
import './LayoutModulo.css';

interface Props {
  modulo: ModuloConfig;
}

/**
 * Estructura común de todas las pantallas de un módulo:
 * menú lateral + encabezado + notificaciones + contenido de la sección.
 */
export default function LayoutModulo({ modulo }: Props) {
  const { pathname } = useLocation();
  const { mensaje, tipoMensaje } = useCompras();

  const cerrarNotificacion = useCallback(() => despacharCompras({ tipo: 'limpiarMensaje' }), []);

  const relativa = pathname.slice(modulo.ruta.length + 1);
  const seccion = modulo.secciones.find((item) => relativa.split('/')[0] === item.ruta.split('/')[0]);

  // /modulo sin sección → primera sección del flujo.
  if (!relativa) {
    return <Navigate to={`${modulo.ruta}/${modulo.secciones[0].ruta}`} replace />;
  }

  return (
    <div className="layout-modulo">
      <MenuLateral modulo={modulo} />

      <main className="contenido-modulo">
        <EncabezadoPagina
          modulo={modulo.titulo}
          titulo={seccion?.etiqueta ?? modulo.titulo}
          descripcion={seccion?.descripcion ?? modulo.descripcion}
        />

        <Notificacion mensaje={mensaje} tipo={tipoMensaje} onCerrar={cerrarNotificacion} />

        <Outlet />
      </main>
    </div>
  );
}
