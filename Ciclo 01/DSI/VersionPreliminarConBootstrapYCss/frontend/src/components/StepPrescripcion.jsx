import React from 'react';

/**
 * Paso 3: Prescripción de medicamentos.
 * Panel izquierdo: formulario para agregar medicamentos a la receta.
 * Panel derecho: vista previa de la receta antes de guardar.
 */
const StepPrescripcion = ({
  hallazgos,
  medicamentos,
  prescripcion,
  setPrescripcion,
  detalles,
  detalleActual,
  setDetalleActual,
  savingPrescripcion,
  onAgregarDetalle,
  onEliminarDetalle,
  onGuardarPrescripcion,
  onFinalizar,
  onVolver,
}) => {
  return (
    <div
      className="workspace-card mt-3 animate__animated animate__fadeIn"
      style={{ display: 'block', height: 'auto' }}
    >
      <div className="p-4">
        <h5 className="fw-bold mb-4">Emitir Prescripción Médica</h5>

        {prescripcion ? (
          /* Prescripción ya guardada: mostrar opciones */
          <div className="alert alert-success d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
              <i className="bi bi-check-circle-fill me-2" />
              Ya existe una prescripción guardada para esta cita.
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-sm btn-outline-primary" onClick={() => setPrescripcion(null)}>
                <i className="bi bi-plus me-1" />Añadir más medicamentos
              </button>
              <button className="btn btn-sm btn-success" onClick={onFinalizar}>
                Finalizar Consulta <i className="bi bi-arrow-right ms-1" />
              </button>
            </div>
          </div>
        ) : (
          <div className="row g-4">

            {/* ── PANEL IZQUIERDO: Formulario ────────────────────────────── */}
            <div className="col-md-6">

              {/* Asociar a hallazgo (opcional) */}
              <div className="mb-3">
                <label className="form-label-custom">Asociar a Tratamiento / Hallazgo</label>
                <select
                  className="form-control-custom"
                  value={detalleActual.idPlanTratamiento || ''}
                  onChange={e => setDetalleActual({ ...detalleActual, idPlanTratamiento: e.target.value })}
                >
                  <option value="">Seleccione... (Opcional)</option>
                  {hallazgos
                    .filter(h => h.estadoPlan.toUpperCase() !== 'COMPLETADO')
                    .map(h => (
                      <option key={h.idPlanTratamiento} value={h.idPlanTratamiento}>
                        Pieza {h.piezaDental} — {h.nombreTratamiento}
                      </option>
                    ))}
                </select>
              </div>

              {/* Formulario del medicamento */}
              <div className="border rounded-4 p-3">
                <h6 className="fw-bold text-primary mb-3">Agregar medicamento</h6>

                <div className="mb-3">
                  <label className="form-label-custom">Medicamento</label>
                  <select
                    className="form-control-custom"
                    value={detalleActual.idMedicamento}
                    onChange={e => setDetalleActual({ ...detalleActual, idMedicamento: e.target.value })}
                  >
                    <option value="">Seleccione...</option>
                    {medicamentos.map(m => (
                      <option key={m.idMedicamento} value={m.idMedicamento}>
                        {m.nombreMedicamento} — {m.concentracion}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <label className="form-label-custom">Dosis</label>
                    <input
                      type="text"
                      className="form-control-custom"
                      placeholder="ej. 500mg"
                      value={detalleActual.dosis}
                      onChange={e => setDetalleActual({ ...detalleActual, dosis: e.target.value })}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label-custom">Frecuencia</label>
                    <input
                      type="text"
                      className="form-control-custom"
                      placeholder="ej. cada 8h"
                      value={detalleActual.frecuencia}
                      onChange={e => setDetalleActual({ ...detalleActual, frecuencia: e.target.value })}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label-custom">Duración (días)</label>
                    <input
                      type="number"
                      className="form-control-custom"
                      placeholder="ej. 7"
                      value={detalleActual.duracion}
                      onChange={e => setDetalleActual({ ...detalleActual, duracion: e.target.value })}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label-custom">Indicaciones</label>
                    <textarea
                      className="form-control-custom"
                      rows="2"
                      placeholder="Tomar con alimentos..."
                      value={detalleActual.indicaciones}
                      onChange={e => setDetalleActual({ ...detalleActual, indicaciones: e.target.value })}
                    />
                  </div>
                </div>

                <button className="btn-save w-100" onClick={() => onAgregarDetalle(hallazgos)}>
                  <i className="bi bi-plus-circle me-2" />Agregar a la receta
                </button>
              </div>
            </div>

            {/* ── PANEL DERECHO: Vista previa ────────────────────────────── */}
            <div className="col-md-6">
              <div className="border rounded-4 p-3 h-100 d-flex flex-column">
                <h6 className="fw-bold text-primary mb-3">
                  <i className="bi bi-file-medical me-2" />Vista previa de receta
                </h6>

                {detalles.length === 0 ? (
                  <p className="text-muted small text-center mt-4">
                    Agrega medicamentos para ver la receta aquí.
                  </p>
                ) : (
                  <div className="flex-grow-1" style={{ overflowY: 'auto' }}>
                    {detalles.map((d, idx) => (
                      <div key={idx} className="receta-item mb-3 p-2 border rounded-3">
                        <div className="d-flex justify-content-between align-items-start">
                          <strong className="small">{d.nombreMedicamento}</strong>
                          <button
                            className="btn btn-sm btn-link text-danger p-0"
                            onClick={() => onEliminarDetalle(idx)}
                          >
                            <i className="bi bi-x" />
                          </button>
                        </div>
                        <p className="mb-0 text-muted small">
                          {d.dosis} — {d.frecuencia} — {d.duracion} días
                        </p>
                        {d.indicaciones && (
                          <p className="mb-0 text-muted small">{d.indicaciones}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-auto d-flex flex-column gap-2 pt-3 border-top">
                  <button className="btn-cancel" onClick={onVolver}>
                    <i className="bi bi-arrow-left me-1" />Volver al odontograma
                  </button>
                  <button
                    className="btn-register"
                    onClick={onGuardarPrescripcion}
                    disabled={savingPrescripcion || detalles.length === 0}
                  >
                    {savingPrescripcion ? 'Guardando...' : 'Guardar Receta'}
                  </button>
                  <button className="btn btn-outline-success mt-2" onClick={onFinalizar}>
                    Finalizar cita sin medicamentos
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StepPrescripcion;
