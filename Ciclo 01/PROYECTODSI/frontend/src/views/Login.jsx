import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../estilos/Login.css';

/** Esta Pantalla es el login del sistema, donde el usuario ingresa su correo electronico o nombre de usuario y su contraseña para autenticarse. Al hacer click en "Ingresar al Sistema" se hace una peticion POST al backend Spring Boot para validar las credenciales, si son correctas se guarda el JWT y los datos del usuario en localStorage y se redirige al dashboard principal. Si las credenciales son incorrectas, se muestra un mensaje de error debajo del formulario.*/

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword]     = useState('');
  const [error, setError]           = useState('');
  const [isLoading, setIsLoading]   = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Peticion POST al endpoint de autenticacion del backend Spring Boot
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: identifier,
          password: password,
        }),
      });

      if (!response.ok) {
        // El backend retorna 401 si las credenciales son incorrectas
        const errorData = await response.json();
        throw new Error(errorData.message || 'Credenciales incorrectas.');
      }

      const data = await response.json();

      // Guardamos el JWT y los datos del usuario en localStorage
      // En produccion, considera guardar el token en una cookie HttpOnly
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userRole', data.rol);
      localStorage.setItem('userName', data.nombreCompleto);

      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Error de conexion con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Seccion izquierda: branding */}
      <div className="login-branding">
        <div className="branding-content">
          <h1 className="logo-text">DentalCare.</h1>
          <p className="branding-subtitle">
            Sistema integral de gestion clinica y odontograma digital.
          </p>
        </div>
        <div className="branding-overlay"></div>
      </div>

      {/* Seccion derecha: formulario */}
      <div className="login-form-section">
        <div className="form-wrapper">
          <div className="text-center mb-5">
            <h2 className="fw-bold text-main">Bienvenido de nuevo</h2>
            <p className="text-muted">Ingresa tus credenciales para acceder al panel.</p>
          </div>

          {/* Bloque de error visible solo cuando existe un mensaje */}
          {error && (
            <div className="alert alert-danger d-flex align-items-center gap-2 mb-4" role="alert">
              <i className="bi bi-exclamation-triangle-fill"></i>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} noValidate>
            <div className="mb-4">
              <label className="form-label-custom">Correo electronico o Usuario</label>
              <div className="input-group-custom">
                <i className="bi bi-person text-muted"></i>
                <input
                  type="text"
                  className="form-control-custom"
                  placeholder="ejemplo@dentalcare.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label-custom">Contrasena</label>
              <div className="input-group-custom">
                <i className="bi bi-lock text-muted"></i>
                <input
                  type="password"
                  className="form-control-custom"
                  placeholder="contrasena"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-5">
              <div className="form-check">
                <input type="checkbox" className="form-check-input" id="rememberMe" />
                <label className="form-check-label text-muted small" htmlFor="rememberMe">
                  Recordarme
                </label>
              </div>
              <a href="#" className="forgot-password-link small">
                Olvidaste tu contrasena?
              </a>
            </div>

            {/* El boton se deshabilita mientras la peticion esta en curso */}
            <button type="submit" className="btn-login w-100" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Verificando...
                </>
              ) : (
                'Ingresar al Sistema'
              )}
            </button>
          </form>

          <div className="text-center mt-4">
            <small className="text-muted">
              Problemas de acceso? Contacta al administrador del sistema.
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
