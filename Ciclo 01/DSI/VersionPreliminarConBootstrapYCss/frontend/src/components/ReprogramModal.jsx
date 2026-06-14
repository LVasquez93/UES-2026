import React, { useState } from 'react';

/**
 * Modal para reprogramar una cita existente.
 * Maneja su propio estado de fecha/hora interno (reprogramData)
 * y delega el guardado al handler del hook useAgenda.
 *
 * Props:
 *   cita       - cita seleccionada a reprogramar (para mostrar el nombre)
 *   loading    - boolean: deshabilita acciones mientras guarda
 *   onConfirmar - (reprogramData) => void  →  llamado con los nuevos datos
 *   onCerrar   - cierra el modal sin guardar
 */
const ReprogramModal = ({ cita, loading, onConfirmar, onCerrar }) => {
  const [reprogramData, setReprogramData] = useState({
    fechaCita:      '',
    horaInicioCita: '',
    horaFinCita:    '',
  });

  const handleChange = (campo, valor) => {
    setReprogramData(prev => ({ ...prev, [campo]: valor }));
  };

  return (
    <div
      className="modal-overlay"
      style={{
        position:        'fixed',
        top: 0, left: 0,
        width: '100%', height: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)',
        display:         'flex',
        justifyContent:  'center',
        alignItems:      'center',
        zIndex:          1000,
      }}
    >
      <div
        className="modal-content bg-white p-4 rounded-4 shadow-lg"
        style={{ width: '450px' }}
      >
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="fw-bold m-0 text-dark">Reprogramar Cita</h5>
          <button type="button" className="btn-close" onClick={onCerrar} />
        </div>

        {/* Paciente */}
        {cita && (
          <p className="text-muted small mb-3">
            Paciente: <strong>{cita.nombreCompletoPaciente}</strong>
          </p>
        )}

        {/* Nueva Fecha */}
        <div className="mb-3">
          <label className="form-label-custom">Nueva Fecha</label>
          <input
            type="date"
            className="form-control-custom"
            value={reprogramData.fechaCita}
            onChange={e => handleChange('fechaCita', e.target.value)}
          />
        </div>

        {/* Hora Inicio */}
        <div className="mb-3">
          <label className="form-label-custom">Nueva Hora Inicio</label>
          <input
            type="datetime-local"
            className="form-control-custom"
            value={reprogramData.horaInicioCita}
            onChange={e => handleChange('horaInicioCita', e.target.value)}
          />
        </div>

        {/* Hora Fin */}
        <div className="mb-4">
          <label className="form-label-custom">Nueva Hora Fin</label>
          <input
            type="datetime-local"
            className="form-control-custom"
            value={reprogramData.horaFinCita}
            onChange={e => handleChange('horaFinCita', e.target.value)}
          />
        </div>

        {/* Acciones */}
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn-cancel w-100"
            onClick={onCerrar}
            disabled={loading}
          >
            Cerrar
          </button>
          <button
            type="button"
            className="btn-save w-100"
            onClick={() => onConfirmar(reprogramData)}
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Confirmar Cambio'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReprogramModal;
