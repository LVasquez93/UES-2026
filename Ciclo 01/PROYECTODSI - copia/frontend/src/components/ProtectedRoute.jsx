import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Decodifica el payload JWT y verifica que no haya expirado.
 * No valida la firma (eso es responsabilidad del servidor).
 */
const isTokenValid = (token) => {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

/**
 * Guard de rutas privadas.
 * Si el token no existe o expiró, limpia el storage y redirige al login.
 */
const ProtectedRoute = ({ children }) => {
  const token         = localStorage.getItem('authToken');
  const authenticated = isTokenValid(token);

  if (!authenticated) {
    localStorage.clear();
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
