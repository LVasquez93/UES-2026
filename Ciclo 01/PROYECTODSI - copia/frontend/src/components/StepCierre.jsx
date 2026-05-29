import React from 'react';
import Button from './ui/Button';
import 'bootstrap-icons/font/bootstrap-icons.css';

/**
 * Paso 4: Pantalla de cierre de consulta.
 * Muestra resumen y opciones para imprimir o volver.
 */
const StepCierre = ({ cita, hallazgos, prescripcion, onVolver }) => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-card mt-4
                  flex-1 flex items-center justify-center animate-fade-in">
    <div className="text-center py-12 px-8 max-w-md">

      {/* Ícono de éxito */}
      <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center
                      mx-auto mb-6">
        <i className="bi bi-check-circle-fill text-emerald-500 text-5xl" />
      </div>

      <h2 className="text-2xl font-bold text-slate-800 mb-2">Consulta Finalizada</h2>
      <p className="text-slate-500 text-sm mb-6">
        El diagnóstico, hallazgos y prescripción han sido guardados en el expediente de{' '}
        <strong className="text-slate-700">{cita.nombreCompletoPaciente}</strong>.
      </p>

      {/* Resumen de lo registrado */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <div className="flex items-center gap-1.5 px-4 py-2 bg-sky-50 text-sky-700
                        rounded-full text-sm font-semibold">
          <i className="bi bi-tooth text-xs" />
          {hallazgos.length} Hallazgos
        </div>
        <div className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700
                        rounded-full text-sm font-semibold">
          <i className="bi bi-capsule text-xs" />
          {prescripcion?.detalles?.length ?? 0} Medicamentos
        </div>
      </div>

      <div className="flex items-center justify-center gap-3">
        <Button
          variant="outline"
          onClick={() => window.print()}
          icon={<i className="bi bi-printer" />}
        >
          Imprimir Receta
        </Button>
        <Button
          onClick={onVolver}
          icon={<i className="bi bi-house" />}
        >
          Volver a Consultas
        </Button>
      </div>
    </div>
  </div>
);

export default StepCierre;
