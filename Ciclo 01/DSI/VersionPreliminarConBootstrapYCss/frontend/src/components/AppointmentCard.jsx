import React from 'react';
import { formatHora, getStatusClass } from '../hooks/useAgenda';

/**
 * Tarjeta de cita reutilizable.
 * Se usa tanto en la vista día (con indicador de hora lateral)
 * como en la vista semana (modo compacto, sin indicador lateral).
 *
 * Props:
 *   app        - objeto cita del backend
 *   compact    - boolean: true = vista semana (sin dot de tiempo), false = vista día
 *   onEditar   - callback al hacer clic en editar
 *   onCancelar - callback al hacer clic en cancelar
 *   onReprogram - callback al hacer clic en reprogramar
 */
const AppointmentCard = ({ app, compact = false, onEditar, onCancelar, onReprogram }) => {
  const statusClass = getStatusClass(app.estadoCita);

  if (compact) {
    // ── Vista semana: compacta, sin indicador de tiempo lateral ──────────────
    return (
      <div className="appointment-info mb-3">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h6 className="mb-1">{app.nombreCompletoPaciente}</h6>
            <p className="mb-0 text-muted small">
              <i className="bi bi-clock me-1" />
              {formatHora(app.horaInicioCita)} — {app.especialidadOdontologo}
            </p>
          </div>
          <div className="d-flex flex-column align-items-end gap-1">
            <span className={`status-tag ${statusClass}`}>{app.estadoCita}</span>
            <div className="appointment-actions">
              <button title="Editar" onClick={() => onEditar(app)}>
                <i className="bi bi-pencil" />
              </button>
              {app.estadoCita !== 'CANCELADA' && (
                <button title="Cancelar" className="cancel" onClick={() => onCancelar(app)}>
                  <i className="bi bi-trash" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Vista día: con indicador de hora y todas las acciones ─────────────────
  return (
    <div className="appointment-card-item">
      <div className="time-indicator">
        <span className="time">{formatHora(app.horaInicioCita)}</span>
        <span className="dot" />
      </div>
      <div className="appointment-info">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h6>{app.nombreCompletoPaciente}</h6>
            <p>{app.especialidadOdontologo}</p>
          </div>
          <span className={`status-tag ${statusClass}`}>{app.estadoCita}</span>
        </div>
        <div className="appointment-actions">
          <button title="Editar" onClick={() => onEditar(app)}>
            <i className="bi bi-pencil" />
          </button>
          {app.estadoCita !== 'CANCELADA' && (
            <button title="Cancelar" className="cancel" onClick={() => onCancelar(app)}>
              <i className="bi bi-trash" />
            </button>
          )}
          {onReprogram && (
            <button title="Reprogramar" className="notify" onClick={() => onReprogram(app)}>
              <i className="bi bi-calendar-event" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentCard;
