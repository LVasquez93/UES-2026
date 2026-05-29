import React, { useState } from 'react';
import { Odontogram } from 'react-odontogram';
// IMPORTANTE: mantener este import — proviene del paquete npm, no del CSS propio
import 'react-odontogram/style.css';
import HallazgosList from './HallazgosList';
import TratamientoSelector from './TratamientoSelector';
import Button from './ui/Button';
import 'bootstrap-icons/font/bootstrap-icons.css';

const FILTERS = ['Hallazgos', 'Presupuestado', 'Programado', 'Realizado'];

/**
 * Paso 2: Odontograma y registro de hallazgos.
 * FIX BUG-07: props de TratamientoSelector alineadas con su nueva interfaz.
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
  onOdontogramChange,
  onRegistrarHallazgo,
  onCrearTratamiento,
  // Navegación
  onVolver,
  onContinuar,
}) => {
  const [activeFilter, setActiveFilter] = useState('Hallazgos');
  const showHistorial = activeFilter === 'Programado' || activeFilter === 'Realizado';
  const piecesText = selectedTeeth.map(t => t.notations?.fdi || t.id).join(', ');

  return (
    <div className="flex gap-4 mt-4 flex-1 overflow-hidden animate-fade-in">

      {/* ── COLUMNA IZQUIERDA: Odontograma ──────────────────────────────── */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200
                      shadow-card overflow-hidden min-w-0">

        {/* Barra de filtros */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 flex-shrink-0">
          <i className="bi bi-funnel text-slate-400 text-sm" />
          <span className="text-xs text-slate-400">Filtros:</span>
          {FILTERS.map(f => (
            <button
              key={f}
              type="button"
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                          ${activeFilter === f
                            ? 'bg-primary-600 text-white'
                            : 'text-slate-600 hover:bg-slate-100'}`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Contenido principal */}
        <div className="flex-1 overflow-y-auto p-4">
          {showHistorial ? (
            <div>
              <h6 className="font-bold text-primary-700 text-sm flex items-center gap-2 mb-3">
                <i className="bi bi-clock-history" />
                {activeFilter === 'Realizado' ? 'Historial de Tratamientos' : 'Tratamientos Programados'}
              </h6>
              <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200
                              rounded-xl text-sm text-slate-500 mb-3">
                <i className="bi bi-info-circle text-primary-500" />
                Historial global de {cita.nombreCompletoPaciente}.
              </div>
              <div className="text-center py-8 text-slate-400">
                <i className="bi bi-folder2-open text-4xl block mb-2" />
                <p className="text-sm">Conectando historial...</p>
              </div>
            </div>
          ) : (
            <>
              <Odontogram
                onChange={onOdontogramChange}
                theme="light"
                notation="FDI"
              />
              <p className="text-center text-xs text-slate-400 mt-3">
                Selecciona piezas y registra el tratamiento en el panel derecho
              </p>
            </>
          )}
        </div>

        {/* Lista de hallazgos */}
        <div className="border-t border-slate-100 px-4 pb-4 max-h-64 overflow-y-auto">
          <HallazgosList
            hallazgos={hallazgos}
            onCambiarEstado={onCambiarEstado}
            onEliminar={onEliminarHallazgo}
          />
        </div>
      </div>

      {/* ── COLUMNA DERECHA: Panel de registro ──────────────────────────── */}
      <aside className="w-72 flex-shrink-0 flex flex-col bg-white rounded-2xl
                        border border-slate-200 shadow-card p-4 gap-4 overflow-y-auto">

        <h6 className="font-bold text-slate-800 text-sm">Registrar hallazgo</h6>

        {/* Piezas seleccionadas */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Piezas seleccionadas (FDI)
          </label>
          <input
            type="text"
            value={piecesText}
            readOnly
            placeholder="Selecciona en el odontograma..."
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50
                       text-slate-600 outline-none"
          />
        </div>

        {/* Selector de tratamiento — FIX BUG-07 */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Tratamiento</label>
          <TratamientoSelector
            tratamientos={tratamientos}
            selectedId={selectedTratamiento}
            onSelect={(id) => {
              setSelectedTratamiento(id);
              const t = tratamientos.find(tr => String(tr.idTratamiento) === id);
              if (t) setCustomPrecio(String(t.costoTratamiento));
            }}
            onCrear={onCrearTratamiento}
            crearLoading={savingHallazgo}
          />
        </div>

        {/* Precio aplicado */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Precio aplicado ($)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={customPrecio}
            onChange={e => setCustomPrecio(e.target.value)}
            placeholder="0.00"
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-white
                       text-slate-800 outline-none focus:ring-2 focus:ring-primary-500
                       focus:border-transparent transition-all"
          />
        </div>

        {/* Botón registrar */}
        <Button
          fullWidth
          onClick={onRegistrarHallazgo}
          loading={savingHallazgo}
          disabled={selectedTeeth.length === 0 || !selectedTratamiento || savingHallazgo}
        >
          <i className="bi bi-plus-circle" />
          Registrar hallazgo
        </Button>

        <div className="mt-auto flex flex-col gap-2">
          <Button variant="secondary" fullWidth onClick={onVolver} icon={<i className="bi bi-arrow-left" />}>
            Volver a evaluación
          </Button>
          <Button fullWidth onClick={onContinuar}>
            Continuar a prescripción
            <i className="bi bi-arrow-right" />
          </Button>
        </div>
      </aside>
    </div>
  );
};

export default StepOdontograma;
