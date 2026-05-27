import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../estilos/PatientManagement.css';

// URL base del backend
const API_URL = 'http://localhost:8080/api';

/**Esta Pantalla es el modulo de gestion de pacientes, donde el usuario puede ver un directorio de pacientes registrados, buscar por nombre o DUI, seleccionar un paciente para ver su expediente completo y editar sus datos personales o antecedentes medicos. El formulario se adapta segun si se esta creando un nuevo paciente o editando uno existente, mostrando los botones correspondientes (Registrar vs Guardar Cambios + Eliminar). Al eliminar un paciente se muestra una confirmacion con SweetAlert2 para evitar eliminaciones accidentales*/

const PatientManagement = () => {
  const navigate = useNavigate();

  // Controla si el formulario esta en modo edicion o creacion
  const [isEditing, setIsEditing]   = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients]     = useState([]);
  const [loading, setLoading]       = useState(false);

  // Estado del formulario: campos alineados con PacienteRequestDto del backend
  const [formData, setFormData] = useState({
    nombrePaciente:          '',
    apellidoPaciente:        '',
    numeroIdentidadPaciente: '',
    telefonoPaciente:        '',
    fechaNacimientoPaciente: '',
    emailPaciente:           '',
    contactoEmergencia:      '',
    alergias:                '',
  });

  // -------------------------------------------------------------------------
  // Carga inicial de pacientes al montar el componente
  // -------------------------------------------------------------------------
  useEffect(() => {
    fetchPacientes();
  }, []);

  // -------------------------------------------------------------------------
  // Busqueda en tiempo real: dispara cuando el usuario escribe en el buscador
  // Usa el endpoint /buscar si hay termino, o lista todos si esta vacio
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (searchTerm.trim() === '') {
      fetchPacientes();
    } else {
      buscarPacientes(searchTerm);
    }
  }, [searchTerm]);

  // Obtiene todos los pacientes: GET /api/pacientes
  const fetchPacientes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/pacientes`);
      if (!res.ok) throw new Error('Error al cargar pacientes.');
      setPatients(await res.json());
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#0d6efd' });
    } finally {
      setLoading(false);
    }
  };

  // Busca pacientes por termino: GET /api/pacientes/buscar?term=xxx
  const buscarPacientes = async (term) => {
    try {
      const res = await fetch(`${API_URL}/pacientes/buscar?term=${encodeURIComponent(term)}`);
      if (!res.ok) throw new Error('Error en la busqueda.');
      setPatients(await res.json());
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#0d6efd' });
    }
  };

  // -------------------------------------------------------------------------
  // Selecciona un paciente de la lista y carga sus datos en el formulario
  // -------------------------------------------------------------------------
  const handleSelectPatient = (patient) => {
    setIsEditing(true);
    setFormData({
      // Guardamos el id separado para usarlo en PUT y DELETE
      id:                      patient.idPaciente,
      nombrePaciente:          patient.nombrePaciente,
      apellidoPaciente:        patient.apellidoPaciente,
      numeroIdentidadPaciente: patient.numeroIdentidadPaciente,
      telefonoPaciente:        patient.telefonoPaciente        || '',
      // La fecha viene como array [yyyy, mm, dd] desde Jackson, la formateamos para el input date
      fechaNacimientoPaciente: patient.fechaNacimientoPaciente
        ? (Array.isArray(patient.fechaNacimientoPaciente)
            ? patient.fechaNacimientoPaciente.join('-').replace(/(\d+)-(\d)-/, '$1-0$2-').replace(/-(\d)$/, '-0$1')
            : patient.fechaNacimientoPaciente)
        : '',
      emailPaciente:           patient.emailPaciente           || '',
      contactoEmergencia:      patient.contactoEmergencia      || '',
      alergias:                patient.alergias                || '',
    });
  };

  // -------------------------------------------------------------------------
  // Limpia el formulario y vuelve al modo creacion
  // -------------------------------------------------------------------------
  const handleNewPatient = () => {
    setIsEditing(false);
    setFormData({
      nombrePaciente: '', apellidoPaciente: '', numeroIdentidadPaciente: '',
      telefonoPaciente: '', fechaNacimientoPaciente: '',
      emailPaciente: '', contactoEmergencia: '', alergias: '',
    });
  };

  // Manejo generico de cambios en cualquier campo del formulario
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // -------------------------------------------------------------------------
  // CREAR paciente: POST /api/pacientes
  // -------------------------------------------------------------------------
  const handleCreate = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/pacientes`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al registrar paciente.');
      Swal.fire({ icon: 'success', title: 'Paciente registrado', text: `${data.nombrePaciente} ${data.apellidoPaciente} fue registrado correctamente.`, confirmButtonColor: '#0d6efd' });
      fetchPacientes();
      handleNewPatient();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#0d6efd' });
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------------------
  // EDITAR paciente: PUT /api/pacientes/:id
  // -------------------------------------------------------------------------
  const handleUpdate = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/pacientes/${formData.id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al actualizar paciente.');
      Swal.fire({ icon: 'success', title: 'Expediente actualizado', text: 'Los cambios fueron guardados correctamente.', confirmButtonColor: '#0d6efd' });
      fetchPacientes();
      handleNewPatient();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#0d6efd' });
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------------------
  // ELIMINAR paciente: DELETE /api/pacientes/:id con confirmacion SweetAlert2
  // -------------------------------------------------------------------------
  const handleDelete = async () => {
    const result = await Swal.fire({
      icon:              'warning',
      title:             'Eliminar paciente',
      text:              `Eliminar el expediente de "${formData.nombrePaciente} ${formData.apellidoPaciente}"? Esta accion no se puede deshacer.`,
      showCancelButton:  true,
      confirmButtonText: 'Si, eliminar',
      cancelButtonText:  'Cancelar',
      confirmButtonColor: '#dc3545',
      cancelButtonColor:  '#6c757d',
    });
    if (!result.isConfirmed) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/pacientes/${formData.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Error al eliminar paciente.');
      }
      Swal.fire({ icon: 'success', title: 'Eliminado', text: 'El expediente fue eliminado correctamente.', confirmButtonColor: '#0d6efd' });
      fetchPacientes();
      handleNewPatient();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#0d6efd' });
    } finally {
      setLoading(false);
    }
  };

  // Decide si ejecutar crear o editar segun el modo actual del formulario
  const handleSubmit = () => { if (isEditing) handleUpdate(); else handleCreate(); };

  return (
    <div className="app-container">
      <main className="app-content">
        <div className="app-body patient-layout">

          {/* MODULO IZQUIERDO: DIRECTORIO */}
          <section className="directory-module">
            <div className="directory-header">
              <div className="search-bar-full">
                <i className="bi bi-search"></i>
                <input
                  type="text"
                  placeholder="Buscar por nombre o DUI..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="patient-list">
              {/* Indicador de carga mientras se obtienen datos */}
              {loading && !patients.length && (
                <p className="text-muted small text-center p-3">Cargando pacientes...</p>
              )}
              {/* Lista de pacientes: no se filtra en cliente porque el backend ya filtra */}
              {patients.map((patient) => (
                <div
                  key={patient.idPaciente}
                  className={`patient-card-item ${formData.id === patient.idPaciente ? 'selected' : ''}`}
                  onClick={() => handleSelectPatient(patient)}
                >
                  <div className="patient-avatar-sm">
                    {patient.nombrePaciente.charAt(0)}{patient.apellidoPaciente.charAt(0)}
                  </div>
                  <div className="patient-brief">
                    <h6 className="m-0 fw-bold">{patient.nombrePaciente} {patient.apellidoPaciente}</h6>
                    <span className="text-muted small">DUI: {patient.numeroIdentidadPaciente} | {patient.telefonoPaciente}</span>
                  </div>
                  <i className="bi bi-chevron-right text-muted"></i>
                </div>
              ))}
            </div>
          </section>

          {/* MODULO DERECHO: FORMULARIO */}
          <section className="form-module">
            <div className="form-card">
              <div className="form-header mb-4 border-bottom pb-3">
                <h5 className="fw-bold m-0 text-primary">
                  {isEditing ? 'Modificar Expediente' : 'Registro de Nuevo Paciente'}
                </h5>
                {isEditing && <span className="badge bg-light text-primary border">ID: {formData.id}</span>}
              </div>

              <form className="row g-4">
                {/* Datos Personales */}
                <div className="col-12">
                  <h6 className="fw-bold text-muted mb-3">
                    <i className="bi bi-person-badge me-2"></i>Datos Personales
                  </h6>
                </div>
                <div className="col-md-6">
                  <label className="form-label-custom">Nombres</label>
                  <input type="text" name="nombrePaciente" className="form-control-custom"
                    value={formData.nombrePaciente} onChange={handleChange} />
                </div>
                <div className="col-md-6">
                  <label className="form-label-custom">Apellidos</label>
                  <input type="text" name="apellidoPaciente" className="form-control-custom"
                    value={formData.apellidoPaciente} onChange={handleChange} />
                </div>
                <div className="col-md-6">
                  <label className="form-label-custom">DUI</label>
                  <input type="text" name="numeroIdentidadPaciente" className="form-control-custom"
                    placeholder="00000000-0" value={formData.numeroIdentidadPaciente} onChange={handleChange} />
                </div>
                <div className="col-md-6">
                  <label className="form-label-custom">Fecha de Nacimiento</label>
                  <input type="date" name="fechaNacimientoPaciente" className="form-control-custom"
                    value={formData.fechaNacimientoPaciente} onChange={handleChange} />
                </div>

                {/* Contacto */}
                <div className="col-12 mt-4">
                  <h6 className="fw-bold text-muted mb-3">
                    <i className="bi bi-telephone me-2"></i>Contacto
                  </h6>
                </div>
                <div className="col-md-6">
                  <label className="form-label-custom">Telefono</label>
                  <input type="text" name="telefonoPaciente" className="form-control-custom"
                    placeholder="0000-0000" value={formData.telefonoPaciente} onChange={handleChange} />
                </div>
                <div className="col-md-6">
                  <label className="form-label-custom">Correo Electronico</label>
                  <input type="email" name="emailPaciente" className="form-control-custom"
                    value={formData.emailPaciente} onChange={handleChange} />
                </div>
                <div className="col-md-6">
                  <label className="form-label-custom">Contacto de Emergencia</label>
                  <input type="text" name="contactoEmergencia" className="form-control-custom"
                    placeholder="Nombre y telefono" value={formData.contactoEmergencia} onChange={handleChange} />
                </div>

                {/* Antecedentes Medicos */}
                <div className="col-12 mt-4">
                  <h6 className="fw-bold text-muted mb-3">
                    <i className="bi bi-heart-pulse me-2"></i>Antecedentes Medicos
                  </h6>
                </div>
                <div className="col-12">
                  <label className="form-label-custom">Alergias conocidas</label>
                  <textarea
                    name="alergias"
                    className="form-control-custom"
                    rows="2"
                    value={formData.alergias}
                    onChange={handleChange}
                    placeholder="Especifique si es alergico a medicamentos, anestesia, etc."
                  ></textarea>
                </div>

                {/* Botones de Accion */}
                <div className="col-12 mt-5 d-flex gap-3 justify-content-end border-top pt-4">
                  {isEditing && (
                    <button type="button" className="btn-delete" onClick={handleDelete} disabled={loading}>
                      <i className="bi bi-trash"></i> Eliminar
                    </button>
                  )}
                  <button type="button" className="btn-cancel" onClick={handleNewPatient} disabled={loading}>
                    Cancelar
                  </button>
                  <button type="button" className="btn-save" onClick={handleSubmit} disabled={loading}>
                    <i className="bi bi-check-circle me-2"></i>
                    {loading ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Registrar Paciente'}
                  </button>
                </div>
              </form>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
};

export default PatientManagement;