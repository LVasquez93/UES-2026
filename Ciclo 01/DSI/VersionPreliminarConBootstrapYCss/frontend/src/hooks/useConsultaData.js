import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const API_URL = 'http://localhost:8080/api';

/**
 * Hook responsable de cargar y gestionar los datos principales de la consulta:
 * la cita, la evaluación clínica, y los hallazgos del odontograma.
 */
export const useConsultaData = (citaId) => {
  const [cita, setCita] = useState(null);
  const [loading, setLoading] = useState(true);

  const [evaluacion, setEvaluacion] = useState(null);
  const [diagnostico, setDiagnostico] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [savingEval, setSavingEval] = useState(false);

  const [hallazgos, setHallazgos] = useState([]);

  // ── Carga inicial ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!citaId) return;
    fetchCita();
  }, [citaId]);

  // Cuando existe evaluación, cargamos sus hallazgos
  useEffect(() => {
    if (evaluacion?.idEvaluacionClinica) {
      fetchHallazgos(evaluacion.idEvaluacionClinica);
    }
  }, [evaluacion]);

  // ── Fetchers ─────────────────────────────────────────────────────────────
  const fetchCita = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/citas`);
      if (!res.ok) throw new Error('Error al cargar citas.');
      const todas = await res.json();
      const encontrada = todas.find(c => c.idCitas === parseInt(citaId));
      if (!encontrada) throw new Error('Cita no encontrada.');
      setCita(encontrada);
      await fetchEvaluacion();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#6366f1' });
    } finally {
      setLoading(false);
    }
  };

  const fetchEvaluacion = async () => {
    try {
      const res = await fetch(`${API_URL}/consulta/evaluacion/cita/${citaId}`);
      if (res.status === 204 || !res.ok) return;
      const data = await res.json();
      setEvaluacion(data);
      setDiagnostico(data.diagnostico || '');
      setObservaciones(data.observaciones || '');
    } catch (_) { /* silencioso: normal que no exista aún */ }
  };

  const fetchHallazgos = async (idEvaluacion) => {
    try {
      const res = await fetch(`${API_URL}/consulta/hallazgos/${idEvaluacion}`);
      if (!res.ok) return;
      setHallazgos(await res.json());
    } catch (_) { }
  };

  // ── Acciones ─────────────────────────────────────────────────────────────
  const handleGuardarEvaluacion = async (onSuccess) => {
    if (!diagnostico.trim()) {
      Swal.fire({ icon: 'warning', title: 'Campo requerido', text: 'El diagnóstico es obligatorio.', confirmButtonColor: '#6366f1' });
      return;
    }
    setSavingEval(true);
    try {
      const res = await fetch(`${API_URL}/consulta/evaluacion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idCita: parseInt(citaId), diagnostico, observaciones }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al guardar la evaluación.');
      setEvaluacion(data);
      Swal.fire({ icon: 'success', title: 'Evaluación guardada', text: 'Puedes continuar al odontograma.', confirmButtonColor: '#6366f1', timer: 1800, showConfirmButton: false });
      onSuccess?.();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#6366f1' });
    } finally {
      setSavingEval(false);
    }
  };

  const handleCambiarEstado = async (idPlan, nuevoEstado) => {
    try {
      const res = await fetch(`${API_URL}/consulta/hallazgo/${idPlan}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al actualizar el estado.');
      }
      setHallazgos(prev => prev.map(h =>
        h.idPlanTratamiento === idPlan ? { ...h, estadoPlan: nuevoEstado } : h
      ));
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Estado actualizado', showConfirmButton: false, timer: 1500 });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#6366f1' });
      fetchHallazgos(evaluacion.idEvaluacionClinica);
    }
  };

  const handleEliminarHallazgo = async (idPlan) => {
    const { isConfirmed } = await Swal.fire({
      icon: 'warning', title: 'Eliminar hallazgo',
      text: 'Esta acción no se puede deshacer.',
      showCancelButton: true,
      confirmButtonText: 'Eliminar', cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444', cancelButtonColor: '#6c757d',
    });
    if (!isConfirmed) return;
    try {
      const res = await fetch(`${API_URL}/consulta/hallazgo/${idPlan}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar hallazgo.');
      setHallazgos(prev => prev.filter(h => h.idPlanTratamiento !== idPlan));
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#6366f1' });
    }
  };

  const handleFinalizarConsulta = async (onSuccess) => {
    try {
      const res = await fetch(`${API_URL}/citas/${citaId}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'FINALIZADA' }),
      });
      if (res.ok) {
        setCita(prev => ({ ...prev, estadoCita: 'FINALIZADA' }));
      } else {
        console.error('Error al cambiar estado de la cita en BD.');
      }
    } catch (err) {
      console.error('Error de red al finalizar cita:', err);
    } finally {
      onSuccess?.(); // Avanza al paso 4 sin importar si falló la red
    }
  };

  return {
    // Estado
    cita, setCita, loading,
    evaluacion,
    diagnostico, setDiagnostico,
    observaciones, setObservaciones,
    savingEval,
    hallazgos, setHallazgos,
    // Acciones
    fetchHallazgos,
    handleGuardarEvaluacion,
    handleCambiarEstado,
    handleEliminarHallazgo,
    handleFinalizarConsulta,
  };
};
