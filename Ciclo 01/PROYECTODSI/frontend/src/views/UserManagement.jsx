import React, { useState } from 'react';
import '../estilos/PatientManagement.css'; // Reutilizamos estilos de layout

const UserManagement = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', usuario: '', email: '', rol: 'Secretaria', estado: 'Activo' });

  const [users] = useState([
    { id: 1, nombre: 'Dr. Arriaza', usuario: 'darriaza', email: 'arriaza@dental.com', rol: 'Odontólogo', estado: 'Activo' },
    { id: 2, nombre: 'Laura Meza', usuario: 'lmeza', email: 'lmeza@dental.com', rol: 'Secretaria', estado: 'Activo' },
  ]);

  const handleSelect = (user) => { setFormData(user); setIsEditing(true); };

  return (
    <div className="d-flex flex-column h-100 p-4" style={{ backgroundColor: '#f8fafc' }}>
      <div className="patient-layout">
        {/* LISTA DE USUARIOS */}
        <section className="directory-module">
          <div className="directory-header p-3 bg-light border-bottom">
            <h6 className="fw-bold m-0">Personal de la Clínica</h6>
          </div>
          <div className="patient-list p-2">
            {users.map(u => (
              <div key={u.id} className="patient-card-item" onClick={() => handleSelect(u)}>
                <div className="patient-avatar-sm bg-secondary">{u.nombre.charAt(0)}</div>
                <div className="patient-brief">
                  <h6 className="m-0 fw-bold">{u.nombre}</h6>
                  <span className="badge bg-light text-dark border small">{u.rol}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FORMULARIO DE USUARIO */}
        <section className="form-module">
          <div className="form-card bg-white p-4 rounded-4 border shadow-sm">
            <h5 className="fw-bold text-primary mb-4">{isEditing ? 'Modificar Usuario' : 'Registrar Nuevo Staff'}</h5>
            <form className="row g-3">
              <div className="col-md-6">
                <label className="form-label-custom">Nombre Completo</label>
                <input type="text" className="form-control-custom" value={formData.nombre} />
              </div>
              <div className="col-md-6">
                <label className="form-label-custom">Nombre de Usuario</label>
                <input type="text" className="form-control-custom" value={formData.usuario} />
              </div>
              <div className="col-md-6">
                <label className="form-label-custom">Rol en el Sistema</label>
                <select className="form-control-custom" value={formData.rol}>
                  <option>Odontólogo</option>
                  <option>Secretaria</option>
                  <option>AdminTI</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label-custom">Estado</label>
                <select className="form-control-custom" value={formData.estado}>
                  <option>Activo</option>
                  <option>Inactivo</option>
                </select>
              </div>
              <div className="col-12 mt-4 d-flex justify-content-end gap-2">
                <button type="button" className="btn-cancel" onClick={() => setIsEditing(false)}>Cancelar</button>
                <button type="button" className="btn-save">Guardar Usuario</button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};

export default UserManagement;