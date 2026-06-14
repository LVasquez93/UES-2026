import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../estilos/HomeDashboard.css';

const API_URL = 'http://localhost:8080/api';

const HomeDashboard = () => {
  const navigate = useNavigate();

  // Datos del usuario logueado desde localStorage
  const userName = localStorage.getItem('userName') || 'Usuario';

  // Fecha de hoy formateada para el saludo y para filtrar citas
  const today = new Date().toLocaleDateString('es-SV', {
    weekday: 'long', day: 'numeric', month: 'long'
  });

  // Citas del dia cargadas desde el backend
  const [citasHoy, setCitasHoy]   = useState([]);
  const [loadingCitas, setLoadingCitas] = useState(true);

  // -------------------------------------------------------------------------
  // Carga las citas al montar y filtra solo las de hoy
  // -------------------------------------------------------------------------
  useEffect(() => {
    const fetchCitas = async () => {
      try {
        const res = await fetch(`${API_URL}/citas`);
        if (!res.ok) return;
        const todas = await res.json();

        // Fecha de hoy en formato yyyy-MM-dd para comparar con fechaCita
        const hoy = new Date().toISOString().split('T')[0];

        const deHoy = todas.filter(c => {
          if (!c.fechaCita) return false;
          const fecha = Array.isArray(c.fechaCita)
            ? `${c.fechaCita[0]}-${String(c.fechaCita[1]).padStart(2,'0')}-${String(c.fechaCita[2]).padStart(2,'0')}`
            : c.fechaCita;
          return fecha === hoy;
        });

        setCitasHoy(deHoy);
      } catch (_) {
        // Si falla la carga, el widget simplemente muestra vacio sin romper el dashboard
      } finally {
        setLoadingCitas(false);
      }
    };
    fetchCitas();
  }, []);

  // Formatea un LocalDateTime (array o string) a "HH:MM AM/PM"
  const formatHora = (hora) => {
    if (!hora) return '--:--';
    const d = Array.isArray(hora)
      ? new Date(hora[0], hora[1]-1, hora[2], hora[3], hora[4])
      : new Date(hora);
    return d.toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit' });
  };

  // Mapea el estado de la cita a la clase CSS y etiqueta del widget
  const getStatusInfo = (estado) => {
    const map = {
      PROGRAMADA:   { clase: 'pending',    label: 'Programada'  },
      PENDIENTE:    { clase: 'pending',    label: 'Pendiente'   },
      EN_PROGRESO:  { clase: 'confirmed',  label: 'En progreso' },
      COMPLETADA:   { clase: 'confirmed',  label: 'Completada'  },
      REPROGRAMADA: { clase: 'pending',    label: 'Reprogramada'},
      NO_ASISTIO:   { clase: 'pending',    label: 'No asistio'  },
      CANCELADA:    { clase: 'pending',    label: 'Cancelada'   },
    };
    return map[estado] || { clase: 'pending', label: estado };
  };

  // Estadisticas rapidas calculadas sobre las citas de hoy
  const totalHoy      = citasHoy.length;
  const confirmadas   = citasHoy.filter(c => c.estadoCita === 'COMPLETADA').length;
  const reprogramadas = citasHoy.filter(c => c.estadoCita === 'REPROGRAMADA').length;

  return (
    <div className="app-container">
      <main className="app-content">
        <div className="dashboard-body">

          {/* Saludo personalizado con nombre del usuario logueado */}
          <div className="welcome-section mb-4">
            <h2 className="fw-bold" style={{ color: 'var(--text-main)' }}>
              Hola, {userName}! 👋
            </h2>
            <p className="text-muted">Aqui tienes el resumen de tu clinica para hoy {today}.</p>
          </div>

          {/* ACCESOS RAPIDOS */}
          <div className="quick-actions-grid mb-5">

            <div className="action-card primary" onClick={() => navigate('/pacientes')}>
              <div className="card-icon"><i className="bi bi-person-plus"></i></div>
              <div className="card-info">
                <h5>Registrar Paciente</h5>
                <span>Crear nuevo expediente clinico</span>
              </div>
            </div>

            <div className="action-card secondary" onClick={() => navigate('/agenda')}>
              <div className="card-icon"><i className="bi bi-calendar-event"></i></div>
              <div className="card-info">
                <h5>Agenda de Citas</h5>
                <span>Ver programaciones de hoy</span>
              </div>
            </div>

            {/* Navegamos a /consulta que es la entrada al modulo de consulta activa */}
            <div className="action-card accent" onClick={() => navigate('/consulta')}>
              <div className="card-icon"><i className="bi bi-heart-pulse"></i></div>
              <div className="card-info">
                <h5>Iniciar Consulta</h5>
                <span>Ver citas del dia y atender</span>
              </div>
            </div>

            {/* Odontograma historico: para consultar sin iniciar consulta */}
            <div className="action-card dark" onClick={() => navigate('/odontograma')}>
              <div className="card-icon"><i className="bi bi-tooth"></i></div>
              <div className="card-info">
                <h5>Dental Dashboard</h5>
                <span>Odontograma interactivo</span>
              </div>
            </div>

          </div>

          {/* WIDGETS */}
          <div className="dashboard-widgets">

            {/* Widget: Proximas citas de hoy cargadas desde el backend */}
            <div className="widget-card appointments-widget">
              <div className="widget-header">
                <h5 className="fw-bold m-0">Proximas citas de hoy</h5>
                {/* Navega a la agenda completa */}
                <button className="btn-link" onClick={() => navigate('/agenda')}>
                  Ver toda la agenda
                </button>
              </div>
              <div className="widget-content">
                {loadingCitas && (
                  <p className="text-muted small text-center py-3">Cargando citas...</p>
                )}
                {!loadingCitas && citasHoy.length === 0 && (
                  <p className="text-muted small text-center py-3">No hay citas programadas para hoy.</p>
                )}
                <ul className="appointment-list">
                  {/* Mostramos las primeras 4 citas para no saturar el widget */}
                  {citasHoy.slice(0, 4).map(cita => {
                    const status = getStatusInfo(cita.estadoCita);
                    return (
                      <li key={cita.idCitas} className="appointment-item">
                        <div className="time">{formatHora(cita.horaInicioCita)}</div>
                        <div className="details">
                          <h6>{cita.nombreCompletoPaciente}</h6>
                          <span>{cita.especialidadOdontologo}</span>
                        </div>
                        <div className={`status ${status.clase}`}>{status.label}</div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {/* Widget: Estadisticas rapidas calculadas sobre citas reales de hoy */}
            <div className="widget-card stats-widget">
              <div className="widget-header">
                <h5 className="fw-bold m-0">Resumen de hoy</h5>
              </div>
              <div className="widget-content stats-grid">
                <div className="stat-box">
                  <span className="stat-value text-primary">{totalHoy}</span>
                  <span className="stat-label">Citas Programadas</span>
                </div>
                <div className="stat-box">
                  <span className="stat-value text-success">{confirmadas}</span>
                  <span className="stat-label">Completadas</span>
                </div>
                <div className="stat-box">
                  <span className="stat-value text-warning">{reprogramadas}</span>
                  <span className="stat-label">Reprogramadas</span>
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