import React from 'react';

/**
 * Banner superior de la consulta activa.
 * Muestra los datos del paciente y el indicador de pasos.
 */
const STEPS = [
  { num: 1, label: 'Evaluación' },
  { num: 2, label: 'Odontograma' },
  { num: 3, label: 'Prescripción' },
  { num: 4, label: 'Cierre' },
];

const ConsultaBanner = ({ cita, step, onStepClick, onVolver }) => {
  return (
    <div className="consultation-banner animate__animated animate__fadeInDown">

      {/* Chip del paciente */}
      <div className="d-flex align-items-center gap-3">
        <div
          className="consultation-status-dot"
          style={{ backgroundColor: step >= 4 ? '#22c55e' : '#f59e0b' }}
        />
        <div>
          <span className="text-muted small d-block">Consulta en curso</span>
          <h6 className="fw-bold m-0">{cita.nombreCompletoPaciente}</h6>
        </div>
        <div className="vr mx-2" />
        <div>
          <span className="text-muted small d-block">DUI</span>
          <span className="fw-semibold small">{cita.numeroIdentidadPaciente}</span>
        </div>
        <div className="vr mx-2" />
        <div>
          <span className="text-muted small d-block">Especialidad</span>
          <span className="fw-semibold small">{cita.especialidadOdontologo}</span>
        </div>
      </div>

      {/* Indicador de pasos */}
      <div className="steps-indicator">
        {STEPS.map(s => (
          <div
            key={s.num}
            className={`step-pill ${step === s.num ? 'active' : step > s.num ? 'done' : ''}`}
            onClick={() => step > s.num && onStepClick(s.num)}
            style={{ cursor: step > s.num ? 'pointer' : 'default' }}
          >
            {step > s.num
              ? <i className="bi bi-check-circle-fill me-1" />
              : <span className="step-number">{s.num}</span>
            }
            {s.label}
          </div>
        ))}
      </div>

      {/* Botón volver */}
      <button className="btn btn-sm btn-outline-secondary" onClick={onVolver}>
        <i className="bi bi-arrow-left me-1" />Volver
      </button>
    </div>
  );
};

export default ConsultaBanner;
