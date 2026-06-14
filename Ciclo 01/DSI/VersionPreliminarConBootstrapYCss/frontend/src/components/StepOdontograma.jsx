import React, { useState } from 'react';
import { Odontogram } from 'react-odontogram';
import 'react-odontogram/style.css';
import HallazgosList from './HallazgosList';
import TratamientoSelector from './TratamientoSelector';

const FILTERS = ['Hallazgos', 'Presupuestado', 'Programado', 'Realizado'];

/**
 * Paso 2: Odontograma y registro de hallazgos.
 * Columna izquierda: odontograma o tabla de historial según filtro activo.
 * Columna derecha: panel de registro con selector de tratamiento.
 *
 * 🐛 BUG CORREGIDO (línea original ~621):
 *    La condición `activeFilter === 'Programado' || activeFilter === 'Realizado' ? ...`
 *    no tenía paréntesis, causando que el operador ternario nunca se evaluara
 *    correctamente para mostrar la tabla. Corregido con paréntesis explícitos.
 */
const StepOdontograma = ({
  cita,
  // Hallazgos
  hallazgos,
  onCambiarEstado,
  onEliminarHallazgo,
  // Tratamientos
  tratamientos,
  selectedTeeth,
  selectedTratamiento, setSelectedTratamiento,
  customPrecio, setCustomPrecio,
  savingHallazgo,
  mostrarFormNuevo, setMostrarFormNuevo,
  nuevoTratamiento, setNuevoTratamiento,
  onOdontogramChange,
  onRegistrarHallazgo,
  onCrearNuevoTratamiento,
  // Navegación
  onVolver,
  onContinuar,
}) => {
  const [activeFilter, setActiveFilter] = useState('Hallazgos');

  const piecesText = selectedTeeth.map(t => t.notations?.fdi || t.id).join(', ');

  // ✅ FIX: paréntesis explícitos para que el || no rompa el ternario
  const showHistorial = (activeFilter === 'Programado' || activeFilter === 'Realizado');

  return (
    <div className="workspace-card mt-3 animate__animated animate__fadeIn">

      {/* ── COLUMNA IZQUIERDA ─────────────────────────────────────────────── */}
      <div className="odontogram-section">

        {/* Barra de filtros */}
        <div className="filters-bar">
          <i className="bi bi-funnel text-muted" />
          <span className="small text-muted">Filtros:</span>
          {FILTERS.map(f => (
            <button
              key={f}
              className={`filter-pill ${activeFilter === f ? 'active' : ''}`}
              onClick={() => setActiveFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        <div
          className="odontogram-container"
          style={{ minHeight: '400px', display: 'flex', flexDirection: 'column' }}
        >
          {/* ✅ Condición corregida con paréntesis */}
          {showHistorial ? (
            <div className="w-100 p-3 border rounded-3 bg-white" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <h6 className="fw-bold text-primary mb-3">
                <i className="bi bi-clock-history me-2" />
                {activeFilter === 'Realizado' ? 'Historial de Tratamientos' : 'Tratamientos Programados'}
              </h6>
              <div className="alert alert-light border small text-muted">
                <i className="bi bi-info-circle me-2" />
                Aquí se visualizará el historial global de {cita.nombreCompletoPaciente}.
              </div>
              <table className="table table-hover table-sm mt-2">
                <thead className="table-light">
                  <tr>
                    <th>Fecha</th>
                    <th>Pieza</th>
                    <th>Tratamiento</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan="4" className="text-center text-muted py-4">
                      <i className="bi bi-folder2-open d-block mb-2" style={{ fontSize: '1.5rem' }} />
                      Conectando historial...
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <>
              <Odontogram
                onChange={onOdontogramChange}
                theme="light"
                notation="FDI"
                className="custom-odontogram"
              />
              <p className="text-center text-muted small mt-2">
                Selecciona piezas en el gráfico y registra el tratamiento en el panel derecho
              </p>
            </>
          )}
        </div>

        {/* Lista de hallazgos debajo del odontograma */}
        <HallazgosList
          hallazgos={hallazgos}
          onCambiarEstado={onCambiarEstado}
          onEliminar={onEliminarHallazgo}
        />
      </div>

      {/* ── COLUMNA DERECHA: PANEL DE REGISTRO ───────────────────────────── */}
      <aside className="control-panel">
        <div className="row g-3 mb-3">

          {/* Piezas seleccionadas */}
          <div className="col-12">
            <label className="form-label-custom">Piezas seleccionadas (FDI)</label>
            <input
              type="text"
              className="form-control-custom"
              value={piecesText}
              placeholder="Selecciona en el odontograma..."
              readOnly
            />
          </div>

          {/* Selector de tratamiento (componente reutilizable) */}
          <div className="col-12">
            <TratamientoSelector
              tratamientos={tratamientos}
              selectedTratamiento={selectedTratamiento}
              setSelectedTratamiento={setSelectedTratamiento}
              customPrecio={customPrecio}
              setCustomPrecio={setCustomPrecio}
              mostrarFormNuevo={mostrarFormNuevo}
              setMostrarFormNuevo={setMostrarFormNuevo}
              nuevoTratamiento={nuevoTratamiento}
              setNuevoTratamiento={setNuevoTratamiento}
              onCrearNuevo={onCrearNuevoTratamiento}
            />
          </div>
        </div>

        <button
          className="btn-register mb-3"
          onClick={onRegistrarHallazgo}
          disabled={savingHallazgo || selectedTeeth.length === 0 || !selectedTratamiento || mostrarFormNuevo}
        >
          {savingHallazgo ? 'Registrando...' : 'Registrar Hallazgo'}
        </button>

        <div className="mt-auto d-flex flex-column gap-2">
          <button className="btn-cancel" onClick={onVolver}>
            <i className="bi bi-arrow-left me-1" />Volver a evaluación
          </button>
          <button className="btn-register" onClick={onContinuar}>
            Continuar a prescripción<i className="bi bi-arrow-right ms-1" />
          </button>
        </div>
      </aside>
    </div>
  );
};

export default StepOdontograma;
