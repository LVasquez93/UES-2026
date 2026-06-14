import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Odontogram } from 'react-odontogram';
import 'react-odontogram/style.css';
import Swal from 'sweetalert2';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'animate.css';
import '../estilos/DentalDashboard.css';
import '../estilos/ActiveConsultation.css';

const API_URL = 'http://localhost:8080/api';

/** Este es el componente activo de consulta, que se muestra al odontologo cuando hace click en
 *  "Iniciar Consulta" desde el Dashboard. Es el espacio de trabajo principal durante la consulta,
 *  donde se muestra un banner con el estado de la consulta (en curso, finalizada, etc) y un indicador
 *  de pasos (revisión, tratamiento, diagnóstico). El odontologo puede ir avanzando por cada paso y
 *  registrar los hallazgos en un textarea o directamente en el odontograma. Al finalizar la consulta
 *  se muestra una pantalla de resumen con la opción de imprimir una receta o volver al dashboard. */

const ActiveConsultation = () => {
  // Obtenemos el ID de la cita desde la URL (/consulta/:citaId)
  const { citaId } = useParams();
  const navigate = useNavigate();

  // Control del paso actual del flujo de consulta
  const [step, setStep] = useState(1);

  // Datos de la cita y el paciente cargados desde el backend
  const [cita, setCita] = useState(null);
  const [loading, setLoading] = useState(true);

  // ---- PASO 1: Evaluacion clinica ----
  const [evaluacion, setEvaluacion] = useState(null);
  const [diagnostico, setDiagnostico] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [savingEval, setSavingEval] = useState(false);

  // ---- PASO 2: Odontograma y hallazgos ----
  const [tratamientos, setTratamientos] = useState([]);
  const [hallazgos, setHallazgos] = useState([]);
  const [selectedTeeth, setSelectedTeeth] = useState([]);
  const [selectedTratamiento, setSelectedTratamiento] = useState('');
  const [savingHallazgo, setSavingHallazgo] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Hallazgos');

  // ESTADOS PARA PRECIO EDITABLE Y NUEVO TRATAMIENTO ---
  const [customPrecio, setCustomPrecio] = useState(''); // Guarda el precio modificado para la cita
  const [mostrarFormNuevo, setMostrarFormNuevo] = useState(false); // Alterna el formulario de creación
  const [nuevoTratamiento, setNuevoTratamiento] = useState({ nombreTratamiento: '', costoTratamiento: '' });

  // ---- PASO 3: Prescripcion ----
  const [medicamentos, setMedicamentos] = useState([]);
  const [prescripcion, setPrescripcion] = useState(null);
  const [detalles, setDetalles] = useState([]);
  // Medicamento que se esta configurando antes de agregar a la lista
  const [detalleActual, setDetalleActual] = useState({
    idMedicamento: '',
    dosis: '',
    frecuencia: '',
    duracion: '',
    indicaciones: '',
    idPlanTratamiento: ''
  });
  const [savingPrescripcion, setSavingPrescripcion] = useState(false);

  // =========================================================================
  // CARGA INICIAL: obtiene todos los datos necesarios al montar el componente
  // =========================================================================
  useEffect(() => {
    if (!citaId) return;
    Promise.all([
      fetchCita(),
      fetchTratamientos(),
      fetchMedicamentos(),
    ]);
  }, [citaId]);

  // Cuando tengamos la evaluacion cargada, obtenemos sus hallazgos
  useEffect(() => {
    if (evaluacion?.idEvaluacionClinica) {
      fetchHallazgos(evaluacion.idEvaluacionClinica);
    }
  }, [evaluacion]);

  // Obtiene los datos de la cita: GET /api/citas (filtramos por id)
  // Usamos el listado general porque no hay endpoint GET /api/citas/:id
  const fetchCita = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/citas`);
      if (!res.ok) throw new Error('Error al cargar citas.');
      const todas = await res.json();
      const encontrada = todas.find(c => c.idCitas === parseInt(citaId));
      if (!encontrada) throw new Error('Cita no encontrada.');
      setCita(encontrada);

      // Intentamos cargar la evaluacion existente para esta cita
      await fetchEvaluacion();
      // Intentamos cargar la prescripcion existente
      await fetchPrescripcion();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#6366f1' });
    } finally {
      setLoading(false);
    }
  };

  // Carga la evaluacion clinica si ya existe para esta cita
  const fetchEvaluacion = async () => {
    try {
      const res = await fetch(`${API_URL}/consulta/evaluacion/cita/${citaId}`);
      if (res.status === 204) return; // Sin contenido: no hay evaluacion aun
      if (!res.ok) return;
      const data = await res.json();
      setEvaluacion(data);
      setDiagnostico(data.diagnostico || '');
      setObservaciones(data.observaciones || '');
    } catch (_) { /* silencioso: es normal que no exista aun */ }
  };

  // Carga los hallazgos registrados de una evaluacion
  const fetchHallazgos = async (idEvaluacion) => {
    try {
      const res = await fetch(`${API_URL}/consulta/hallazgos/${idEvaluacion}`);
      if (!res.ok) return;
      setHallazgos(await res.json());
    } catch (_) { }
  };

  // Carga el catalogo de tratamientos para el selector del odontograma
  const fetchTratamientos = async () => {
    try {
      const res = await fetch(`${API_URL}/consulta/tratamientos`);
      if (!res.ok) return;
      setTratamientos(await res.json());
    } catch (_) { }
  };

  // Carga el catalogo de medicamentos para el selector de prescripcion
  const fetchMedicamentos = async () => {
    try {
      const res = await fetch(`${API_URL}/consulta/medicamentos`);
      if (!res.ok) return;
      setMedicamentos(await res.json());
    } catch (_) { }
  };

  // Carga la prescripcion si ya fue generada para esta cita
  const fetchPrescripcion = async () => {
    try {
      const res = await fetch(`${API_URL}/consulta/prescripcion/cita/${citaId}`);
      if (res.status === 204) return;
      if (!res.ok) return;
      setPrescripcion(await res.json());
    } catch (_) { }
  };

  // =========================================================================
  // PASO 1: Guardar evaluacion clinica
  // =========================================================================
  const handleGuardarEvaluacion = async () => {
    if (!diagnostico.trim()) {
      Swal.fire({ icon: 'warning', title: 'Campo requerido', text: 'El diagnostico es obligatorio.', confirmButtonColor: '#6366f1' });
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
      if (!res.ok) throw new Error(data.message || 'Error al guardar la evaluacion.');
      setEvaluacion(data);
      Swal.fire({ icon: 'success', title: 'Evaluacion guardada', text: 'Puedes continuar al odontograma.', confirmButtonColor: '#6366f1', timer: 1800, showConfirmButton: false });
      setStep(2);
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#6366f1' });
    } finally {
      setSavingEval(false);
    }
  };

  // =========================================================================
  // PASO 2: Registrar hallazgo en el odontograma
  // =========================================================================

  // Sincroniza las piezas seleccionadas en el odontograma con el estado local
  const handleOdontogramChange = (teeth) => {
    setSelectedTeeth(teeth);
  };

  const handleRegistrarHallazgo = async () => {
    if (!evaluacion?.idEvaluacionClinica) {
      Swal.fire({ icon: 'warning', title: 'Sin evaluacion', text: 'Debes guardar el diagnostico primero.', confirmButtonColor: '#6366f1' });
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
      // Registramos un hallazgo por cada pieza dental seleccionada en el odontograma
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
      // Recargamos la lista de hallazgos del panel lateral
      await fetchHallazgos(evaluacion.idEvaluacionClinica);
      setSelectedTeeth([]);
      setSelectedTratamiento('');
      setCustomPrecio('');
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#6366f1' });
    } finally {
      setSavingHallazgo(false);
    }
  };

  // Elimina un hallazgo del panel lateral con confirmacion
  const handleEliminarHallazgo = async (idPlan) => {
    const { isConfirmed } = await Swal.fire({
      icon: 'warning', title: 'Eliminar hallazgo',
      text: 'Esta accion no se puede deshacer.',
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
          descripcionTratamiento: "Tratamiento registrado desde el módulo de consulta activa"
        })
      });

      if (!res.ok) throw new Error('No se pudo registrar el nuevo tratamiento.');
      const nuevoItem = await res.json();

      // Refrescar el catálogo de tratamientos desde el backend
      await fetchTratamientos();

      // Seleccionar automáticamente el tratamiento recién creado y asignar su precio de referencia
      setSelectedTratamiento(String(nuevoItem.idTratamiento));
      setCustomPrecio(String(nuevoItem.costoTratamiento));

      // Limpiar estados de creación
      setNuevoTratamiento({ nombreTratamiento: '', costoTratamiento: '' });
      setMostrarFormNuevo(false);

      Swal.fire({ icon: 'success', title: 'Añadido', text: 'Tratamiento agregado al catálogo y seleccionado.', timer: 1500, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#6366f1' });
    }
  };

  // =========================================================================
  // PASO 3: Prescripcion de medicamentos
  // =========================================================================

  // Agrega un medicamento a la lista local antes de guardar todo junto
  const handleAgregarDetalle = () => {
    if (!detalleActual.idMedicamento || !detalleActual.dosis || !detalleActual.frecuencia || !detalleActual.duracion) {
      Swal.fire({ icon: 'warning', title: 'Campos incompletos', text: 'Completa medicamento, dosis, frecuencia y duracion.', confirmButtonColor: '#6366f1' });
      return;
    }
    // Buscamos los nombres para mostrarlos en la UI
    const med = medicamentos.find(m => m.idMedicamento === parseInt(detalleActual.idMedicamento));
    const hallazgoVinculado = hallazgos.find(h => h.idPlanTratamiento === parseInt(detalleActual.idPlanTratamiento));

    // Nombre a mostrar (Si no elige hallazgo, lo marcamos como "Uso General")
    const justificacion = hallazgoVinculado
      ? `Pieza ${hallazgoVinculado.piezaDental} - ${hallazgoVinculado.nombreTratamiento}`
      : 'Prescripción General';

    setDetalles(prev => [...prev, {
      ...detalleActual,
      nombreMedicamento: med?.nombreMedicamento,
      justificacionVisual: justificacion
    }]);

    // Limpiamos el formulario para el siguiente medicamento
    setDetalleActual({ idMedicamento: '', dosis: '', frecuencia: '', duracion: '', indicaciones: '', idPlanTratamiento: '' });
  };

  // Cambia el estado de un hallazgo específico
  const handleCambiarEstado = async (idPlan, nuevoEstado) => {
    try {
      const res = await fetch(`${API_URL}/consulta/hallazgo/${idPlan}/estado`, {
        method: 'PATCH', // Usamos PATCH porque solo actualizamos un campo (el estado)
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al actualizar el estado en el servidor.');
      }

      // Si el backend responde OK, actualizamos el estado local de React 
      // para que el select cambie visualmente al instante.
      setHallazgos(prevHallazgos => prevHallazgos.map(h =>
        h.idPlanTratamiento === idPlan ? { ...h, estadoPlan: nuevoEstado } : h
      ));

      // Opcional: Una pequeña alerta de éxito (puedes quitarla si te parece muy invasiva)
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Estado actualizado',
        showConfirmButton: false,
        timer: 1500
      });

    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#6366f1' });
      // Si falla, recargamos la lista desde el servidor para devolver el select a su estado real
      fetchHallazgos(evaluacion.idEvaluacionClinica);
    }
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
          idPlanTratamiento: d.idPlanTratamiento || null,
        })),
      };
      const res = await fetch(`${API_URL}/consulta/prescripcion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al guardar la prescripcion.');
      setPrescripcion(data);
      // --- NUEVO: 2. Actualizar el estado de la cita a FINALIZADA ---
      const resEstado = await fetch(`${API_URL}/citas/${citaId}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'FINALIZADA' })
        // O el nombre exacto del estado que uses en tu base de datos (ej. "COMPLETADA", "ATENDIDA")
      });
      if (!resEstado.ok) {
        // No lanzamos error fatal para no arruinar la experiencia, pero avisamos por consola
        console.error("La prescripción se guardó, pero hubo un error al cambiar el estado de la cita.");
      }
      Swal.fire({ icon: 'success', title: 'Prescripcion guardada y Cita Finalizada', confirmButtonColor: '#6366f1', timer: 1800, showConfirmButton: false });
      handleFinalizarConsulta();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#6366f1' });
    } finally {
      setSavingPrescripcion(false);
    }
  };

  // =========================================================================
  // PASO 4: Finalizar la Cita Oficialmente
  // =========================================================================
  const handleFinalizarConsulta = async () => {
    try {
      // 1. Avisamos al backend que la cita finalizó
      const resEstado = await fetch(`${API_URL}/citas/${citaId}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'FINALIZADA' })
      });

      if (!resEstado.ok) {
        console.error("Hubo un error al cambiar el estado de la cita en la BD.");
      } else {
        // 2. Actualizamos el estado local para que el chip del paciente se ponga verde
        setCita(prev => ({ ...prev, estadoCita: 'FINALIZADA' }));
      }

      // 3. Pasamos a la pantalla de Cierre
      setStep(4);
    } catch (err) {
      console.error("Error de red al finalizar cita:", err);
      setStep(4); // Si falla el internet, de todos modos lo mandamos al cierre para no bloquearlo
    }
  };

  // =========================================================================
  // RENDER DE CARGA
  // =========================================================================
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center h-100">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status"></div>
          <p className="text-muted">Cargando datos de la consulta...</p>
        </div>
      </div>
    );
  }

  if (!cita) {
    return (
      <div className="d-flex justify-content-center align-items-center h-100">
        <div className="text-center">
          <i className="bi bi-exclamation-triangle text-warning" style={{ fontSize: '3rem' }}></i>
          <h5 className="mt-3">Cita no encontrada</h5>
          <button className="btn-register mt-3" onClick={() => navigate('/consulta')}>
            Volver a la lista
          </button>
        </div>
      </div>
    );
  }

  // Texto de las piezas seleccionadas en notacion FDI
  const piecesText = selectedTeeth.map(t => t.notations?.fdi || t.id).join(', ');

  return (
    <div className="d-flex flex-column h-100 p-4" style={{ backgroundColor: 'var(--bg-app)' }}>

      {/* ================================================================== */}
      {/* BANNER SUPERIOR: datos de la cita y navegacion entre pasos         */}
      {/* ================================================================== */}
      <div className="consultation-banner animate__animated animate__fadeInDown">

        {/* Chip del paciente */}
        <div className="d-flex align-items-center gap-3">
          <div className="consultation-status-dot" style={{ backgroundColor: step >= 4 ? '#22c55e' : '#f59e0b' }}></div>
          <div>
            <span className="text-muted small d-block">Consulta en curso</span>
            <h6 className="fw-bold m-0">{cita.nombreCompletoPaciente}</h6>
          </div>
          <div className="vr mx-2"></div>
          <div>
            <span className="text-muted small d-block">DUI</span>
            <span className="fw-semibold small">{cita.numeroIdentidadPaciente}</span>
          </div>
          <div className="vr mx-2"></div>
          <div>
            <span className="text-muted small d-block">Especialidad</span>
            <span className="fw-semibold small">{cita.especialidadOdontologo}</span>
          </div>
        </div>

        {/* Indicador de pasos */}
        <div className="steps-indicator">
          {[
            { num: 1, label: 'Evaluacion' },
            { num: 2, label: 'Odontograma' },
            { num: 3, label: 'Prescripcion' },
            { num: 4, label: 'Cierre' },
          ].map(s => (
            <div
              key={s.num}
              // Permitimos navegar a pasos anteriores para corregir datos
              className={`step-pill ${step === s.num ? 'active' : step > s.num ? 'done' : ''}`}
              onClick={() => step > s.num && setStep(s.num)}
              style={{ cursor: step > s.num ? 'pointer' : 'default' }}
            >
              {step > s.num
                ? <i className="bi bi-check-circle-fill me-1"></i>
                : <span className="step-number">{s.num}</span>
              }
              {s.label}
            </div>
          ))}
        </div>

        {/* Boton para volver a la lista de citas */}
        <button className="btn btn-sm btn-outline-secondary" onClick={() => navigate('/consulta')}>
          <i className="bi bi-arrow-left me-1"></i>Volver
        </button>
      </div>

      {/* ================================================================== */}
      {/* PASO 1: EVALUACION CLINICA                                         */}
      {/* ================================================================== */}
      {step === 1 && (
        <div className="workspace-card mt-3 animate__animated animate__fadeIn" style={{ display: 'block', height: 'auto' }}>
          <div className="row g-4 p-4">

            {/* Alergias y alertas del paciente */}
            <div className="col-12">
              <h5 className="fw-bold mb-3">Revision inicial del paciente</h5>
            </div>
            <div className="col-md-6">
              <div className="p-3 border rounded-3" style={{ backgroundColor: '#fff5f5', borderColor: '#fca5a5' }}>
                <h6 className="fw-bold" style={{ color: '#dc2626' }}>
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>Alergias y alertas
                </h6>
                {/* Mostrariamos alergias reales del paciente si el backend las retorna en el DTO de cita */}
                <p className="mb-0 small">Verificar alergias en el expediente del paciente antes de proceder.</p>
              </div>
            </div>

            {/* Formulario de diagnostico */}
            <div className="col-md-6">
              <div className="p-3 border rounded-3">
                <h6 className="fw-bold text-primary">Estado de la cita</h6>
                <span className={`badge ${cita.estadoCita === 'PROGRAMADA' ? 'bg-warning text-dark' : 'bg-success'}`}>
                  {cita.estadoCita}
                </span>
              </div>
            </div>

            <div className="col-12">
              <label className="form-label-custom">Diagnostico inicial *</label>
              <textarea
                className="form-control-custom"
                rows="3"
                placeholder="Describe el motivo de consulta y hallazgos iniciales..."
                value={diagnostico}
                onChange={e => setDiagnostico(e.target.value)}
              ></textarea>
            </div>

            <div className="col-12">
              <label className="form-label-custom">Observaciones adicionales</label>
              <textarea
                className="form-control-custom"
                rows="2"
                placeholder="Observaciones, antecedentes relevantes..."
                value={observaciones}
                onChange={e => setObservaciones(e.target.value)}
              ></textarea>
            </div>

            <div className="col-12 d-flex justify-content-end gap-2">
              {/* Si ya hay evaluacion guardada, permitimos saltar al paso 2 directamente */}
              {evaluacion && (
                <button className="btn-cancel" onClick={() => setStep(2)}>
                  Continuar sin cambios
                </button>
              )}
              <button className="btn-register px-5" onClick={handleGuardarEvaluacion} disabled={savingEval}>
                {savingEval ? 'Guardando...' : 'Guardar y continuar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* PASO 2: ODONTOGRAMA Y HALLAZGOS                                    */}
      {/* ================================================================== */}
      {step === 2 && (
        <div className="workspace-card mt-3 animate__animated animate__fadeIn">

          {/* COLUMNA IZQUIERDA: ODONTOGRAMA Y TABLA */}
          <div className="odontogram-section">
            <div className="filters-bar">
              <i className="bi bi-funnel text-muted"></i>
              <span className="small text-muted">Filtros:</span>
              {['Hallazgos', 'Presupuestado', 'Programado', 'Realizado'].map(f => (
                <button
                  key={f}
                  className={`filter-pill ${activeFilter === f ? 'active' : ''}`}
                  onClick={() => setActiveFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="odontogram-container" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
              {/* RENDERIZADO CONDICIONAL: Si es Programado o Realizado, mostramos tabla de historial */}
              {(activeFilter === 'Programado' || activeFilter === 'Realizado') ? (
                <div className="w-100 p-3 border rounded-3 bg-white" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  <h6 className="fw-bold text-primary mb-3">
                    <i className="bi bi-clock-history me-2"></i>
                    {activeFilter === 'Realizado' ? 'Historial de Tratamientos' : 'Tratamientos Programados'}
                  </h6>

                  <div className="alert alert-light border small text-muted">
                    <i className="bi bi-info-circle me-2"></i>
                    Aquí se visualizará el historial global de {cita.nombreCompletoPaciente}.
                  </div>
                  {/* Tabla temporal que luego llenaremos con el nuevo Endpoint de Spring Boot */}
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
                          <i className="bi bi-folder2-open d-block mb-2" style={{ fontSize: '1.5rem' }}></i>
                          Conectando historial...
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <>
                  <Odontogram
                    onChange={handleOdontogramChange}
                    theme="light"
                    notation="FDI"
                    className="custom-odontogram"
                  />
                  <p className="text-center text-muted small mt-2">
                    Selecciona piezas en el grafico y registra el tratamiento en el panel derecho
                  </p>
                </>
              )}
            </div>
            {/* <-- FIN DEL CONTENEDOR DEL GRAFICO/TABLA --> */}

            {/* LISTA DE HALLAZGOS (Debe ir abajo del grafico, pero en la columna izquierda) */}
            {hallazgos.length > 0 && (
              <div className="mt-3 px-2">
                <h6 className="fw-bold text-muted small mb-2">Hallazgos registrados</h6>
                <div className="hallazgos-list">
                  {hallazgos.map(h => (
                    <div key={h.idPlanTratamiento} className="hallazgo-item">
                      <span className="hallazgo-pieza">Pieza {h.piezaDental}</span>
                      <span className="hallazgo-nombre">{h.nombreTratamiento}</span>

                      {/* SELECTOR DE ESTADO BASADO EN TU ENUM */}
                      <select
                        className={`form-select form-select-sm hallazgo-estado ${h.estadoPlan.toLowerCase()}`}
                        value={h.estadoPlan}
                        onChange={(e) => handleCambiarEstado(h.idPlanTratamiento, e.target.value)}
                        style={{ width: 'auto', display: 'inline-block', padding: '0.25rem 2rem 0.25rem 0.5rem' }}
                        disabled={h.estadoPlan === 'COMPLETADO' || h.estadoPlan === 'CANCELADO'}
                      >
                        <option value="PENDIENTE">Pendiente</option>
                        <option value="PROGRAMADO">Programado</option>
                        <option value="EN_PROGRESO">En Progreso</option>
                        <option value="COMPLETADO">Completado</option>
                        <option value="CANCELADO">Cancelado</option>
                        <option value="OTRO">Otro</option>
                      </select>

                      {/* Botón de eliminar */}
                      {h.estadoPlan !== 'COMPLETADO' && (
                        <button
                          className="hallazgo-delete ms-auto"
                          onClick={() => handleEliminarHallazgo(h.idPlanTratamiento)}
                          title="Eliminar hallazgo"
                        >
                          <i className="bi bi-x"></i>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* <-- FIN DE LA COLUMNA IZQUIERDA --> */}


          {/* ================================================================== */}
          {/* COLUMNA DERECHA: PANEL DE REGISTRO DE HALLAZGO                     */}
          {/* ================================================================== */}
          <aside className="control-panel">
            <div className="row g-3 mb-3">
              {/* Campo de piezas seleccionadas */}
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

              {/* Selector de tratamiento dinámico */}
              <div className="col-12">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label-custom m-0">Tratamiento</label>
                  <button
                    type="button"
                    className="btn btn-sm btn-link p-0 text-primary fw-bold text-decoration-none"
                    onClick={() => setMostrarFormNuevo(!mostrarFormNuevo)}
                  >
                    {mostrarFormNuevo ? '✕ Cancelar' : '➕ Crear Nuevo'}
                  </button>
                </div>

                {/* Formulario rápido para agregar tratamiento si no existe en la lista */}
                {mostrarFormNuevo ? (
                  <div className="p-3 border rounded-3 bg-light mb-2 animate__animated animate__fadeIn">
                    <span className="text-muted small fw-bold d-block mb-2">Nuevo tratamiento en catálogo:</span>
                    <input
                      type="text"
                      className="form-control-custom mb-2 bg-white"
                      placeholder="Nombre (ej: Endodoncia Molar)"
                      value={nuevoTratamiento.nombreTratamiento}
                      onChange={e => setNuevoTratamiento({ ...nuevoTratamiento, nombreTratamiento: e.target.value })}
                    />
                    <input
                      type="number"
                      className="form-control-custom mb-2 bg-white"
                      placeholder="Precio base ($)"
                      value={nuevoTratamiento.costoTratamiento}
                      onChange={e => setNuevoTratamiento({ ...nuevoTratamiento, costoTratamiento: e.target.value })}
                    />
                    <button
                      type="button"
                      className="btn btn-sm btn-primary w-100 fw-bold"
                      onClick={handleCrearNuevoTratamiento}
                    >
                      Guardar en Base de Datos
                    </button>
                  </div>
                ) : (
                  <div className="treatment-dropdown">
                    <div className="dropdown-header">
                      {selectedTratamiento
                        ? tratamientos.find(t => t.idTratamiento === parseInt(selectedTratamiento))?.nombreTratamiento
                        : 'Seleccione un tratamiento'}
                      <i className="bi bi-chevron-down"></i>
                    </div>
                    <div className="dropdown-content" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                      {tratamientos.map(t => (
                        <div
                          key={t.idTratamiento}
                          className={`item ${selectedTratamiento === String(t.idTratamiento) ? 'active' : ''}`}
                          onClick={() => {
                            setSelectedTratamiento(String(t.idTratamiento));
                            setCustomPrecio(String(t.costoTratamiento)); // Coloca el precio base de referencia para poder editarlo
                          }}
                        >
                          {t.nombreTratamiento}
                          <span className="text-muted small d-block">${t.costoTratamiento}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* NUEVO CAMPO: PRECIO MODIFICABLE PARA EL CLIENTE */}
              <div className="col-12">
                <label className="form-label-custom">Precio a cobrar ($)</label>
                <input
                  type="number"
                  className="form-control-custom"
                  placeholder="0.00"
                  value={customPrecio}
                  onChange={e => setCustomPrecio(e.target.value)}
                  disabled={mostrarFormNuevo || !selectedTratamiento}
                />
                <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                  * Puedes modificar el precio de referencia según la condición del paciente.
                </small>
              </div>
            </div>

            <button
              className="btn-register mb-3"
              onClick={handleRegistrarHallazgo}
              disabled={savingHallazgo || selectedTeeth.length === 0 || !selectedTratamiento || mostrarFormNuevo}
            >
              {savingHallazgo ? 'Registrando...' : 'Registrar Hallazgo'}
            </button>

            <div className="mt-auto d-flex flex-column gap-2">
              <button className="btn-cancel" onClick={() => setStep(1)}>
                <i className="bi bi-arrow-left me-1"></i>Volver a evaluacion
              </button>
              <button className="btn-register" onClick={() => setStep(3)}>
                Continuar a prescripcion<i className="bi bi-arrow-right ms-1"></i>
              </button>
            </div>
          </aside>
          {/* <-- FIN DE LA COLUMNA DERECHA --> */}

        </div>
      )}

      {/* ================================================================== */}
      {/* PASO 3: PRESCRIPCION DE MEDICAMENTOS                               */}
      {/* ================================================================== */}
      {step === 3 && (
        <div className="workspace-card mt-3 animate__animated animate__fadeIn" style={{ display: 'block', height: 'auto' }}>
          <div className="p-4">
            <h5 className="fw-bold mb-4">Emitir Prescripcion Medica</h5>

            {prescripcion ? (
              // CANDADO ABIERTO: Mostrar alerta, pero permitir acciones
              <div className="alert alert-success d-flex flex-wrap align-items-center justify-content-between gap-3">
                <div>
                  <i className="bi bi-check-circle-fill me-2"></i>
                  Ya existe una prescripcion guardada para esta cita.
                </div>
                <div className="d-flex gap-2">
                  {/* Este botón resetea la variable local para que vuelva a aparecer el formulario */}
                  <button className="btn btn-sm btn-outline-primary" onClick={() => setPrescripcion(null)}>
                    <i className="bi bi-plus me-1"></i>Añadir más medicamentos
                  </button>
                  {/* Este botón cierra la cita oficialmente */}
                  <button className="btn btn-sm btn-success" onClick={handleFinalizarConsulta}>
                    Finalizar Consulta <i className="bi bi-arrow-right ms-1"></i>
                  </button>
                </div>
              </div>
            ) : (

              <div className="row g-4">
                {/* Formulario para agregar un medicamento a la lista */}
                <div className="col-md-6">
                  {/* ... (Todo tu formulario de medicamentos se queda igualito, no lo toques) ... */}
                  {/* --- NUEVO: Selector de Hallazgo (Tratamiento) --- */}
                  <div className="mb-3">
                    <label className="form-label-custom">Asociar a Tratamiento / Hallazgo</label>
                    <select
                      className="form-control-custom"
                      value={detalleActual.idPlanTratamiento || ''}
                      onChange={e => setDetalleActual({ ...detalleActual, idPlanTratamiento: e.target.value })}
                    >
                      <option value="">Seleccione... (Opcional)</option>
                      {hallazgos
                        .filter(h => h.estadoPlan.toUpperCase() !== 'COMPLETADO' || h.estadoPlan.toUpperCase() === 'REALIZADO')
                        .map(h => (
                          <option key={h.idPlanTratamiento} value={h.idPlanTratamiento}>
                            Pieza {h.piezaDental} — {h.nombreTratamiento}
                          </option>
                        ))}
                    </select>
                  </div>
                  {/* ------------------------------------------------ */}
                  <div className="border rounded-4 p-3">
                    <h6 className="fw-bold text-primary mb-3">Agregar medicamento</h6>

                    <div className="mb-3">
                      <label className="form-label-custom">Medicamento</label>
                      <select
                        className="form-control-custom"
                        value={detalleActual.idMedicamento}
                        onChange={e => setDetalleActual({ ...detalleActual, idMedicamento: e.target.value })}
                      >
                        <option value="">Seleccione...</option>
                        {medicamentos.map(m => (
                          <option key={m.idMedicamento} value={m.idMedicamento}>
                            {m.nombreMedicamento} — {m.concentracion}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="row g-2 mb-3">
                      <div className="col-6">
                        <label className="form-label-custom">Dosis</label>
                        <input type="text" className="form-control-custom" placeholder="ej. 500mg"
                          value={detalleActual.dosis}
                          onChange={e => setDetalleActual({ ...detalleActual, dosis: e.target.value })} />
                      </div>
                      <div className="col-6">
                        <label className="form-label-custom">Frecuencia</label>
                        <input type="text" className="form-control-custom" placeholder="ej. cada 8h"
                          value={detalleActual.frecuencia}
                          onChange={e => setDetalleActual({ ...detalleActual, frecuencia: e.target.value })} />
                      </div>
                      <div className="col-12">
                        <label className="form-label-custom">Duracion (dias)</label>
                        <input type="number" className="form-control-custom" placeholder="ej. 7"
                          value={detalleActual.duracion}
                          onChange={e => setDetalleActual({ ...detalleActual, duracion: e.target.value })} />
                      </div>
                      <div className="col-12">
                        <label className="form-label-custom">Indicaciones</label>
                        <textarea className="form-control-custom" rows="2" placeholder="Tomar con alimentos..."
                          value={detalleActual.indicaciones}
                          onChange={e => setDetalleActual({ ...detalleActual, indicaciones: e.target.value })}
                        ></textarea>
                      </div>
                    </div>

                    <button className="btn-save w-100" onClick={handleAgregarDetalle}>
                      <i className="bi bi-plus-circle me-2"></i>Agregar a la receta
                    </button>
                  </div>
                </div>

                {/* Vista previa de la receta con los medicamentos agregados */}
                <div className="col-md-6">
                  <div className="border rounded-4 p-3 h-100 d-flex flex-column">
                    <h6 className="fw-bold text-primary mb-3">
                      <i className="bi bi-file-medical me-2"></i>Vista previa de receta
                    </h6>

                    {detalles.length === 0 ? (
                      <p className="text-muted small text-center mt-4">
                        Agrega medicamentos para ver la receta aqui.
                      </p>
                    ) : (
                      <div className="flex-grow-1" style={{ overflowY: 'auto' }}>
                        {detalles.map((d, idx) => (
                          <div key={idx} className="receta-item mb-3 p-2 border rounded-3">
                            <div className="d-flex justify-content-between align-items-start">
                              <strong className="small">{d.nombreMedicamento}</strong>
                              <button
                                className="btn btn-sm btn-link text-danger p-0"
                                onClick={() => setDetalles(prev => prev.filter((_, i) => i !== idx))}
                              >
                                <i className="bi bi-x"></i>
                              </button>
                            </div>
                            <p className="mb-0 text-muted small">
                              {d.dosis} — {d.frecuencia} — {d.duracion} dias
                            </p>
                            {d.indicaciones && <p className="mb-0 text-muted small">{d.indicaciones}</p>}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-auto d-flex flex-column gap-2 pt-3 border-top">
                      <button className="btn-cancel" onClick={() => setStep(2)}>
                        <i className="bi bi-arrow-left me-1"></i>Volver al odontograma
                      </button>

                      <button
                        className="btn-register"
                        onClick={handleGuardarPrescripcion}
                        disabled={savingPrescripcion || detalles.length === 0}
                      >
                        {savingPrescripcion ? 'Guardando...' : 'Guardar Receta'}
                      </button>

                      {/* Botón clave por si el doctor solo hizo limpieza y no quiere recetar nada */}
                      <button
                        className="btn btn-outline-success mt-2"
                        onClick={handleFinalizarConsulta}
                      >
                        Finalizar cita sin medicamentos
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* PASO 4: CIERRE DE CONSULTA                                         */}
      {/* ================================================================== */}
      {step === 4 && (
        <div className="workspace-card mt-3 animate__animated animate__fadeIn"
          style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="text-center py-5">
            <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '5rem' }}></i>
            <h2 className="fw-bold mt-4">Consulta Finalizada</h2>
            <p className="text-muted">
              El diagnostico, hallazgos y prescripcion han sido guardados en el expediente de{' '}
              <strong>{cita.nombreCompletoPaciente}</strong>.
            </p>

            {/* Resumen de lo registrado en la consulta */}
            <div className="d-flex justify-content-center gap-3 mt-3 mb-5">
              <div className="summary-pill blue">{hallazgos.length} Hallazgos</div>
              <div className="summary-pill green">{prescripcion?.detalles?.length || 0} Medicamentos</div>
            </div>

            <div className="d-flex justify-content-center gap-3">
              {/* Impresion de receta: abre el dialogo de impresion del navegador */}
              <button className="btn btn-outline-primary px-4" onClick={() => window.print()}>
                <i className="bi bi-printer me-2"></i>Imprimir Receta
              </button>
              <button className="btn-register px-4" onClick={() => navigate('/consulta')}>
                <i className="bi bi-house me-2"></i>Volver a Consultas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveConsultation;