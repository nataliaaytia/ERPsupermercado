import React, { useState } from "react";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import "./Login.css";

interface LoginProps {
  onSuccess?: () => void;
}

// predeterminados noma
const PREDEFINED_USER = "admin";
const PREDEFINED_PASSWORD = "sonic123";

export const Login: React.FC<LoginProps> = ({ onSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [inputError, setInputError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validar caracteres no permitidos en el usuario
    const usernamePattern = /^[a-zA-Z0-9_.-]+$/;

    if (!usernamePattern.test(username)) {
      setError("El usuario contiene caracteres no permitidos.");
      setInputError(true);
      return;
    }

    setInputError(false);

    if (username === PREDEFINED_USER && password === PREDEFINED_PASSWORD) {
      setError("");
      if (onSuccess) onSuccess();
    } else {
      setError("Usuario o contraseña incorrectos");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2 className="login-title">Inicio de sesión</h2>
          <p className="login-subtitle">
            Ingresa tus datos para iniciar sesión
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Usuario</label>
            <div className="input-wrapper">
              <User className="input-icon" size={18} />
              <input
                type="text"
                required
                placeholder="Nombre de usuario"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setInputError(false);
                  setError("");
                }}
                className={`form-input ${inputError ? "input-error" : ""}`}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`form-input ${inputError ? "input-error" : ""}`}
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Mostrar contraseña"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Recordarme</span>
            </label>

            <a href="#forgot" className="forgot-link">
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <button type="submit" className="login-submit-btn">
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
