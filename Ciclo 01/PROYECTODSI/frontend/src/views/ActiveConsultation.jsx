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

const ActiveConsultation = () => {
  // Obtenemos el ID de la cita desde la URL (/consulta/:citaId)
  const { citaId } = useParams();
  const navigate   = useNavigate();

  // Control del paso actual del flujo de consulta
  const [step, setStep] = useState(1);

  // Datos de la cita y el paciente cargados desde el backend
  const [cita, setCita]       = useState(null);
  const [loading, setLoading] = useState(true);

  // ---- PASO 1: Evaluacion clinica ----
  const [evaluacion, setEvaluacion]         = useState(null);
  const [diagnostico, setDiagnostico]       = useState('');
  const [observaciones, setObservaciones]   = useState('');
  const [savingEval, setSavingEval]         = useState(false);

  // ---- PASO 2: Odontograma y hallazgos ----
  const [tratamientos, setTratamientos]     = useState([]);
  const [hallazgos, setHallazgos]           = useState([]);
  const [selectedTeeth, setSelectedTeeth]   = useState([]);
  const [selectedTratamiento, setSelectedTratamiento] = useState('');
  const [savingHallazgo, setSavingHallazgo] = useState(false);
  const [activeFilter, setActiveFilter]     = useState('Hallazgos');

  // ---- PASO 3: Prescripcion ----
  const [medicamentos, setMedicamentos]     = useState([]);
  const [prescripcion, setPrescripcion]     = useState(null);
  const [detalles, setDetalles]             = useState([]);
  // Medicamento que se esta configurando antes de agregar a la lista
  const [detalleActual, setDetalleActual]   = useState({
    idMedicamento: '', dosis: '', frecuencia: '', duracion: '', indicaciones: ''
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
      setDiagnostico(data.diagnostico   || '');
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
      const res  = await fetch(`${API_URL}/consulta/evaluacion`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ idCita: parseInt(citaId), diagnostico, observaciones }),
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
    setSavingHallazgo(true);
    try {
      // Registramos un hallazgo por cada pieza dental seleccionada en el odontograma
      for (const tooth of selectedTeeth) {
        const pieza = tooth.notations?.fdi || tooth.id;
        const res = await fetch(`${API_URL}/consulta/hallazgo`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({
            idEvaluacionClinica: evaluacion.idEvaluacionClinica,
            idTratamiento:       parseInt(selectedTratamiento),
            piezaDental:         parseInt(pieza),
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

  // =========================================================================
  // PASO 3: Prescripcion de medicamentos
  // =========================================================================

  // Agrega un medicamento a la lista local antes de guardar todo junto
  const handleAgregarDetalle = () => {
    if (!detalleActual.idMedicamento || !detalleActual.dosis || !detalleActual.frecuencia || !detalleActual.duracion) {
      Swal.fire({ icon: 'warning', title: 'Campos incompletos', text: 'Completa medicamento, dosis, frecuencia y duracion.', confirmButtonColor: '#6366f1' });
      return;
    }
    const med = medicamentos.find(m => m.idMedicamento === parseInt(detalleActual.idMedicamento));
    setDetalles(prev => [...prev, { ...detalleActual, nombreMedicamento: med?.nombreMedicamento }]);
    // Limpiamos el formulario del detalle actual
    setDetalleActual({ idMedicamento: '', dosis: '', frecuencia: '', duracion: '', indicaciones: '' });
  };

  const handleGuardarPrescripcion = async () => {
    if (detalles.length === 0) {
      Swal.fire({ icon: 'warning', title: 'Sin medicamentos', text: 'Agrega al menos un medicamento.', confirmButtonColor: '#6366f1' });
      return;
    }
    setSavingPrescripcion(true);
    try {
      const payload = {
        idCita:   parseInt(citaId),
        detalles: detalles.map(d => ({
          idMedicamento: parseInt(d.idMedicamento),
          dosis:         d.dosis,
          frecuencia:    d.frecuencia,
          duracion:      parseInt(d.duracion),
          indicaciones:  d.indicaciones || '',
        })),
      };
      const res  = await fetch(`${API_URL}/consulta/prescripcion`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al guardar la prescripcion.');
      setPrescripcion(data);
      Swal.fire({ icon: 'success', title: 'Prescripcion guardada', confirmButtonColor: '#6366f1', timer: 1800, showConfirmButton: false });
      setStep(4); // Paso final: resumen y cierre
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#6366f1' });
    } finally {
      setSavingPrescripcion(false);
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

          {/* Columna izquierda: odontograma */}
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

            <div className="odontogram-container">
              <Odontogram
                onChange={handleOdontogramChange}
                theme="light"
                notation="FDI"
                className="custom-odontogram"
              />
            </div>
            <p className="text-center text-muted small mt-2">
              Selecciona piezas en el grafico y registra el tratamiento en el panel derecho
            </p>

            {/* Lista de hallazgos ya registrados en esta sesion */}
            {hallazgos.length > 0 && (
              <div className="mt-3 px-2">
                <h6 className="fw-bold text-muted small mb-2">Hallazgos registrados</h6>
                <div className="hallazgos-list">
                  {hallazgos.map(h => (
                    <div key={h.idPlanTratamiento} className="hallazgo-item">
                      <span className="hallazgo-pieza">Pieza {h.piezaDental}</span>
                      <span className="hallazgo-nombre">{h.nombreTratamiento}</span>
                      <span className={`hallazgo-estado ${h.estadoPlan.toLowerCase()}`}>{h.estadoPlan}</span>
                      <button
                        className="hallazgo-delete"
                        onClick={() => handleEliminarHallazgo(h.idPlanTratamiento)}
                        title="Eliminar hallazgo"
                      >
                        <i className="bi bi-x"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Columna derecha: panel de registro de hallazgo */}
          <aside className="control-panel">
            <div className="row g-3 mb-3">
              {/* Campo de piezas seleccionadas (solo lectura, se llena desde el odontograma) */}
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

              {/* Selector de tratamiento cargado desde el backend */}
              <div className="col-12">
                <label className="form-label-custom">Tratamiento</label>
                <div className="treatment-dropdown">
                  <div className="dropdown-header">
                    {selectedTratamiento
                      ? tratamientos.find(t => t.idTratamiento === parseInt(selectedTratamiento))?.nombreTratamiento
                      : 'Seleccione un tratamiento'}
                    <i className="bi bi-chevron-down"></i>
                  </div>
                  <div className="dropdown-content" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {tratamientos.map(t => (
                      <div
                        key={t.idTratamiento}
                        className={`item ${selectedTratamiento === String(t.idTratamiento) ? 'active' : ''}`}
                        onClick={() => setSelectedTratamiento(String(t.idTratamiento))}
                      >
                        {t.nombreTratamiento}
                        <span className="text-muted small d-block">${t.costoTratamiento}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <button
              className="btn-register mb-3"
              onClick={handleRegistrarHallazgo}
              disabled={savingHallazgo || selectedTeeth.length === 0 || !selectedTratamiento}
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
              // Si ya existe una prescripcion guardada, la mostramos como resumen
              <div className="alert alert-success">
                <i className="bi bi-check-circle-fill me-2"></i>
                Ya existe una prescripcion guardada para esta cita.
                <button className="btn btn-sm btn-outline-success ms-3" onClick={() => setStep(4)}>
                  Ir al cierre
                </button>
              </div>
            ) : (
              <div className="row g-4">

                {/* Formulario para agregar un medicamento a la lista */}
                <div className="col-md-6">
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
                              {/* Eliminar de la lista local antes de guardar */}
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
                        {savingPrescripcion ? 'Guardando...' : 'Guardar Prescripcion'}
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
