import React, { useState, useEffect } from 'react';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import './Login.css';

interface LoginProps {
    onSuccess?: () => void;
    onLogout?: () => void;
    isLoggedIn?: boolean;
}

const PREDEFINED_USER = 'admin';
const PREDEFINED_PASSWORD = 'sonic123';

export const Login: React.FC<LoginProps> = ({
    onSuccess,
    onLogout,
    isLoggedIn: externalIsLoggedIn
}) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [internalIsLoggedIn, setInternalIsLoggedIn] = useState<boolean>(() => {
        return localStorage.getItem('isLoggedIn') === 'true';
    });

    const isLoggedIn = externalIsLoggedIn !== undefined ? externalIsLoggedIn : internalIsLoggedIn;

    useEffect(() => {
        if (externalIsLoggedIn !== undefined) {
            setInternalIsLoggedIn(externalIsLoggedIn);
        }
    }, [externalIsLoggedIn]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (username === PREDEFINED_USER && password === PREDEFINED_PASSWORD) {
            setError('');
            setInternalIsLoggedIn(true);
            localStorage.setItem('isLoggedIn', 'true');
            if (onSuccess) onSuccess();
        } else {
            setError('Usuario o contraseña incorrectos');
        }
    };

    const handleLogout = () => {
        setInternalIsLoggedIn(false);
        localStorage.removeItem('isLoggedIn');
        setPassword('');
        if (onLogout) onLogout();
    };

    if (isLoggedIn) {
        return (
            <div className="login-container">
                <div className="login-card">
                    <div className="login-header">
                        <h2 className="login-title">Sesión iniciada</h2>
                        <p className="login-subtitle">Has iniciado sesión correctamente</p>
                    </div>
                    <div className="login-form">
                        <button type="button" onClick={handleLogout} className="login-submit-btn">
                            Cerrar sesión
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h2 className="login-title">inicio de sesion</h2>
                    <p className="login-subtitle">Ingresa tus datos para iniciar sesion</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    {error && (
                        <div style={{ color: '#ef4444', fontSize: '0.85rem', textAlign: 'center' }}>
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
                                onChange={(e) => setUsername(e.target.value)}
                                className="form-input"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Contraseña</label>
                        <div className="input-wrapper">
                            <Lock className="input-icon" size={18} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="form-input"
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