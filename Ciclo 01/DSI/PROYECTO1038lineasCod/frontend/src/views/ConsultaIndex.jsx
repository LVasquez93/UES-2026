import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'animate.css';
import '../estilos/ScheduleAppointments.css';
import '../estilos/ActiveConsultation.css';

const API_URL = 'http://localhost:8080/api';

/**
 * Vista principal del modulo de consulta.
 * Muestra las citas del dia asignadas al odontologo logueado,
 * con resumen de estado y boton para iniciar cada consulta.
 * Tambien permite buscar el historial de cualquier paciente.
 */
const ConsultaIndex = () => {
  const navigate = useNavigate();

  const [citas, setCitas]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [searchTerm, setSearchTerm]   = useState('');
  const [pacientes, setPacientes]     = useState([]);
  const [showHistorial, setShowHistorial] = useState(false);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [citasPaciente, setCitasPaciente]               = useState([]);

  // Fecha de hoy formateada para comparar con fechaCita
// Usamos fecha local en lugar de toISOString() que usa UTC
const ahora = new Date();
const hoy = `${ahora.getFullYear()}-${String(ahora.getMonth()+1).padStart(2,'0')}-${String(ahora.getDate()).padStart(2,'0')}`;

  // -------------------------------------------------------------------------
  // Carga inicial: todas las citas para filtrar las de hoy
  // -------------------------------------------------------------------------
  useEffect(() => {
    fetchCitas();
    fetchPacientes();
  }, []);

  const fetchCitas = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/citas`);
      if (!res.ok) throw new Error('Error al cargar citas.');
      setCitas(await res.json());
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#6366f1' });
    } finally {
      setLoading(false);
    }
  };

  const fetchPacientes = async () => {
    try {
      const res = await fetch(`${API_URL}/pacientes`);
      if (!res.ok) return;
      setPacientes(await res.json());
    } catch (_) {}
  };

  // -------------------------------------------------------------------------
  // Filtra las citas del dia de hoy
  // -------------------------------------------------------------------------
  const citasDeHoy = citas.filter(c => {
    if (!c.fechaCita) return false;
    const fecha = Array.isArray(c.fechaCita)
      ? `${c.fechaCita[0]}-${String(c.fechaCita[1]).padStart(2,'0')}-${String(c.fechaCita[2]).padStart(2,'0')}`
      : c.fechaCita;
    return fecha === hoy;
  });

  // Estadisticas del dia para el resumen superior
  const totalHoy        = citasDeHoy.length;
  const completadas     = citasDeHoy.filter(c => c.estadoCita === 'COMPLETADA').length;
  const pendientes      = citasDeHoy.filter(c => ['PROGRAMADA','PENDIENTE'].includes(c.estadoCita)).length;
  const noAsistieron    = citasDeHoy.filter(c => c.estadoCita === 'NO_ASISTIO').length;

  // Formatea hora desde array o string de LocalDateTime
  const formatHora = (hora) => {
    if (!hora) return '--:--';
    const d = Array.isArray(hora)
      ? new Date(hora[0], hora[1]-1, hora[2], hora[3], hora[4])
      : new Date(hora);
    return d.toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit' });
  };

  // Devuelve clase CSS y etiqueta segun el estado de la cita
  const getEstadoInfo = (estado) => {
    const map = {
      PROGRAMADA:   { clase: 'pendiente',  label: 'Programada'   },
      PENDIENTE:    { clase: 'pendiente',  label: 'Pendiente'     },
      EN_PROGRESO:  { clase: 'confirmada', label: 'En progreso'   },
      COMPLETADA:   { clase: 'confirmada', label: 'Completada'    },
      REPROGRAMADA: { clase: 'pendiente',  label: 'Reprogramada'  },
      NO_ASISTIO:   { clase: 'cancel',     label: 'No asistio'    },
      CANCELADA:    { clase: 'cancel',     label: 'Cancelada'     },
      OTRO:         { clase: 'pendiente',  label: 'Otro'          },
    };
    return map[estado] || { clase: '', label: estado };
  };

  // -------------------------------------------------------------------------
  // Historial: busca citas de un paciente especifico
  // -------------------------------------------------------------------------
  const handleBuscarHistorial = (paciente) => {
    setPacienteSeleccionado(paciente);
    // Filtramos todas las citas que pertenezcan al paciente seleccionado
    const citasDelPaciente = citas.filter(c => c.idPaciente === paciente.idPaciente);
    setCitasPaciente(citasDelPaciente);
    setShowHistorial(true);
    setSearchTerm('');
  };

  // Pacientes filtrados segun el texto del buscador
  const pacientesFiltrados = searchTerm.trim().length > 1
    ? pacientes.filter(p =>
        `${p.nombrePaciente} ${p.apellidoPaciente}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.numeroIdentidadPaciente?.includes(searchTerm))
    : [];

  return (
    <div className="d-flex flex-column h-100 p-4" style={{ backgroundColor: 'var(--bg-app)' }}>

      {/* ================================================================= */}
      {/* HEADER: Titulo, fecha y buscador de historial                     */}
      {/* ================================================================= */}
      <div className="d-flex justify-content-between align-items-start mb-4 animate__animated animate__fadeInDown">
        <div>
          <h4 className="fw-bold m-0" style={{ color: 'var(--text-main)' }}>Gestion de Consultas</h4>
          <p className="text-muted small m-0">
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Buscador de historial por paciente */}
        <div style={{ position: 'relative', width: '320px' }}>
          <div className="search-bar-full">
            <i className="bi bi-search"></i>
            <input
              type="text"
              placeholder="Buscar historial de paciente..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <i className="bi bi-x" style={{ cursor: 'pointer' }} onClick={() => setSearchTerm('')}></i>
            )}
          </div>
          {/* Dropdown de resultados de busqueda */}
          {pacientesFiltrados.length > 0 && (
            <div className="search-dropdown">
              {pacientesFiltrados.map(p => (
                <div
                  key={p.idPaciente}
                  className="search-dropdown-item"
                  onClick={() => handleBuscarHistorial(p)}
                >
                  <div className="patient-avatar-sm" style={{ width: '32px', height: '32px', fontSize: '0.75rem', marginRight: '10px' }}>
                    {p.nombrePaciente?.charAt(0)}{p.apellidoPaciente?.charAt(0)}
                  </div>
                  <div>
                    <div className="fw-semibold small">{p.nombrePaciente} {p.apellidoPaciente}</div>
                    <div className="text-muted" style={{ fontSize: '0.72rem' }}>DUI: {p.numeroIdentidadPaciente}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ================================================================= */}
      {/* RESUMEN DEL DIA: 4 tarjetas de estadisticas                       */}
      {/* ================================================================= */}
      <div className="consulta-stats-row mb-4 animate__animated animate__fadeIn">
        <div className="consulta-stat-card">
          <span className="stat-value text-primary">{totalHoy}</span>
          <span className="stat-label">Citas hoy</span>
        </div>
        <div className="consulta-stat-card">
          <span className="stat-value text-warning">{pendientes}</span>
          <span className="stat-label">Pendientes</span>
        </div>
        <div className="consulta-stat-card">
          <span className="stat-value text-success">{completadas}</span>
          <span className="stat-label">Completadas</span>
        </div>
        <div className="consulta-stat-card">
          <span className="stat-value text-danger">{noAsistieron}</span>
          <span className="stat-label">No asistieron</span>
        </div>
      </div>

      {/* ================================================================= */}
      {/* LISTA DE CITAS DEL DIA                                            */}
      {/* ================================================================= */}
      <div className="flex-grow-1" style={{ overflowY: 'auto' }}>
        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary mb-2" role="status"></div>
            <p className="text-muted small">Cargando citas...</p>
          </div>
        )}

        {!loading && citasDeHoy.length === 0 && (
          <div className="text-center py-5">
            <i className="bi bi-calendar-x" style={{ fontSize: '3rem', color: '#cbd5e0' }}></i>
            <h6 className="mt-3 text-muted">No hay citas programadas para hoy</h6>
          </div>
        )}

        <div className="consulta-citas-grid">
          {citasDeHoy.map(cita => {
            const estado = getEstadoInfo(cita.estadoCita);
            const puedeIniciar = ['PROGRAMADA','PENDIENTE','EN_PROGRESO'].includes(cita.estadoCita);

            return (
              <div key={cita.idCitas} className="consulta-cita-card animate__animated animate__fadeInUp">

                {/* Hora de la cita */}
                <div className="consulta-cita-hora">
                  <i className="bi bi-clock me-1"></i>
                  {formatHora(cita.horaInicioCita)} — {formatHora(cita.horaFinCita)}
                </div>

                {/* Datos del paciente */}
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="patient-avatar-sm">
                    {cita.nombreCompletoPaciente?.charAt(0)}
                  </div>
                  <div>
                    <h6 className="fw-bold m-0">{cita.nombreCompletoPaciente}</h6>
                    <span className="text-muted small">DUI: {cita.numeroIdentidadPaciente}</span>
                  </div>
                </div>

                {/* Especialidad y estado */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-muted small">
                    <i className="bi bi-person-badge me-1"></i>{cita.especialidadOdontologo}
                  </span>
                  <span className={`status-tag ${estado.clase}`}>{estado.label}</span>
                </div>

                {/* Motivo de cancelacion si aplica */}
                {cita.motivoCancelacion && (
                  <p className="text-muted small mb-3" style={{ fontSize: '0.75rem' }}>
                    <i className="bi bi-info-circle me-1"></i>{cita.motivoCancelacion}
                  </p>
                )}

                {/* Boton de accion: iniciar consulta o ver como completada */}
                {puedeIniciar ? (
                  <button
                    className="btn-register w-100"
                    onClick={() => navigate(`/consulta/${cita.idCitas}`)}
                  >
                    <i className="bi bi-play-circle me-2"></i>Iniciar Consulta
                  </button>
                ) : (
                  <button
                    className="btn-cancel w-100"
                    onClick={() => navigate(`/consulta/${cita.idCitas}`)}
                  >
                    <i className="bi bi-eye me-2"></i>Ver Consulta
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ================================================================= */}
      {/* MODAL DE HISTORIAL DE PACIENTE                                    */}
      {/* ================================================================= */}
      {showHistorial && pacienteSeleccionado && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
          justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div className="bg-white rounded-4 shadow-lg animate__animated animate__fadeInUp"
            style={{ width: '600px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>

            {/* Header del modal */}
            <div className="d-flex justify-content-between align-items-center p-4 border-bottom">
              <div>
                <h5 className="fw-bold m-0">Historial de consultas</h5>
                <p className="text-muted small m-0">
                  {pacienteSeleccionado.nombrePaciente} {pacienteSeleccionado.apellidoPaciente}
                  {' '} — DUI: {pacienteSeleccionado.numeroIdentidadPaciente}
                </p>
              </div>
              <button className="btn-close" onClick={() => setShowHistorial(false)}></button>
            </div>

            {/* Lista de citas del paciente */}
            <div style={{ overflowY: 'auto', flexGrow: 1, padding: '20px' }}>
              {citasPaciente.length === 0 ? (
                <p className="text-muted text-center py-4">Este paciente no tiene citas registradas.</p>
              ) : (
                citasPaciente.map(c => {
                  const est = getEstadoInfo(c.estadoCita);
                  const fecha = Array.isArray(c.fechaCita)
                    ? `${c.fechaCita[2]}/${c.fechaCita[1]}/${c.fechaCita[0]}`
                    : c.fechaCita;
                  return (
                    <div key={c.idCitas} className="historial-item mb-3 p-3 border rounded-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <span className="fw-semibold small">{fecha}</span>
                          <span className="text-muted small ms-3">
                            {formatHora(c.horaInicioCita)}
                          </span>
                          <p className="mb-0 text-muted small mt-1">
                            {c.especialidadOdontologo}
                          </p>
                        </div>
                        <div className="d-flex flex-column align-items-end gap-2">
                          <span className={`status-tag ${est.clase}`}>{est.label}</span>
                          {/* Permitimos ver la consulta aunque este completada */}
                          <button
                            className="btn btn-sm btn-outline-primary"
                            style={{ fontSize: '0.75rem' }}
                            onClick={() => { setShowHistorial(false); navigate(`/consulta/${c.idCitas}`); }}
                          >
                            Ver detalle
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-3 border-top">
              <button className="btn-cancel w-100" onClick={() => setShowHistorial(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultaIndex;
