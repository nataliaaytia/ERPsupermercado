import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, User } from 'lucide-react';
import { modulos } from '../../app/modulos';
import { useSesion } from '../../contexto/SesionContext';
import './Login.css';


export default function Login() {
  const { usuario, iniciarSesion } = useSesion();
  const navegar = useNavigate();
  const ubicacion = useLocation();
  const destino = (ubicacion.state as { desde?: string } | null)?.desde ?? modulos[0].ruta;

  const [nombreUsuario, setNombreUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [error, setError] = useState('');
  const [ingresando, setIngresando] = useState(false);

  if (usuario) return <Navigate to={destino} replace />;

  const enviar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    setIngresando(true);
    const fallo = await iniciarSesion(nombreUsuario, contrasena);
    setIngresando(false);
    if (fallo) {
      setError(fallo);
      return;
    }
    navegar(destino, { replace: true });
  };

  return (
    <div className="login">
      <div className="login__tarjeta">
        <header className="login__cabecera">
          <h1>Iniciar sesión</h1>
          <p>Ingresa con tu usuario para acceder a los módulos de compras.</p>
        </header>

        <form onSubmit={enviar} className="login__formulario" noValidate>
          {error && (
            <p className="alerta alerta--error" role="alert">
              {error}
            </p>
          )}

          <label className="login__campo">
            Usuario
            <span className="login__entrada">
              <User size={18} aria-hidden="true" />
              <input
                type="text"
                autoComplete="username"
                placeholder="Nombre de usuario"
                value={nombreUsuario}
                onChange={(e) => setNombreUsuario(e.target.value)}
                required
              />
            </span>
          </label>

          <label className="login__campo">
            Contraseña
            <span className="login__entrada">
              <Lock size={18} aria-hidden="true" />
              <input
                type={mostrarContrasena ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                required
              />
              <button
                type="button"
                className="login__ver"
                onClick={() => setMostrarContrasena((actual) => !actual)}
                aria-label={mostrarContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {mostrarContrasena ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </span>
          </label>

          <button type="submit" className="login__enviar" disabled={ingresando}>
            {ingresando ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

      </div>
    </div>
  );
}
