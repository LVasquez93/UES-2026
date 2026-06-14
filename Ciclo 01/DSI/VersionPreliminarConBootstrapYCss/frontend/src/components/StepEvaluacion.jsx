import React from 'react';

/**
 * Paso 1: Evaluación clínica inicial.
 * Muestra las alertas del paciente, el formulario de diagnóstico y observaciones.
 */
const StepEvaluacion = ({
  cita,
  evaluacion,
  diagnostico,
  setDiagnostico,
  observaciones,
  setObservaciones,
  savingEval,
  onGuardar,
  onContinuar,
}) => {
  return (
    <div
      className="workspace-card mt-3 animate__animated animate__fadeIn"
      style={{ display: 'block', height: 'auto' }}
    >
      <div className="row g-4 p-4">

        <div className="col-12">
          <h5 className="fw-bold mb-3">Revisión inicial del paciente</h5>
        </div>

        {/* Alergias y alertas */}
        <div className="col-md-6">
          <div className="p-3 border rounded-3" style={{ backgroundColor: '#fff5f5', borderColor: '#fca5a5' }}>
            <h6 className="fw-bold" style={{ color: '#dc2626' }}>
              <i className="bi bi-exclamation-triangle-fill me-2" />Alergias y alertas
            </h6>
            <p className="mb-0 small">
              Verificar alergias en el expediente del paciente antes de proceder.
            </p>
          </div>
        </div>

        {/* Estado de la cita */}
        <div className="col-md-6">
          <div className="p-3 border rounded-3">
            <h6 className="fw-bold text-primary">Estado de la cita</h6>
            <span className={`badge ${cita.estadoCita === 'PROGRAMADA' ? 'bg-warning text-dark' : 'bg-success'}`}>
              {cita.estadoCita}
            </span>
          </div>
        </div>

        {/* Diagnóstico */}
        <div className="col-12">
          <label className="form-label-custom">Diagnóstico inicial *</label>
          <textarea
            className="form-control-custom"
            rows="3"
            placeholder="Describe el motivo de consulta y hallazgos iniciales..."
            value={diagnostico}
            onChange={e => setDiagnostico(e.target.value)}
          />
        </div>

        {/* Observaciones */}
        <div className="col-12">
          <label className="form-label-custom">Observaciones adicionales</label>
          <textarea
            className="form-control-custom"
            rows="2"
            placeholder="Observaciones, antecedentes relevantes..."
            value={observaciones}
            onChange={e => setObservaciones(e.target.value)}
          />
        </div>

        <div className="col-12 d-flex justify-content-end gap-2">
          {/* Permitir saltar si ya hay evaluación guardada */}
          {evaluacion && (
            <button className="btn-cancel" onClick={onContinuar}>
              Continuar sin cambios
            </button>
          )}
          <button className="btn-register px-5" onClick={onGuardar} disabled={savingEval}>
            {savingEval ? 'Guardando...' : 'Guardar y continuar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StepEvaluacion;
