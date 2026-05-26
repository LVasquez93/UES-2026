import React from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../estilos/HomeDashboard.css';


const HomeDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="app-container">
     
      <main className="app-content">

        {/* CUERPO DEL DASHBOARD */}
        <div className="dashboard-body">
          <div className="welcome-section mb-4">
            <h2 className="fw-bold" style={{ color: 'var(--text-main)' }}>¡Hola, Dr. Arriaza! 👋</h2>
            <p className="text-muted">Aquí tienes el resumen de tu clínica para hoy, 25 de mayo.</p>
          </div>

          {/* ACCESOS RÁPIDOS (Tarjetas de navegación) */}
          <div className="quick-actions-grid mb-5">
            <div className="action-card primary" onClick={() => navigate('/pacientes')}>
              <div className="card-icon"><i className="bi bi-person-plus"></i></div>
              <div className="card-info">
                <h5>Registrar Paciente</h5>
                <span>Crear nuevo expediente clínico</span>
              </div>
            </div>

            <div className="action-card secondary" onClick={() => navigate('/agenda')}>
              <div className="card-icon"><i className="bi bi-calendar-event"></i></div>
              <div className="card-info">
                <h5>Agenda de Citas</h5>
                <span>Ver programaciones de hoy</span>
              </div>
            </div>

            <div className="action-card accent" onClick={() => navigate('/odontograma')}>
              <div className="card-icon"><i className="bi bi-tooth"></i></div>
              <div className="card-info">
                <h5>Dental Dashboard</h5>
                <span>Ir al odontograma interactivo</span>
              </div>
            </div>

            <div className="action-card dark" onClick={() => console.log('Navegar a /presupuestos')}>
              <div className="card-icon"><i className="bi bi-cash-coin"></i></div>
              <div className="card-info">
                <h5>Presupuestos</h5>
                <span>Generar cotizaciones de planes</span>
              </div>
            </div>
          </div>

          {/* SECCIÓN INFERIOR: WIDGETS DE INFORMACIÓN */}
          <div className="dashboard-widgets">
            {/* Widget: Próximas Citas */}
            <div className="widget-card appointments-widget">
              <div className="widget-header">
                <h5 className="fw-bold m-0">Próximas citas de hoy</h5>
                <button className="btn-link">Ver toda la agenda</button>
              </div>
              <div className="widget-content">
                <ul className="appointment-list">
                  <li className="appointment-item">
                    <div className="time">10:30 AM</div>
                    <div className="details">
                      <h6>María Fernanda L. G.</h6>
                      <span>Limpieza y revisión general</span>
                    </div>
                    <div className="status pending">En sala de espera</div>
                  </li>
                  <li className="appointment-item">
                    <div className="time">11:45 AM</div>
                    <div className="details">
                      <h6>Carlos Roberto M.</h6>
                      <span>Instalación de puente dental (Piezas 11, 21)</span>
                    </div>
                    <div className="status confirmed">Confirmada</div>
                  </li>
                </ul>
              </div>
            </div>

            {/* Widget: Estadísticas Rápidas */}
            <div className="widget-card stats-widget">
              <div className="widget-header">
                <h5 className="fw-bold m-0">Resumen Semanal</h5>
              </div>
              <div className="widget-content stats-grid">
                <div className="stat-box">
                  <span className="stat-value text-primary">24</span>
                  <span className="stat-label">Pacientes Atendidos</span>
                </div>
                <div className="stat-box">
                  <span className="stat-value text-success">12</span>
                  <span className="stat-label">Tratamientos Completados</span>
                </div>
                <div className="stat-box">
                  <span className="stat-value text-warning">5</span>
                  <span className="stat-label">Citas Reprogramadas</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default HomeDashboard;