import React from 'react';

/**
 * Paso 4: Pantalla de cierre de consulta.
 * Muestra un resumen de lo registrado y opciones para imprimir o volver.
 */
const StepCierre = ({ cita, hallazgos, prescripcion, onVolver }) => {
  return (
    <div
      className="workspace-card mt-3 animate__animated animate__fadeIn"
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
    >
      <div className="text-center py-5">
        <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '5rem' }} />
        <h2 className="fw-bold mt-4">Consulta Finalizada</h2>
        <p className="text-muted">
          El diagnóstico, hallazgos y prescripción han sido guardados en el expediente de{' '}
          <strong>{cita.nombreCompletoPaciente}</strong>.
        </p>

        {/* Resumen de lo registrado */}
        <div className="d-flex justify-content-center gap-3 mt-3 mb-5">
          <div className="summary-pill blue">{hallazgos.length} Hallazgos</div>
          <div className="summary-pill green">{prescripcion?.detalles?.length || 0} Medicamentos</div>
        </div>

        <div className="d-flex justify-content-center gap-3">
          <button className="btn btn-outline-primary px-4" onClick={() => window.print()}>
            <i className="bi bi-printer me-2" />Imprimir Receta
          </button>
          <button className="btn-register px-4" onClick={onVolver}>
            <i className="bi bi-house me-2" />Volver a Consultas
          </button>
        </div>
      </div>
    </div>
  );
};

export default StepCierre;
