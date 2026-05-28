import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'animate.css';
import '../estilos/DentalDashboard.css';
import '../estilos/ActiveConsultation.css';

// Hooks
import { useConsultaData } from '../hooks/useConsultaData';
import { useTratamientos }  from '../hooks/useTratamientos';
import { usePrescripcion }  from '../hooks/usePrescripcion';

// Componentes
import ConsultaBanner   from '../components/ConsultaBanner';
import StepEvaluacion   from '../components/StepEvaluacion';
import StepOdontograma  from '../components/StepOdontograma';
import StepPrescripcion from '../components/StepPrescripcion';
import StepCierre       from '../components/StepCierre';

/**
 * ActiveConsultation — Componente orquestador.
 *
 * Este archivo solo maneja:
 *   1. El paso actual (step)
 *   2. Instanciar los hooks de datos
 *   3. Renderizar el componente correcto según el paso
 *
 * Toda la lógica de negocio y fetching vive en los hooks.
 * Toda la UI específica de cada paso vive en los componentes.
 */
const ActiveConsultation = () => {
  const { citaId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // ── Hooks de datos ────────────────────────────────────────────────────────
  const consulta = useConsultaData(citaId);

  const tratamientosHook = useTratamientos(
    consulta.evaluacion,
    () => consulta.fetchHallazgos(consulta.evaluacion?.idEvaluacionClinica)
  );

  const prescripcionHook = usePrescripcion(
    citaId,
    () => consulta.handleFinalizarConsulta(() => setStep(4))
  );

  // ── Estados de carga ──────────────────────────────────────────────────────
  if (consulta.loading) {
    return (
      <div className="d-flex justify-content-center align-items-center h-100">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" />
          <p className="text-muted">Cargando datos de la consulta...</p>
        </div>
      </div>
    );
  }

  if (!consulta.cita) {
    return (
      <div className="d-flex justify-content-center align-items-center h-100">
        <div className="text-center">
          <i className="bi bi-exclamation-triangle text-warning" style={{ fontSize: '3rem' }} />
          <h5 className="mt-3">Cita no encontrada</h5>
          <button className="btn-register mt-3" onClick={() => navigate('/consulta')}>
            Volver a la lista
          </button>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="d-flex flex-column h-100 p-4" style={{ backgroundColor: 'var(--bg-app)' }}>

      <ConsultaBanner
        cita={consulta.cita}
        step={step}
        onStepClick={setStep}
        onVolver={() => navigate('/consulta')}
      />

      {step === 1 && (
        <StepEvaluacion
          cita={consulta.cita}
          evaluacion={consulta.evaluacion}
          diagnostico={consulta.diagnostico}
          setDiagnostico={consulta.setDiagnostico}
          observaciones={consulta.observaciones}
          setObservaciones={consulta.setObservaciones}
          savingEval={consulta.savingEval}
          onGuardar={() => consulta.handleGuardarEvaluacion(() => setStep(2))}
          onContinuar={() => setStep(2)}
        />
      )}

      {step === 2 && (
        <StepOdontograma
          cita={consulta.cita}
          // Hallazgos
          hallazgos={consulta.hallazgos}
          onCambiarEstado={consulta.handleCambiarEstado}
          onEliminarHallazgo={consulta.handleEliminarHallazgo}
          // Tratamientos
          tratamientos={tratamientosHook.tratamientos}
          selectedTeeth={tratamientosHook.selectedTeeth}
          selectedTratamiento={tratamientosHook.selectedTratamiento}
          setSelectedTratamiento={tratamientosHook.setSelectedTratamiento}
          customPrecio={tratamientosHook.customPrecio}
          setCustomPrecio={tratamientosHook.setCustomPrecio}
          savingHallazgo={tratamientosHook.savingHallazgo}
          mostrarFormNuevo={tratamientosHook.mostrarFormNuevo}
          setMostrarFormNuevo={tratamientosHook.setMostrarFormNuevo}
          nuevoTratamiento={tratamientosHook.nuevoTratamiento}
          setNuevoTratamiento={tratamientosHook.setNuevoTratamiento}
          onOdontogramChange={tratamientosHook.handleOdontogramChange}
          onRegistrarHallazgo={tratamientosHook.handleRegistrarHallazgo}
          onCrearNuevoTratamiento={tratamientosHook.handleCrearNuevoTratamiento}
          // Navegación
          onVolver={() => setStep(1)}
          onContinuar={() => setStep(3)}
        />
      )}

      {step === 3 && (
        <StepPrescripcion
          hallazgos={consulta.hallazgos}
          medicamentos={prescripcionHook.medicamentos}
          prescripcion={prescripcionHook.prescripcion}
          setPrescripcion={prescripcionHook.setPrescripcion}
          detalles={prescripcionHook.detalles}
          detalleActual={prescripcionHook.detalleActual}
          setDetalleActual={prescripcionHook.setDetalleActual}
          savingPrescripcion={prescripcionHook.savingPrescripcion}
          onAgregarDetalle={prescripcionHook.handleAgregarDetalle}
          onEliminarDetalle={prescripcionHook.handleEliminarDetalle}
          onGuardarPrescripcion={prescripcionHook.handleGuardarPrescripcion}
          onFinalizar={() => consulta.handleFinalizarConsulta(() => setStep(4))}
          onVolver={() => setStep(2)}
        />
      )}

      {step === 4 && (
        <StepCierre
          cita={consulta.cita}
          hallazgos={consulta.hallazgos}
          prescripcion={prescripcionHook.prescripcion}
          onVolver={() => navigate('/consulta')}
        />
      )}
    </div>
  );
};

export default ActiveConsultation;
