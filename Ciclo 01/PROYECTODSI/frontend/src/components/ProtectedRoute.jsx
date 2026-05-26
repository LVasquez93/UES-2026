import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Aquí buscamos si existe un "token" en el almacenamiento del navegador.
  // Más adelante, cuando conectes tu backend (Spring Boot), aquí validarás un JWT real.
  const isAuthenticated = localStorage.getItem('authToken');

  if (!isAuthenticated) {
    // Si no está autenticado, lo pateamos a la ruta raíz (Login)
    // El "replace" borra el historial para que el usuario no pueda usar el botón "Atrás" del navegador para burlar la seguridad.
    return <Navigate to="/" replace />;
  }

  // Si está autenticado, lo dejamos pasar y renderizamos el componente hijo
  return children;
};

export default ProtectedRoute;