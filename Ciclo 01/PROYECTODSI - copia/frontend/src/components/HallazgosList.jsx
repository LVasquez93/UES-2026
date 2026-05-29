import React from 'react';
import { ESTADOS_HALLAZGO_OPCIONES, ESTADO_HALLAZGO } from '../constants/estados.constants';
import { HALLAZGO_ESTADO_CONFIG } from '../utils/cita.utils';
import 'bootstrap-icons/font/bootstrap-icons.css';

/**
 * Lista de hallazgos registrados en el odontograma.
 * Permite cambiar el estado de cada uno y eliminarlos.
 */
const HallazgosList = ({ hallazgos, onCambiarEstado, onEliminar }) => {
  if (!hallazgos?.length) return null;

  return (
    <div className="mt-4 px-1">
      <h6 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
        Hallazgos registrados ({hallazgos.length})
      </h6>
      <div className="space-y-2">
        {hallazgos.map(h => {
          const esFinal = [ESTADO_HALLAZGO.COMPLETADO, ESTADO_HALLAZGO.CANCELADO].includes(h.estadoPlan);
          const estadoConf = HALLAZGO_ESTADO_CONFIG[h.estadoPlan] ?? HALLAZGO_ESTADO_CONFIG.OTRO;

          return (
            <div
              key={h.idPlanTratamiento}
              className="flex items-center gap-2 p-2.5 bg-white border border-slate-100
                         rounded-xl hover:border-slate-200 transition-colors"
            >
              {/* Pieza dental */}
              <span className="w-14 text-center text-xs font-bold text-primary-700
                               bg-primary-50 rounded-lg py-1 flex-shrink-0">
                P.{h.piezaDental}
              </span>

              {/* Nombre del tratamiento */}
              <span className="flex-1 text-sm text-slate-700 font-medium truncate min-w-0">
                {h.nombreTratamiento}
              </span>

              {/* Select de estado */}
              <select
                value={h.estadoPlan}
                onChange={e => onCambiarEstado(h.idPlanTratamiento, e.target.value)}
                disabled={esFinal}
                aria-label={`Estado de hallazgo pieza ${h.piezaDental}`}
                className={`text-xs px-2 py-1.5 rounded-lg border-0 font-medium outline-none
                            cursor-pointer disabled:cursor-default transition-colors
                            focus:ring-2 focus:ring-primary-500 ${estadoConf.tw}`}
              >
                {ESTADOS_HALLAZGO_OPCIONES.map(e => (
                  <option key={e.value} value={e.value}>{e.label}</option>
                ))}
              </select>

              {/* Botón eliminar */}
              {!esFinal && (
                <button
                  type="button"
                  onClick={() => onEliminar(h.idPlanTratamiento)}
                  aria-label={`Eliminar hallazgo pieza ${h.piezaDental}`}
                  className="w-7 h-7 flex items-center justify-center text-slate-400
                             hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors flex-shrink-0"
                >
                  <i className="bi bi-x text-sm" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HallazgosList;
