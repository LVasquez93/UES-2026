import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const API_URL = 'http://localhost:8080/api';

/**
 * Hook responsable de la prescripción médica:
 * catálogo de medicamentos, lista de detalles de la receta y guardado final.
 */
export const usePrescripcion = (citaId, onGuardado) => {
  const [medicamentos, setMedicamentos] = useState([]);
  const [prescripcion, setPrescripcion] = useState(null);
  const [detalles, setDetalles] = useState([]);
  const [savingPrescripcion, setSavingPrescripcion] = useState(false);

  // Medicamento que se está configurando antes de agregarlo a la lista
  const [detalleActual, setDetalleActual] = useState({
    idMedicamento: '',
    dosis: '',
    frecuencia: '',
    duracion: '',
    indicaciones: '',
    idPlanTratamiento: '',
  });

  // ── Carga inicial ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!citaId) return;
    fetchMedicamentos();
    fetchPrescripcion();
  }, [citaId]);

  const fetchMedicamentos = async () => {
    try {
      const res = await fetch(`${API_URL}/consulta/medicamentos`);
      if (!res.ok) return;
      setMedicamentos(await res.json());
    } catch (_) { }
  };

  const fetchPrescripcion = async () => {
    try {
      const res = await fetch(`${API_URL}/consulta/prescripcion/cita/${citaId}`);
      if (res.status === 204 || !res.ok) return;
      setPrescripcion(await res.json());
    } catch (_) { }
  };

  // ── Acciones ─────────────────────────────────────────────────────────────

  /**
   * Agrega un medicamento al arreglo local `detalles` antes de guardar todo junto.
   * @param {Array} hallazgos - Lista de hallazgos para resolver el nombre visual del plan.
   */
  const handleAgregarDetalle = (hallazgos = []) => {
    const { idMedicamento, dosis, frecuencia, duracion } = detalleActual;
    if (!idMedicamento || !dosis || !frecuencia || !duracion) {
      Swal.fire({ icon: 'warning', title: 'Campos incompletos', text: 'Completa medicamento, dosis, frecuencia y duración.', confirmButtonColor: '#6366f1' });
      return;
    }
    const med = medicamentos.find(m => m.idMedicamento === parseInt(idMedicamento));
    const hallazgoVinculado = hallazgos.find(h => h.idPlanTratamiento === parseInt(detalleActual.idPlanTratamiento));
    const justificacion = hallazgoVinculado
      ? `Pieza ${hallazgoVinculado.piezaDental} - ${hallazgoVinculado.nombreTratamiento}`
      : 'Prescripción General';

    setDetalles(prev => [...prev, {
      ...detalleActual,
      nombreMedicamento: med?.nombreMedicamento,
      justificacionVisual: justificacion,
    }]);

    // Limpiamos el formulario para el siguiente medicamento
    setDetalleActual({ idMedicamento: '', dosis: '', frecuencia: '', duracion: '', indicaciones: '', idPlanTratamiento: '' });
  };

  const handleEliminarDetalle = (index) => {
    setDetalles(prev => prev.filter((_, i) => i !== index));
  };

  const handleGuardarPrescripcion = async () => {
    if (detalles.length === 0) {
      Swal.fire({ icon: 'warning', title: 'Sin medicamentos', text: 'Agrega al menos un medicamento.', confirmButtonColor: '#6366f1' });
      return;
    }
    setSavingPrescripcion(true);
    try {
      const payload = {
        idCita: parseInt(citaId),
        detalles: detalles.map(d => ({
          idMedicamento: parseInt(d.idMedicamento),
          idPlanTratamiento: d.idPlanTratamiento ? parseInt(d.idPlanTratamiento) : null,
          dosis: d.dosis,
          frecuencia: d.frecuencia,
          duracion: parseInt(d.duracion),
          indicaciones: d.indicaciones || '',
        })),
      };
      const res = await fetch(`${API_URL}/consulta/prescripcion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al guardar la prescripción.');
      setPrescripcion(data);

      // Actualizamos el estado de la cita a FINALIZADA
      const resEstado = await fetch(`${API_URL}/citas/${citaId}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'FINALIZADA' }),
      });
      if (!resEstado.ok) {
        console.error('La prescripción se guardó, pero hubo un error al cambiar el estado de la cita.');
      }

      Swal.fire({ icon: 'success', title: 'Prescripción guardada y Cita Finalizada', confirmButtonColor: '#6366f1', timer: 1800, showConfirmButton: false });
      onGuardado?.();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#6366f1' });
    } finally {
      setSavingPrescripcion(false);
    }
  };

  return {
    // Estado
    medicamentos,
    prescripcion, setPrescripcion,
    detalles,
    detalleActual, setDetalleActual,
    savingPrescripcion,
    // Acciones
    handleAgregarDetalle,
    handleEliminarDetalle,
    handleGuardarPrescripcion,
  };
};
