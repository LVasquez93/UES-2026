import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import Swal from 'sweetalert2';
import 'react-calendar/dist/Calendar.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../estilos/ScheduleAppointments.css';

const API_URL = 'http://localhost:8080/api';

const ScheduleAppointments = () => {
  const [date, setDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState('dia');
  const [showReprogramModal, setShowReprogramModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Citas obtenidas del backend
  const [appointments, setAppointments] = useState([]);
  // Pacientes y odontologos para los selects del formulario
  const [pacientes, setPacientes] = useState([]);
  const [odontologos, setOdontologos] = useState([]);
  // Cita seleccionada para editar, cancelar o reprogramar
  const [selectedCita, setSelectedCita] = useState(null);
  // Controla si el formulario esta en modo edicion o creacion
  const [isEditing, setIsEditing] = useState(false);

  // Estado del formulario alineado con CitaRequestDTO del backend
  const [formData, setFormData] = useState({
    idPaciente: '',
    idOdontologo: '',
    fechaCita: '',
    horaInicioCita: '',
    horaFinCita: '',
    estadoCita: 'PROGRAMADA',
  });

  // Estado del modal de reprogramacion
  const [reprogramData, setReprogramData] = useState({
    fechaCita: '',
    horaInicioCita: '',
    horaFinCita: '',
  });

  // -------------------------------------------------------------------------
  // Carga inicial: citas, pacientes y odontologos al montar el componente
  // -------------------------------------------------------------------------
  useEffect(() => {
    fetchCitas();
    fetchPacientes();
    fetchOdontologos();
  }, []);

  // Obtiene todas las citas ordenadas por fecha: GET /api/citas
  const fetchCitas = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/citas`);
      if (!res.ok) throw new Error('Error al cargar citas.');
      setAppointments(await res.json());
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#0d6efd' });
    } finally {
      setLoading(false);
    }
  };

  // Obtiene todos los pacientes para el select del formulario
  const fetchPacientes = async () => {
    try {
      const res = await fetch(`${API_URL}/pacientes`);
      if (!res.ok) throw new Error('Error al cargar pacientes.');
      setPacientes(await res.json());
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#0d6efd' });
    }
  };

  // Obtiene todos los odontologos para el select del formulario
  const fetchOdontologos = async () => {
    try {
      const res = await fetch(`${API_URL}/odontologos`);
      if (!res.ok) throw new Error('Error al cargar odontologos.');
      setOdontologos(await res.json());
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#0d6efd' });
    }
  };

  // -------------------------------------------------------------------------
  // Filtra las citas segun la fecha seleccionada en el calendario (vista dia)
  // Compara solo la parte de fecha ignorando la hora
  // -------------------------------------------------------------------------
  const citasDelDia = appointments.filter(app => {
    if (!app.fechaCita) return false;
    const fechaCita = Array.isArray(app.fechaCita)
      ? `${app.fechaCita[0]}-${String(app.fechaCita[1]).padStart(2, '0')}-${String(app.fechaCita[2]).padStart(2, '0')}`
      : app.fechaCita;
    const seleccionada = date.toISOString().split('T')[0];
    return fechaCita === seleccionada;
  });

  // -------------------------------------------------------------------------
  // Agrupa todas las citas por fecha para la vista de semana
  // Retorna un objeto { "2025-05-26": [cita1, cita2], ... }
  // -------------------------------------------------------------------------
  const citasPorFecha = appointments.reduce((grupos, app) => {
    if (!app.fechaCita) return grupos;
    const key = Array.isArray(app.fechaCita)
      ? `${app.fechaCita[0]}-${String(app.fechaCita[1]).padStart(2, '0')}-${String(app.fechaCita[2]).padStart(2, '0')}`
      : app.fechaCita;
    if (!grupos[key]) grupos[key] = [];
    grupos[key].push(app);
    return grupos;
  }, {});

  // Formatea un LocalDateTime (array o string) a "HH:MM AM/PM"
  const formatHora = (hora) => {
    if (!hora) return '';
    const date = Array.isArray(hora)
      ? new Date(hora[0], hora[1] - 1, hora[2], hora[3], hora[4])
      : new Date(hora);
    return date.toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit' });
  };

  // Formatea una fecha para mostrar en encabezados de la vista semana
  const formatFechaHeader = (fechaStr) => {
    const [y, m, d] = fechaStr.split('-');
    return new Date(y, m - 1, d).toLocaleDateString('es-ES', {
      weekday: 'long', day: 'numeric', month: 'long'
    });
  };

  // Devuelve clase CSS segun el estado de la cita para el badge de estado
  const getStatusClass = (estado) => {
    const clases = {
      PROGRAMADA: 'pendiente',
      PENDIENTE: 'pendiente',
      EN_PROGRESO: 'confirmada',
      COMPLETADA: 'confirmada',
      REPROGRAMADA: 'pendiente',
      NO_ASISTIO: 'cancel',
      CANCELADA: 'cancel',
      OTRO: 'pendiente',
    };
    return clases[estado] || '';
  };

  // -------------------------------------------------------------------------
  // Abre el formulario para CREAR una nueva cita con la fecha seleccionada
  // -------------------------------------------------------------------------
  const handleNuevaCita = () => {
    setIsEditing(false);
    setSelectedCita(null);
    setFormData({
      idPaciente: '',
      idOdontologo: '',
      // Pre-cargamos la fecha del calendario seleccionado
      fechaCita: date.toISOString().split('T')[0],
      horaInicioCita: '',
      horaFinCita: '',
      estadoCita: 'PROGRAMADA',
    });
    setShowForm(true);
  };

  // -------------------------------------------------------------------------
  // Abre el formulario para EDITAR una cita existente con sus datos cargados
  // -------------------------------------------------------------------------
  const handleEditarCita = (cita) => {
    setIsEditing(true);
    setSelectedCita(cita);
    const fecha = Array.isArray(cita.fechaCita)
      ? `${cita.fechaCita[0]}-${String(cita.fechaCita[1]).padStart(2, '0')}-${String(cita.fechaCita[2]).padStart(2, '0')}`
      : cita.fechaCita;
    // Formateamos LocalDateTime a "yyyy-MM-ddTHH:mm" para el input datetime-local
    const formatDT = (dt) => {
      if (!dt) return '';
      if (Array.isArray(dt)) return `${dt[0]}-${String(dt[1]).padStart(2, '0')}-${String(dt[2]).padStart(2, '0')}T${String(dt[3]).padStart(2, '0')}:${String(dt[4]).padStart(2, '0')}`;
      return dt.substring(0, 16);
    };
    setFormData({
      idPaciente: cita.idPaciente || '',
      idOdontologo: cita.idOdontologo || '',
      fechaCita: fecha,
      horaInicioCita: formatDT(cita.horaInicioCita),
      horaFinCita: formatDT(cita.horaFinCita),
      estadoCita: cita.estadoCita || 'PROGRAMADA',
    });
    setShowForm(true);
  };

  // Manejo generico de cambios en cualquier campo del formulario
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // -------------------------------------------------------------------------
  // CREAR cita: POST /api/citas
  // -------------------------------------------------------------------------
  const handleCrear = async () => {
    setLoading(true);
    try {
      const payload = {
        ...formData,
        idPaciente: parseInt(formData.idPaciente),
        idOdontologo: parseInt(formData.idOdontologo),
      };
      const res = await fetch(`${API_URL}/citas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al registrar la cita.');
      Swal.fire({ icon: 'success', title: 'Cita registrada', text: `Cita para ${data.nombreCompletoPaciente} registrada correctamente.`, confirmButtonColor: '#0d6efd' });
      fetchCitas();
      setShowForm(false);
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#0d6efd' });
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------------------
  // EDITAR cita: PUT /api/citas/:id
  // -------------------------------------------------------------------------
  const handleActualizar = async () => {
    setLoading(true);
    try {
      const payload = {
        ...formData,
        idPaciente: parseInt(formData.idPaciente),
        idOdontologo: parseInt(formData.idOdontologo),
      };
      const res = await fetch(`${API_URL}/citas/${selectedCita.idCitas}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al actualizar la cita.');
      Swal.fire({ icon: 'success', title: 'Cita actualizada', text: 'Los cambios fueron guardados correctamente.', confirmButtonColor: '#0d6efd' });
      fetchCitas();
      setShowForm(false);
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#0d6efd' });
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------------------
  // CANCELAR cita: PUT /api/citas/:id/cancelar con motivo via SweetAlert2
  // -------------------------------------------------------------------------
  const handleCancelar = async (cita) => {
    // Pedimos el motivo de cancelacion directamente en el dialogo de SweetAlert2
    const { value: motivo, isConfirmed } = await Swal.fire({
      title: 'Cancelar cita',
      text: `Cita de ${cita.nombreCompletoPaciente}`,
      input: 'textarea',
      inputLabel: 'Motivo de cancelacion',
      inputPlaceholder: 'Escriba el motivo...',
      showCancelButton: true,
      confirmButtonText: 'Confirmar cancelacion',
      cancelButtonText: 'Volver',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      inputValidator: (value) => { if (!value) return 'El motivo es obligatorio.'; }
    });
    if (!isConfirmed) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/citas/${cita.idCitas}/cancelar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motivoCancelacion: motivo }),
      });
      if (!res.ok) throw new Error('Error al cancelar la cita.');
      Swal.fire({ icon: 'success', title: 'Cita cancelada', text: 'La cita fue cancelada correctamente.', confirmButtonColor: '#0d6efd' });
      fetchCitas();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#0d6efd' });
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------------------
  // REPROGRAMAR cita: reutiliza PUT /api/citas/:id actualizando fecha y hora
  // -------------------------------------------------------------------------
  const handleAbrirReprogram = (cita) => {
    setSelectedCita(cita);
    setReprogramData({ fechaCita: '', horaInicioCita: '', horaFinCita: '' });
    setShowReprogramModal(true);
  };

  const handleConfirmarReprogram = async () => {
    if (!reprogramData.fechaCita || !reprogramData.horaInicioCita || !reprogramData.horaFinCita) {
      Swal.fire({ icon: 'warning', title: 'Campos incompletos', text: 'Completa fecha, hora inicio y hora fin.', confirmButtonColor: '#0d6efd' });
      return;
    }
    setLoading(true);
    try {
      // Construimos el payload reutilizando los datos existentes de la cita seleccionada
      const payload = {
        idPaciente: selectedCita.idPaciente,
        idOdontologo: selectedCita.idOdontologo,
        fechaCita: reprogramData.fechaCita,
        horaInicioCita: reprogramData.horaInicioCita,
        horaFinCita: reprogramData.horaFinCita,
        estadoCita: 'PROGRAMADA',
      };
      const res = await fetch(`${API_URL}/citas/${selectedCita.idCitas}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Error al reprogramar la cita.');
      Swal.fire({ icon: 'success', title: 'Cita reprogramada', text: 'La cita fue reprogramada correctamente.', confirmButtonColor: '#0d6efd' });
      fetchCitas();
      setShowReprogramModal(false);
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#0d6efd' });
    } finally {
      setLoading(false);
    }
  };

  // Decide crear o actualizar segun el modo del formulario
  const handleSubmit = () => { if (isEditing) handleActualizar(); else handleCrear(); };

  // Marca en el calendario los dias que tienen citas con un punto indicador
  const tileContent = ({ date: tileDate, view }) => {
    if (view !== 'month') return null;
    const key = tileDate.toISOString().split('T')[0];
    if (citasPorFecha[key]?.length > 0) {
      return <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#0d6efd', margin: '0 auto' }}></div>;
    }
    return null;
  };

  return (
    <div className="app-container">
      <main className="app-content">
        <div className="app-body appointment-layout">

          {/* MODULO IZQUIERDO: CALENDARIO O FORMULARIO */}
          <section className="calendar-module">
            {showForm ? (
              // Formulario de creacion / edicion de cita
              <div className="appointment-form-card">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="fw-bold m-0">
                    {isEditing ? 'Editar Cita' : `Nueva Cita: ${date.toLocaleDateString()}`}
                  </h5>
                  {/* Boton para volver al calendario sin guardar */}
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => setShowForm(false)}>
                    <i className="bi bi-arrow-left"></i> Volver
                  </button>
                </div>

                <form className="row g-3">
                  {/* Select de paciente cargado dinamicamente desde el backend */}
                  <div className="col-12">
                    <label className="form-label-custom">Paciente</label>
                    <select name="idPaciente" className="form-control-custom"
                      value={formData.idPaciente} onChange={handleChange}>
                      <option value="">Seleccione un paciente...</option>
                      {pacientes.map(p => (
                        <option key={p.idPaciente} value={p.idPaciente}>
                          {p.nombrePaciente} {p.apellidoPaciente} — {p.numeroIdentidadPaciente}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Select de odontologo cargado dinamicamente desde el backend */}
                  <div className="col-12">
                    <label className="form-label-custom">Odontologo</label>
                    <select name="idOdontologo" className="form-control-custom"
                      value={formData.idOdontologo} onChange={handleChange}>
                      <option value="">Seleccione un odontologo...</option>
                      {odontologos.map(o => (
                        <option key={o.idOdontologo} value={o.idOdontologo}>
                          {o.especialidadOdontologo} — JVPO: {o.jvpoId}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Fecha de la cita */}
                  <div className="col-12">
                    <label className="form-label-custom">Fecha</label>
                    <input type="date" name="fechaCita" className="form-control-custom"
                      value={formData.fechaCita} onChange={handleChange} />
                  </div>

                  {/* Hora inicio: datetime-local porque el backend espera LocalDateTime */}
                  <div className="col-md-6">
                    <label className="form-label-custom">Hora Inicio</label>
                    <input type="datetime-local" name="horaInicioCita" className="form-control-custom"
                      value={formData.horaInicioCita} onChange={handleChange} />
                  </div>

                  {/* Hora fin */}
                  <div className="col-md-6">
                    <label className="form-label-custom">Hora Fin</label>
                    <input type="datetime-local" name="horaFinCita" className="form-control-custom"
                      value={formData.horaFinCita} onChange={handleChange} />
                  </div>

                  {/* Estado: solo visible al editar, al crear siempre es PROGRAMADA */}
                  {isEditing && (
                    <div className="col-12">
                      <label className="form-label-custom">Estado</label>
                      <select name="estadoCita" className="form-control-custom"
                        value={formData.estadoCita} onChange={handleChange}>
                        <option value="PROGRAMADA">Programada</option>
                        <option value="PENDIENTE">Pendiente</option>
                        <option value="EN_PROGRESO">En Progreso</option>
                        <option value="COMPLETADA">Completada</option>
                        <option value="REPROGRAMADA">Reprogramada</option>
                        <option value="NO_ASISTIO">No Asistio</option>
                        <option value="CANCELADA">Cancelada</option>
                        <option value="OTRO">Otro</option>
                      </select>
                    </div>
                  )}

                  <div className="col-12 mt-4 d-flex gap-2">
                    <button type="button" className="btn-cancel w-100"
                      onClick={() => setShowForm(false)} disabled={loading}>
                      Cancelar
                    </button>
                    <button type="button" className="btn-register w-100"
                      onClick={handleSubmit} disabled={loading}>
                      {loading ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Confirmar Cita'}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              // Calendario con indicadores de dias con citas
              <div className="calendar-card">
                <Calendar
                  onChange={setDate}
                  value={date}
                  className="custom-react-calendar"
                  locale="es-ES"
                  tileContent={tileContent}
                />
                {/* Boton para abrir el formulario de nueva cita */}
                <button className="btn-register w-100 mt-3" onClick={handleNuevaCita}>
                  <i className="bi bi-plus-circle me-2"></i>Nueva Cita
                </button>
              </div>
            )}

            {/* Resumen del dia seleccionado */}
            <div className="info-summary-card mt-4">
              <p className="text-muted small mb-1">Resumen del dia</p>
              <h6 className="fw-bold">
                {date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </h6>
              <div className="d-flex gap-3 mt-3">
                <div className="summary-pill blue">{citasDelDia.length} Citas</div>
                <div className="summary-pill green">
                  {citasDelDia.filter(c => c.estadoCita === 'CONFIRMADA').length} Confirmadas
                </div>
              </div>
            </div>
          </section>

          {/* MODULO DERECHO: LISTA DE CITAS */}
          <section className="agenda-module">
            <div className="agenda-header">
              <h5 className="fw-bold">Proximas Citas</h5>
              <div className="agenda-view-options">
                <span className={viewMode === 'dia' ? 'active' : ''} onClick={() => setViewMode('dia')}>Dia</span>
                <span className={viewMode === 'semana' ? 'active' : ''} onClick={() => setViewMode('semana')}>Semana</span>
              </div>
            </div>

            <div className="appointment-list-scroll">
              {loading && !appointments.length && (
                <p className="text-muted small text-center p-3">Cargando citas...</p>
              )}

              {viewMode === 'dia' ? (
                // VISTA DIA: muestra solo las citas de la fecha seleccionada en el calendario
                <>
                  {citasDelDia.length === 0 && !loading && (
                    <p className="text-muted small text-center p-4">No hay citas para este dia.</p>
                  )}
                  {citasDelDia.map((app) => (
                    <div key={app.idCitas} className="appointment-card-item">
                      <div className="time-indicator">
                        <span className="time">{formatHora(app.horaInicioCita)}</span>
                        <span className="dot"></span>
                      </div>
                      <div className="appointment-info">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h6>{app.nombreCompletoPaciente}</h6>
                            <p>{app.especialidadOdontologo}</p>
                          </div>
                          <span className={`status-tag ${getStatusClass(app.estadoCita)}`}>
                            {app.estadoCita}
                          </span>
                        </div>
                        <div className="appointment-actions">
                          {/* Editar cita */}
                          <button title="Editar" onClick={() => handleEditarCita(app)}>
                            <i className="bi bi-pencil"></i>
                          </button>
                          {/* Cancelar cita: solo si no esta ya cancelada */}
                          {app.estadoCita !== 'CANCELADA' && (
                            <button title="Cancelar" className="cancel" onClick={() => handleCancelar(app)}>
                              <i className="bi bi-trash"></i>
                            </button>
                          )}
                          {/* Reprogramar cita */}
                          <button title="Reprogramar" className="notify" onClick={() => handleAbrirReprogram(app)}>
                            <i className="bi bi-calendar-event"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                // VISTA SEMANA: agrupa todas las citas por fecha
                <div className="weekly-view">
                  {Object.keys(citasPorFecha).sort().map(fechaKey => (
                    <div key={fechaKey} className="mb-4">
                      <h6 className="text-primary fw-bold mb-3 border-bottom pb-2">
                        {formatFechaHeader(fechaKey)}
                      </h6>
                      {citasPorFecha[fechaKey].map(app => (
                        <div key={app.idCitas} className="appointment-info mb-3">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <h6 className="mb-1">{app.nombreCompletoPaciente}</h6>
                              <p className="mb-0 text-muted small">
                                <i className="bi bi-clock me-1"></i>
                                {formatHora(app.horaInicioCita)} — {app.especialidadOdontologo}
                              </p>
                            </div>
                            <div className="d-flex flex-column align-items-end gap-1">
                              <span className={`status-tag ${getStatusClass(app.estadoCita)}`}>
                                {app.estadoCita}
                              </span>
                              {/* Acciones compactas en vista semana */}
                              <div className="appointment-actions">
                                <button title="Editar" onClick={() => handleEditarCita(app)}>
                                  <i className="bi bi-pencil"></i>
                                </button>
                                {app.estadoCita !== 'CANCELADA' && (
                                  <button title="Cancelar" className="cancel" onClick={() => handleCancelar(app)}>
                                    <i className="bi bi-trash"></i>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                  {Object.keys(citasPorFecha).length === 0 && !loading && (
                    <p className="text-muted small text-center p-4">No hay citas registradas.</p>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* MODAL DE REPROGRAMACION: mantiene el diseno original */}
      {showReprogramModal && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
          justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div className="modal-content bg-white p-4 rounded-4 shadow-lg" style={{ width: '450px' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold m-0 text-dark">Reprogramar Cita</h5>
              <button type="button" className="btn-close" onClick={() => setShowReprogramModal(false)}></button>
            </div>
            {selectedCita && (
              <p className="text-muted small mb-3">
                Paciente: <strong>{selectedCita.nombreCompletoPaciente}</strong>
              </p>
            )}
            <div className="mb-3">
              <label className="form-label-custom">Nueva Fecha</label>
              <input type="date" className="form-control-custom"
                value={reprogramData.fechaCita}
                onChange={e => setReprogramData({ ...reprogramData, fechaCita: e.target.value })} />
            </div>
            <div className="mb-3">
              <label className="form-label-custom">Nueva Hora Inicio</label>
              <input type="datetime-local" className="form-control-custom"
                value={reprogramData.horaInicioCita}
                onChange={e => setReprogramData({ ...reprogramData, horaInicioCita: e.target.value })} />
            </div>
            <div className="mb-4">
              <label className="form-label-custom">Nueva Hora Fin</label>
              <input type="datetime-local" className="form-control-custom"
                value={reprogramData.horaFinCita}
                onChange={e => setReprogramData({ ...reprogramData, horaFinCita: e.target.value })} />
            </div>
            <div className="d-flex gap-2">
              <button type="button" className="btn-cancel w-100"
                onClick={() => setShowReprogramModal(false)} disabled={loading}>
                Cerrar
              </button>
              <button type="button" className="btn-save w-100"
                onClick={handleConfirmarReprogram} disabled={loading}>
                {loading ? 'Guardando...' : 'Confirmar Cambio'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleAppointments;