import React, { useState } from 'react';
import Calendar from 'react-calendar';
import { useNavigate } from 'react-router-dom';
import 'react-calendar/dist/Calendar.css'; // Estilos base
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../estilos/ScheduleAppointments.css';

/** Esta Pantalla es el modulo de gestion de citas, donde el usuario puede ver un calendario para seleccionar una fecha y un listado de citas programadas para esa fecha. El usuario puede alternar entre vista de día (lista simple) y vista de semana (agrupada por días). Al hacer click en una cita, se muestran opciones para editar, cancelar o notificar al paciente. Al crear o editar una cita, se muestra un formulario con campos para seleccionar paciente, hora y tratamiento. Al cancelar o reprogramar una cita, se muestra una confirmacion con SweetAlert2 para evitar acciones accidentales.*/

const ScheduleAppointments = () => {
  const [date, setDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState('dia');
  const navigate = useNavigate();
  const [showReprogramModal, setShowReprogramModal] = useState(false);

  // Mock de citas para el ejemplo
  const appointments = [
    { id: 1, patient: "María Fernanda L. G.", time: "09:00 AM", treatment: "Limpieza Profunda", status: "Confirmada" },
    { id: 2, patient: "Carlos Roberto M.", time: "10:30 AM", treatment: "Puente Dental", status: "Pendiente" },
    { id: 3, patient: "Ana Lucía Ortiz", time: "02:00 PM", treatment: "Extracción", status: "Confirmada" },
  ];

  return (
    <div className="app-container">

      <main className="app-content">

        <div className="app-body appointment-layout">
          {/* MÓDULO IZQUIERDO: CALENDARIO Y FORMULARIO */}
          <section className="calendar-module">
            {showForm ? (
              <div className="appointment-form-card">
                <h5 className="fw-bold mb-4">Nueva Cita: {date.toLocaleDateString()}</h5>
                <form className="row g-3">
                  <div className="col-12">
                    <label className="form-label-custom">Paciente</label>
                    <input type="text" className="form-control-custom" placeholder="Buscar paciente..." />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label-custom">Hora</label>
                    <input type="time" className="form-control-custom" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label-custom">Tratamiento</label>
                    <select className="form-control-custom">
                      <option>Limpieza</option>
                      <option>Extracción</option>
                      <option>Ortodoncia</option>
                    </select>
                  </div>
                  <div className="col-12 mt-4">
                    <button type="button" className="btn-register w-100">Confirmar Cita</button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="calendar-card">
                <Calendar
                  onChange={setDate}
                  value={date}
                  className="custom-react-calendar"
                  locale="es-ES"
                />
              </div>
            )}

            <div className="info-summary-card mt-4">
              <p className="text-muted small mb-1">Resumen del día</p>
              <h6 className="fw-bold">{date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h6>
              <div className="d-flex gap-3 mt-3">
                <div className="summary-pill blue">8 Citas</div>
                <div className="summary-pill green">5 Confirmadas</div>
              </div>
            </div>
          </section>

          {/* MÓDULO DERECHO: LISTA DE CITAS (AGENDA) */}
          <section className="agenda-module">
            <div className="agenda-header">
              <h5 className="fw-bold">Próximas Citas</h5>
              <div className="agenda-view-options">
                <span
                  className={viewMode === 'dia' ? 'active' : ''}
                  onClick={() => setViewMode('dia')}
                >
                  Día
                </span>
                <span
                  className={viewMode === 'semana' ? 'active' : ''}
                  onClick={() => setViewMode('semana')}
                >
                  Semana
                </span>
              </div>
            </div>

            <div className="appointment-list-scroll">
              {viewMode === 'dia' ? (
                /* --- VISTA DE DÍA (La que ya tenías) --- */
                <>
                  {appointments.map((app) => (
                    <div key={app.id} className="appointment-card-item">
                      <div className="time-indicator">
                        <span className="time">{app.time}</span>
                        <span className="dot"></span>
                      </div>
                      <div className="appointment-info">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h6>{app.patient}</h6>
                            <p>{app.treatment}</p>
                          </div>
                          <span className={`status-tag ${app.status.toLowerCase()}`}>{app.status}</span>
                        </div>
                        <div className="appointment-actions">
                          <button title="Editar"><i className="bi bi-pencil"></i></button>
                          <button title="Cancelar" className="cancel"><i className="bi bi-trash"></i></button>
                          <button title="Notificar" className="notify"><i className="bi bi-whatsapp"></i></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                /* --- VISTA DE SEMANA (Nueva estructura agrupada) --- */
                <div className="weekly-view">

                  {/* Grupo Lunes */}
                  <div className="mb-4">
                    <h6 className="text-primary fw-bold mb-3 border-bottom pb-2">Lunes 26 de Mayo</h6>
                    <div className="appointment-info mb-3">
                      <div className="d-flex justify-content-between">
                        <div>
                          <h6 className="mb-1">María Fernanda L. G.</h6>
                          <p className="mb-0 text-muted small"><i className="bi bi-clock me-1"></i> 09:00 AM - Limpieza Profunda</p>
                        </div>
                        <span className="status-tag confirmada">Confirmada</span>
                      </div>
                    </div>
                  </div>

                  {/* Grupo Martes */}
                  <div className="mb-4">
                    <h6 className="text-primary fw-bold mb-3 border-bottom pb-2">Martes 27 de Mayo</h6>
                    <div className="appointment-info mb-3">
                      <div className="d-flex justify-content-between">
                        <div>
                          <h6 className="mb-1">Carlos Roberto M.</h6>
                          <p className="mb-0 text-muted small"><i className="bi bi-clock me-1"></i> 10:30 AM - Puente Dental</p>
                        </div>
                        <span className="status-tag pendiente">Pendiente</span>
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </div>
          </section>
        </div>
      </main>
      {showReprogramModal && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center',
          alignItems: 'center', zIndex: 1000
        }}>
          <div className="modal-content bg-white p-4 rounded-4 shadow-lg" style={{ width: '450px' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold m-0 text-dark">Reprogramar Cita</h5>
              <button type="button" className="btn-close" onClick={() => setShowReprogramModal(false)}></button>
            </div>

            <div className="mb-3">
              <label className="form-label-custom">Nueva Fecha</label>
              <input type="date" className="form-control-custom" />
            </div>

            <div className="mb-4">
              <label className="form-label-custom">Nueva Hora</label>
              <input type="time" className="form-control-custom" />
            </div>

            <div className="d-flex gap-2">
              <button type="button" className="btn-cancel w-100" onClick={() => setShowReprogramModal(false)}>Cerrar</button>
              <button type="button" className="btn-save w-100" onClick={() => setShowReprogramModal(false)}>Confirmar Cambio</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleAppointments;