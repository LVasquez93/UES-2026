import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const API_URL = 'http://localhost:8080/api';

/**
 * Hook responsable del catálogo de tratamientos y del registro de hallazgos
 * en el odontograma. Gestiona la selección de piezas, tratamiento y precio.
 */
export const useTratamientos = (evaluacion, onHallazgoRegistrado) => {
  const [tratamientos, setTratamientos] = useState([]);
  const [selectedTeeth, setSelectedTeeth] = useState([]);
  const [selectedTratamiento, setSelectedTratamiento] = useState('');
  const [customPrecio, setCustomPrecio] = useState('');
  const [savingHallazgo, setSavingHallazgo] = useState(false);

  // Formulario para crear un nuevo tratamiento en el catálogo
  const [mostrarFormNuevo, setMostrarFormNuevo] = useState(false);
  const [nuevoTratamiento, setNuevoTratamiento] = useState({ nombreTratamiento: '', costoTratamiento: '' });

  // ── Carga inicial del catálogo ───────────────────────────────────────────
  useEffect(() => {
    fetchTratamientos();
  }, []);

  const fetchTratamientos = async () => {
    try {
      const res = await fetch(`${API_URL}/consulta/tratamientos`);
      if (!res.ok) return;
      setTratamientos(await res.json());
    } catch (_) { }
  };

  // ── Acciones ─────────────────────────────────────────────────────────────
  const handleOdontogramChange = (teeth) => {
    setSelectedTeeth(teeth);
  };

  const handleRegistrarHallazgo = async () => {
    if (!evaluacion?.idEvaluacionClinica) {
      Swal.fire({ icon: 'warning', title: 'Sin evaluación', text: 'Debes guardar el diagnóstico primero.', confirmButtonColor: '#6366f1' });
      return;
    }
    if (selectedTeeth.length === 0) {
      Swal.fire({ icon: 'warning', title: 'Sin pieza seleccionada', text: 'Selecciona al menos una pieza dental en el odontograma.', confirmButtonColor: '#6366f1' });
      return;
    }
    if (!selectedTratamiento) {
      Swal.fire({ icon: 'warning', title: 'Sin tratamiento', text: 'Selecciona el tratamiento a registrar.', confirmButtonColor: '#6366f1' });
      return;
    }
    if (!customPrecio || parseFloat(customPrecio) < 0) {
      Swal.fire({ icon: 'warning', title: 'Precio inválido', text: 'Indica un precio válido para el tratamiento.', confirmButtonColor: '#6366f1' });
      return;
    }

    setSavingHallazgo(true);
    try {
      for (const tooth of selectedTeeth) {
        const pieza = tooth.notations?.fdi || tooth.id;
        const res = await fetch(`${API_URL}/consulta/hallazgo`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            idEvaluacionClinica: evaluacion.idEvaluacionClinica,
            idTratamiento: parseInt(selectedTratamiento),
            piezaDental: parseInt(pieza),
            costoAplicado: parseFloat(customPrecio),
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || 'Error al registrar hallazgo.');
        }
      }
      Swal.fire({ icon: 'success', title: 'Hallazgo registrado', confirmButtonColor: '#6366f1', timer: 1500, showConfirmButton: false });
      onHallazgoRegistrado?.(); // Notifica al padre para recargar hallazgos
      setSelectedTeeth([]);
      setSelectedTratamiento('');
      setCustomPrecio('');
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#6366f1' });
    } finally {
      setSavingHallazgo(false);
    }
  };

  const handleCrearNuevoTratamiento = async () => {
    if (!nuevoTratamiento.nombreTratamiento.trim() || !nuevoTratamiento.costoTratamiento) {
      Swal.fire({ icon: 'warning', title: 'Campos vacíos', text: 'Por favor ingresa el nombre y precio base del tratamiento.', confirmButtonColor: '#6366f1' });
      return;
    }
    try {
      const res = await fetch(`${API_URL}/consulta/tratamientos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombreTratamiento: nuevoTratamiento.nombreTratamiento,
          costoTratamiento: parseFloat(nuevoTratamiento.costoTratamiento),
          descripcionTratamiento: 'Tratamiento registrado desde el módulo de consulta activa',
        }),
      });
      if (!res.ok) throw new Error('No se pudo registrar el nuevo tratamiento.');
      const nuevoItem = await res.json();

      await fetchTratamientos();
      setSelectedTratamiento(String(nuevoItem.idTratamiento));
      setCustomPrecio(String(nuevoItem.costoTratamiento));
      setNuevoTratamiento({ nombreTratamiento: '', costoTratamiento: '' });
      setMostrarFormNuevo(false);
      Swal.fire({ icon: 'success', title: 'Añadido', text: 'Tratamiento agregado al catálogo y seleccionado.', timer: 1500, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#6366f1' });
    }
  };

  return {
    // Estado
    tratamientos,
    selectedTeeth,
    selectedTratamiento, setSelectedTratamiento,
    customPrecio, setCustomPrecio,
    savingHallazgo,
    mostrarFormNuevo, setMostrarFormNuevo,
    nuevoTratamiento, setNuevoTratamiento,
    // Acciones
    handleOdontogramChange,
    handleRegistrarHallazgo,
    handleCrearNuevoTratamiento,
  };
};
