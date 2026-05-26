import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../estilos/PatientManagement.css';

const PatientManagement = () => {
  const navigate = useNavigate();
  
  // Estado para controlar el formulario (Crear vs Editar)
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock de datos de pacientes
  const [patients, setPatients] = useState([
    { id: 1, nombre: 'María Fernanda', apellido: 'López García', dui: '04567891-2', telefono: '7777-8888', email: 'mafer@gmail.com', alergias: 'Penicilina' },
    { id: 2, nombre: 'Carlos Roberto', apellido: 'Martínez', dui: '05678123-4', telefono: '7123-4567', email: 'carlos.m@yahoo.com', alergias: 'Ninguna' },
    { id: 3, nombre: 'Ana Lucía', apellido: 'Ortiz', dui: '06123456-7', telefono: '6000-1111', email: 'ana.ortiz@hotmail.com', alergias: 'Ibuprofeno' },
  ]);

  // Estado del formulario actual
  const [formData, setFormData] = useState({
    nombre: '', apellido: '', dui: '', telefono: '', email: '', alergias: ''
  });

  // Función para seleccionar un paciente y pasarlo a modo edición
  const handleSelectPatient = (patient) => {
    setFormData(patient);
    setIsEditing(true);
  };

  // Función para limpiar el formulario y pasar a modo creación
  const handleNewPatient = () => {
    setFormData({ nombre: '', apellido: '', dui: '', telefono: '', email: '', alergias: '' });
    setIsEditing(false);
  };

  // Manejo de inputs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="app-container">
     
      <main className="app-content">
       
        <div className="app-body patient-layout">
          
          {/* MÓDULO IZQUIERDO: DIRECTORIO (Master) */}
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
              {patients.filter(p => p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || p.dui.includes(searchTerm)).map((patient) => (
                <div 
                  key={patient.id} 
                  className={`patient-card-item ${formData.id === patient.id ? 'selected' : ''}`}
                  onClick={() => handleSelectPatient(patient)}
                >
                  <div className="patient-avatar-sm">
                    {patient.nombre.charAt(0)}{patient.apellido.charAt(0)}
                  </div>
                  <div className="patient-brief">
                    <h6 className="m-0 fw-bold">{patient.nombre} {patient.apellido}</h6>
                    <span className="text-muted small">DUI: {patient.dui} | {patient.telefono}</span>
                  </div>
                  <i className="bi bi-chevron-right text-muted"></i>
                </div>
              ))}
            </div>
          </section>

          {/* MÓDULO DERECHO: FORMULARIO (Detail) */}
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
                  <h6 className="fw-bold text-muted mb-3"><i className="bi bi-person-badge me-2"></i>Datos Personales</h6>
                </div>
                <div className="col-md-6">
                  <label className="form-label-custom">Nombres</label>
                  <input type="text" name="nombre" className="form-control-custom" value={formData.nombre} onChange={handleChange} />
                </div>
                <div className="col-md-6">
                  <label className="form-label-custom">Apellidos</label>
                  <input type="text" name="apellido" className="form-control-custom" value={formData.apellido} onChange={handleChange} />
                </div>
                <div className="col-md-6">
                  <label className="form-label-custom">DUI</label>
                  <input type="text" name="dui" className="form-control-custom" placeholder="00000000-0" value={formData.dui} onChange={handleChange} />
                </div>
                <div className="col-md-6">
                  <label className="form-label-custom">Fecha de Nacimiento</label>
                  <input type="date" className="form-control-custom" />
                </div>

                {/* Datos de Contacto */}
                <div className="col-12 mt-4">
                  <h6 className="fw-bold text-muted mb-3"><i className="bi bi-telephone me-2"></i>Contacto</h6>
                </div>
                <div className="col-md-6">
                  <label className="form-label-custom">Teléfono</label>
                  <input type="text" name="telefono" className="form-control-custom" placeholder="0000-0000" value={formData.telefono} onChange={handleChange} />
                </div>
                <div className="col-md-6">
                  <label className="form-label-custom">Correo Electrónico</label>
                  <input type="email" name="email" className="form-control-custom" value={formData.email} onChange={handleChange} />
                </div>

                {/* Antecedentes Médicos */}
                <div className="col-12 mt-4">
                  <h6 className="fw-bold text-muted mb-3"><i className="bi bi-heart-pulse me-2"></i>Antecedentes Médicos</h6>
                </div>
                <div className="col-12">
                  <label className="form-label-custom">Alergias conocidas</label>
                  <textarea 
                    name="alergias" 
                    className="form-control-custom" 
                    rows="2" 
                    value={formData.alergias} 
                    onChange={handleChange}
                    placeholder="Especifique si es alérgico a medicamentos, anestesia, etc."
                  ></textarea>
                </div>

                {/* Botones de Acción */}
                <div className="col-12 mt-5 d-flex gap-3 justify-content-end border-top pt-4">
                  {isEditing && (
                    <button type="button" className="btn-delete" onClick={() => alert('Eliminar paciente')}>
                      <i className="bi bi-trash"></i> Eliminar
                    </button>
                  )}
                  <button type="button" className="btn-cancel" onClick={handleNewPatient}>
                    Cancelar
                  </button>
                  <button type="button" className="btn-save">
                    <i className="bi bi-check-circle me-2"></i>
                    {isEditing ? 'Guardar Cambios' : 'Registrar Paciente'}
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