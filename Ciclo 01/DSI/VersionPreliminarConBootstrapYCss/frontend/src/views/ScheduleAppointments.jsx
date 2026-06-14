import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../estilos/ScheduleAppointments.css';

// Hook con toda la lógica de negocio y los helpers de fecha/hora
import { useAgenda, formatFechaHeader } from '../hooks/useAgenda';

// Componentes de UI
import AppointmentForm  from '../components/AppointmentForm';
import AppointmentCard  from '../components/AppointmentCard';
import ReprogramModal   from '../components/ReprogramModal';

/**
 * ScheduleAppointments — Componente orquestador de la agenda.
 *
 * Responsabilidades de este archivo:
 *   1. Controlar la fecha seleccionada en el calendario (date)
 *   2. Controlar la vista activa (día / semana) y la visibilidad del formulario
 *   3. Instanciar useAgenda y pasar sus datos/acciones a los componentes hijos
 *
 * Toda la lógica de fetch y CRUD vive en useAgenda.
 * Toda la UI de cada pieza vive en su propio componente.
 */
const ScheduleAppointments = () => {
  const [date, setDate]         = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState('dia');
  const [showReprogram, setShowReprogram] = useState(false);

  // ── Hook principal ─────────────────────────────────────────────────────────
  const agenda = useAgenda(date);

  // ── Handlers de apertura ───────────────────────────────────────────────────

  const handleNuevaCita = () => {
    agenda.prepararNuevaCita();
    setShowForm(true);
  };

  const handleEditarCita = (cita) => {
    agenda.prepararEditarCita(cita);
    setShowForm(true);
  };

  const handleAbrirReprogram = (cita) => {
    agenda.setSelectedCita(cita);
    setShowReprogram(true);
  };

  // ── Tile del calendario: punto en días con citas ───────────────────────────
  const tileContent = ({ date: tileDate, view }) => {
    if (view !== 'month') return null;
    const key = tileDate.toISOString().split('T')[0];
    if (agenda.citasPorFecha[key]?.length > 0) {
      return (
        <div style={{
          width: '5px', height: '5px', borderRadius: '50%',
          backgroundColor: '#0d6efd', margin: '0 auto',
        }} />
      );
    }
    return null;
  };

  return (
    <div className="app-container">
      <main className="app-content">
        <div className="app-body appointment-layout">

          {/* ── MÓDULO IZQUIERDO: CALENDARIO O FORMULARIO ─────────────────── */}
          <section className="calendar-module">
            {showForm ? (
              <AppointmentForm
                isEditing={agenda.isEditing}
                date={date}
                formData={agenda.formData}
                pacientes={agenda.pacientes}
                odontologos={agenda.odontologos}
                loading={agenda.loading}
                onChange={agenda.handleChange}
                onSubmit={() => agenda.handleSubmit(() => setShowForm(false))}
                onCancelar={() => setShowForm(false)}
              />
            ) : (
              <div className="calendar-card">
                <Calendar
                  onChange={setDate}
                  value={date}
                  className="custom-react-calendar"
                  locale="es-ES"
                  tileContent={tileContent}
                />
                <button className="btn-register w-100 mt-3" onClick={handleNuevaCita}>
                  <i className="bi bi-plus-circle me-2" />Nueva Cita
                </button>
              </div>
            )}

            {/* Resumen del día seleccionado */}
            <div className="info-summary-card mt-4">
              <p className="text-muted small mb-1">Resumen del día</p>
              <h6 className="fw-bold">
                {date.toLocaleDateString('es-ES', {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                })}
              </h6>
              <div className="d-flex gap-3 mt-3">
                <div className="summary-pill blue">{agenda.citasDelDia.length} Citas</div>
                <div className="summary-pill green">
                  {agenda.citasDelDia.filter(c => c.estadoCita === 'CONFIRMADA').length} Confirmadas
                </div>
              </div>
            </div>
          </section>

          {/* ── MÓDULO DERECHO: LISTA DE CITAS ────────────────────────────── */}
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
              {agenda.loading && !agenda.appointments.length && (
                <p className="text-muted small text-center p-3">Cargando citas...</p>
              )}

              {/* ── VISTA DÍA ─────────────────────────────────────────────── */}
              {viewMode === 'dia' && (
                <>
                  {agenda.citasDelDia.length === 0 && !agenda.loading && (
                    <p className="text-muted small text-center p-4">No hay citas para este día.</p>
                  )}
                  {agenda.citasDelDia.map(app => (
                    <AppointmentCard
                      key={app.idCitas}
                      app={app}
                      onEditar={handleEditarCita}
                      onCancelar={agenda.handleCancelar}
                      onReprogram={handleAbrirReprogram}
                    />
                  ))}
                </>
              )}

              {/* ── VISTA SEMANA ───────────────────────────────────────────── */}
              {viewMode === 'semana' && (
                <div className="weekly-view">
                  {Object.keys(agenda.citasPorFecha).sort().map(fechaKey => (
                    <div key={fechaKey} className="mb-4">
                      <h6 className="text-primary fw-bold mb-3 border-bottom pb-2">
                        {formatFechaHeader(fechaKey)}
                      </h6>
                      {agenda.citasPorFecha[fechaKey].map(app => (
                        <AppointmentCard
                          key={app.idCitas}
                          app={app}
                          compact
                          onEditar={handleEditarCita}
                          onCancelar={agenda.handleCancelar}
                        />
                      ))}
                    </div>
                  ))}
                  {Object.keys(agenda.citasPorFecha).length === 0 && !agenda.loading && (
                    <p className="text-muted small text-center p-4">No hay citas registradas.</p>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* ── MODAL DE REPROGRAMACIÓN ──────────────────────────────────────── */}
      {showReprogram && (
        <ReprogramModal
          cita={agenda.selectedCita}
          loading={agenda.loading}
          onConfirmar={(reprogramData) =>
            agenda.handleReprogramar(
              agenda.selectedCita.idCitas,
              reprogramData,
              () => setShowReprogram(false)
            )
          }
          onCerrar={() => setShowReprogram(false)}
        />
      )}
    </div>
  );
};

export default ScheduleAppointments;
