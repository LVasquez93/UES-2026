import React from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom'; //
import 'bootstrap-icons/font/bootstrap-icons.css'; // estilos de bootstrap en node-bootstrap


const Layout = () => {
  const navigate = useNavigate();
  // Para saber en qué ruta estamos y pintar el ícono activo
  const location = useLocation(); 

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/');
  };

  return (
    <div className="app-container" style={{ display: 'flex', height: '100vh', width: '100vw' }}>

      {/* 1. SIDEBAR ÚNICO PARA TODA LA APP */}
      <aside className="app-sidebar">
        <div className="sidebar-logo" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>DC.</div>

        <div className="sidebar-menu">
          <i className={`bi bi-house-door ${location.pathname === '/dashboard' ? 'active' : ''}`} onClick={() => navigate('/dashboard')} title="Inicio"></i>

          <i className={`bi bi-people ${location.pathname === '/pacientes' ? 'active' : ''}`} onClick={() => navigate('/pacientes')} title="Pacientes"></i>

          <i className={`bi bi-calendar3 ${location.pathname === '/agenda' ? 'active' : ''}`} onClick={() => navigate('/agenda')} title="Agenda"></i>


          {/* Ícono para Gestión de Usuarios / Personal */}
          <i className={`bi bi-person-badge ${location.pathname === '/usuarios' ? 'active' : ''}`} onClick={() => navigate('/usuarios')} title="Personal de Clínica"></i>

          <i className={`bi bi-tooth ${location.pathname === '/odontograma' ? 'active' : ''}`} onClick={() => navigate('/odontograma')} title="Odontograma (Histórico)"></i>
        </div>

        {/* BOTÓN DE CERRAR SESIÓN EN EL FOOTER DEL SIDEBAR */}
        <div className="sidebar-footer" style={{ marginTop: 'auto', paddingBottom: '20px' }}>
          <i className="bi bi-gear mb-3" title="Configuración"></i>
          <i className="bi bi-box-arrow-right text-danger" onClick={handleLogout} title="Cerrar Sesión" style={{ cursor: 'pointer' }}></i>
        </div>
      </aside>

      <main className="app-content" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* 2. HEADER ÚNICO PARA TODA LA APP */}
        <header className="app-header">
          <div className="header-left">
            {/* Puedes hacer el título dinámico después si lo deseas */}
            <h4 className="m-0 fw-bold text-primary">DentalCare ERP</h4>
          </div>
          <div className="header-right d-flex align-items-center gap-3">
            <i className="bi bi-bell text-muted"></i>
            <div className="doctor-avatar">DA</div>
          </div>
        </header>

        {/* 3. EL "HUECO" MÁGICO: Aquí React Router inyectará las pantallas */}
        <div style={{ flexGrow: 1, overflow: 'auto' }}>
          <Outlet />
        </div>

      </main>
    </div>
  );
};

export default Layout;