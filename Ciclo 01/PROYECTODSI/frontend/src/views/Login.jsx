import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../estilos/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

const handleLogin = (e) => {
    e.preventDefault();
    
    // Aquí es donde harías la petición POST a tu backend.
    // Simulamos que el servidor nos respondió correctamente y nos dio un Token:
    const fakeToken = "jwt-super-seguro-123456789";
    
    // Guardamos la credencial en el LocalStorage del navegador
    localStorage.setItem('authToken', fakeToken);
    
    console.log("Iniciando sesión con:", email);
    // Ahora sí, lo enviamos al dashboard
    navigate('/dashboard'); 
  };

  return (
    <div className="login-container">
      {/* SECCIÓN IZQUIERDA: Branding e Imagen */}
      <div className="login-branding">
        <div className="branding-content">
          <h1 className="logo-text">DentalCare.</h1>
          <p className="branding-subtitle">Sistema integral de gestión clínica y odontograma digital.</p>
        </div>
        <div className="branding-overlay"></div>
      </div>

      {/* SECCIÓN DERECHA: Formulario */}
      <div className="login-form-section">
        <div className="form-wrapper">
          <div className="text-center mb-5">
            <h2 className="fw-bold text-main">¡Bienvenido de nuevo! 👋</h2>
            <p className="text-muted">Ingresa tus credenciales para acceder a tu panel.</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="form-label-custom">Correo electrónico o Usuario</label>
              <div className="input-group-custom">
                <i className="bi bi-person text-muted"></i>
                <input 
                  type="text" 
                  className="form-control-custom" 
                  placeholder="ejemplo@dentalcare.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label-custom">Contraseña</label>
              <div className="input-group-custom">
                <i className="bi bi-lock text-muted"></i>
                <input 
                  type="password" 
                  className="form-control-custom" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              <a href="#" className="forgot-password-link small">¿Olvidaste tu contraseña?</a>
            </div>

            <button type="submit" className="btn-login w-100">
              Ingresar al Sistema
            </button>
          </form>
          
          <div className="text-center mt-4">
            <small className="text-muted">
              ¿Problemas de acceso? Contacta al administrador del sistema.
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;