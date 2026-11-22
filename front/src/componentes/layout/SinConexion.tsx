import { useEffect, useState } from 'react';
import { RefreshCw, ServerCrash } from 'lucide-react';
import {
  cuandoReconecte,
  iniciarMonitorConexion,
  useServidoresCaidos,
  verificarServidores,
  type IdServidor,
} from '../../servicios/api/monitorConexion';
import { cargarServicio } from '../../servicios/sincronizacion';
import './SinConexion.css';

const SERVIDORES: IdServidor[] = ['proveedores', 'cotizaciones', 'ordenes', 'recepcion'];

/**
 * Pantalla "¡Ups! Algo salió mal" que cubre el sistema cuando algún servidor
 * deja de responder. Desaparece sola en cuanto vuelve la conexión.
 */
export default function SinConexion() {
  const caidos = useServidoresCaidos();
  const [reintentando, setReintentando] = useState(false);

  useEffect(() => {
    const detener = iniciarMonitorConexion();
    // Al volver un servidor se recargan sus datos.
    const quitar = SERVIDORES.map((servidor) => cuandoReconecte(servidor, () => void cargarServicio(servidor)));
    return () => {
      detener();
      quitar.forEach((accion) => accion());
    };
  }, []);

  if (caidos.length === 0) return null;

  const reintentar = async () => {
    setReintentando(true);
    await verificarServidores();
    setReintentando(false);
  };

  return (
    <div className="sin-conexion" role="alertdialog" aria-modal="true" aria-labelledby="sin-conexion-titulo">
      <div className="sin-conexion__tarjeta">
        <div className="sin-conexion__icono" aria-hidden="true">
          <ServerCrash size={40} />
        </div>
        <h1 id="sin-conexion-titulo">¡Ups! Algo salió mal</h1>
        {caidos.length === 1 ? (
          <p>
            No pudimos conectarnos con el servidor de {caidos[0]}. Es posible que el servicio esté detenido o en
            mantenimiento.
          </p>
        ) : (
          <>
            <p>No pudimos conectarnos con estos servidores:</p>
            <ul className="sin-conexion__lista">
              {caidos.map((nombre) => (
                <li key={nombre}>{nombre}</li>
              ))}
            </ul>
            <p>Es posible que los servicios estén detenidos o en mantenimiento.</p>
          </>
        )}
        <p className="sin-conexion__estado">
          <span className="sin-conexion__punto" aria-hidden="true" />
          Intentando reconectar automáticamente…
        </p>
        <button type="button" className="sin-conexion__boton" onClick={reintentar} disabled={reintentando}>
          <RefreshCw size={16} aria-hidden="true" className={reintentando ? 'sin-conexion__girando' : ''} />
          {reintentando ? 'Comprobando…' : 'Reintentar ahora'}
        </button>
      </div>
    </div>
  );
}
