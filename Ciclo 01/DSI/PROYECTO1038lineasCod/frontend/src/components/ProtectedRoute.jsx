import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Decodifica el payload de un JWT sin libreria externa.
 * No valida la firma (eso es tarea del servidor). Solo verifica expiracion en cliente.
 */
const isTokenValid = (token) => {
  if (!token) return false;
  try {
    // El JWT tiene 3 partes separadas por puntos: header.payload.signature
    const payloadBase64 = token.split('.')[1];
    const payload = JSON.parse(atob(payloadBase64));
    // "exp" esta en segundos Unix; Date.now() esta en milisegundos
    return payload.exp * 1000 > Date.now();
  } catch {
    // Si el token esta malformado, lo consideramos invalido
    return false;
  }
};

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('authToken');
  const authenticated = isTokenValid(token);

  if (!authenticated) {
    // Limpiamos storage para evitar datos obsoletos
    localStorage.clear();
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;