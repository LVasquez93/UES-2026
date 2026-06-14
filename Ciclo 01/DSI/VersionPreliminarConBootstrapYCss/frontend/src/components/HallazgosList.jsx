import React from 'react';

const ESTADOS = ['PENDIENTE', 'PROGRAMADO', 'EN_PROGRESO', 'COMPLETADO', 'CANCELADO', 'OTRO'];

/**
 * Lista de hallazgos registrados en el odontograma.
 * Permite cambiar el estado de cada hallazgo y eliminarlos.
 */
const HallazgosList = ({ hallazgos, onCambiarEstado, onEliminar }) => {
  if (hallazgos.length === 0) return null;

  return (
    <div className="mt-3 px-2">
      <h6 className="fw-bold text-muted small mb-2">Hallazgos registrados</h6>
      <div className="hallazgos-list">
        {hallazgos.map(h => (
          <div key={h.idPlanTratamiento} className="hallazgo-item">
            <span className="hallazgo-pieza">Pieza {h.piezaDental}</span>
            <span className="hallazgo-nombre">{h.nombreTratamiento}</span>

            <select
              className={`form-select form-select-sm hallazgo-estado ${h.estadoPlan.toLowerCase()}`}
              value={h.estadoPlan}
              onChange={e => onCambiarEstado(h.idPlanTratamiento, e.target.value)}
              style={{ width: 'auto', display: 'inline-block', padding: '0.25rem 2rem 0.25rem 0.5rem' }}
              disabled={h.estadoPlan === 'COMPLETADO' || h.estadoPlan === 'CANCELADO'}
            >
              {ESTADOS.map(estado => (
                <option key={estado} value={estado}>
                  {estado.charAt(0) + estado.slice(1).toLowerCase().replace('_', ' ')}
                </option>
              ))}
            </select>

            {h.estadoPlan !== 'COMPLETADO' && (
              <button
                className="hallazgo-delete ms-auto"
                onClick={() => onEliminar(h.idPlanTratamiento)}
                title="Eliminar hallazgo"
              >
                <i className="bi bi-x" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HallazgosList;
