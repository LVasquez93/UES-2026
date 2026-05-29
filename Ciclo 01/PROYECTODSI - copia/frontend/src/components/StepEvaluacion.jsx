import React from 'react';
import Button from './ui/Button';
import 'bootstrap-icons/font/bootstrap-icons.css';

const FieldLabel = ({ children, required }) => (
  <label className="block text-xs font-medium text-slate-600 mb-1">
    {children}{required && <span className="text-red-500 ml-0.5">*</span>}
  </label>
);

const Textarea = ({ rows = 3, ...props }) => (
  <textarea
    rows={rows}
    {...props}
    className={`w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-white
                text-slate-800 placeholder-slate-400 outline-none resize-none
                focus:ring-2 focus:ring-primary-500 focus:border-transparent
                transition-all ${props.className ?? ''}`}
  />
);

/**
 * Paso 1: Evaluación clínica inicial.
 */
const StepEvaluacion = ({
  cita, evaluacion,
  diagnostico,    setDiagnostico,
  observaciones,  setObservaciones,
  savingEval, onGuardar, onContinuar,
}) => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-card mt-4 animate-fade-in flex-1 overflow-y-auto">
    <div className="p-6">
      <h5 className="font-bold text-slate-800 mb-5">Revisión inicial del paciente</h5>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Alergias */}
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <h6 className="font-bold text-red-700 text-sm flex items-center gap-2 mb-1">
            <i className="bi bi-exclamation-triangle-fill" />Alergias y alertas
          </h6>
          <p className="text-xs text-red-600">
            Verificar alergias en el expediente del paciente antes de proceder.
          </p>
        </div>

        {/* Estado de la cita */}
        <div className="p-4 bg-primary-50 border border-primary-200 rounded-xl">
          <h6 className="font-bold text-primary-700 text-sm mb-2">Estado de la cita</h6>
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
            ${cita.estadoCita === 'PROGRAMADA'
              ? 'bg-amber-100 text-amber-700'
              : 'bg-emerald-100 text-emerald-700'}`}>
            {cita.estadoCita}
          </span>
        </div>
      </div>

      {/* Diagnóstico */}
      <div className="mb-4">
        <FieldLabel required>Diagnóstico inicial</FieldLabel>
        <Textarea
          rows={3}
          placeholder="Describe el motivo de consulta y hallazgos iniciales..."
          value={diagnostico}
          onChange={e => setDiagnostico(e.target.value)}
        />
      </div>

      {/* Observaciones */}
      <div className="mb-6">
        <FieldLabel>Observaciones adicionales</FieldLabel>
        <Textarea
          rows={2}
          placeholder="Observaciones, antecedentes relevantes..."
          value={observaciones}
          onChange={e => setObservaciones(e.target.value)}
        />
      </div>

      <div className="flex justify-end gap-2">
        {evaluacion && (
          <Button variant="secondary" onClick={onContinuar}>
            Continuar sin cambios
          </Button>
        )}
        <Button onClick={onGuardar} loading={savingEval}>
          Guardar y continuar
        </Button>
      </div>
    </div>
  </div>
);

export default StepEvaluacion;
