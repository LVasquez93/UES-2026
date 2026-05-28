import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import '../estilos/PatientManagement.css';

const API_URL = 'http://localhost:8080/api';

/** Esta Pantalla es el modulo de gestion de usuarios, donde el usuario puede ver un directorio de usuarios registrados, buscar por nombre o nombre de usuario, seleccionar un usuario para ver su perfil completo y editar sus datos personales o roles. El formulario se adapta según si se está creando un nuevo usuario o editando uno existente, mostrando los botones correspondientes (Registrar vs Guardar Cambios + Eliminar). Al eliminar un usuario se muestra una confirmación con SweetAlert2 para evitar eliminaciones accidentales */

const UserManagement = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nombreUsuario: '',
    apellidoUsuario: '',
    usernameUsuario: '',
    emailUsuario: '',
    password: '',
    idRol: 1,
    esActivo: true,
  });

  // Reemplaza el rolesMap fijo por estado dinamico
  const [roles, setRoles] = useState([]);

  // Carga roles junto con los usuarios al montar el componente
  useEffect(() => {
    fetchUsuarios();
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await fetch(`${API_URL}/roles`);
      if (!res.ok) throw new Error('Error al cargar roles.');
      setRoles(await res.json());
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#0d6efd' });
    }
  };

  // Carga los usuarios del backend al montar el componente
  useEffect(() => { fetchUsuarios(); }, []);

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/usuarios`);
      if (!res.ok) throw new Error('Error al cargar usuarios.');
      setUsers(await res.json());
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#0d6efd' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'idRol' ? parseInt(value) : value }));
  };

  // Carga los datos del usuario seleccionado en el formulario
  const handleSelect = (user) => {
    setSelectedId(user.idUsuario);
    setIsEditing(true);
    setFormData({
      nombreUsuario: user.nombreUsuario,
      apellidoUsuario: user.apellidoUsuario,
      usernameUsuario: user.usernameUsuario,
      emailUsuario: user.emailUsuario,
      password: '',
      // Busca el idRol correspondiente al nombre del rol del usuario seleccionado
      idRol: roles.find(r => r.nombreRol === user.rol)?.idRol ?? roles[0]?.idRol ?? 1,
      esActivo: user.esActivo,
    });
  };

  // Limpia el formulario y vuelve al modo registrar
  const handleCancel = () => {
    setIsEditing(false);
    setSelectedId(null);
    setFormData({
      nombreUsuario: '', apellidoUsuario: '', usernameUsuario: '',
      emailUsuario: '', password: '', idRol: 1, esActivo: true,
    });
  };

  // CREAR: POST /api/usuarios
  const handleCreate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al crear usuario.');
      Swal.fire({ icon: 'success', title: 'Usuario creado', text: `"${data.usernameUsuario}" registrado correctamente.`, confirmButtonColor: '#0d6efd' });
      fetchUsuarios();
      handleCancel();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#0d6efd' });
    } finally {
      setLoading(false);
    }
  };

  // EDITAR: PUT /api/usuarios/:id
  const handleUpdate = async () => {
    setLoading(true);
    try {
      const payload = { ...formData };
      // No enviamos password si el usuario la dejo vacia
      if (!payload.password) delete payload.password;
      const res = await fetch(`${API_URL}/usuarios/${selectedId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al actualizar usuario.');
      Swal.fire({ icon: 'success', title: 'Usuario actualizado', text: 'Los cambios se guardaron correctamente.', confirmButtonColor: '#0d6efd' });
      fetchUsuarios();
      handleCancel();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#0d6efd' });
    } finally {
      setLoading(false);
    }
  };

  // DESACTIVAR: DELETE /api/usuarios/:id (el backend lo inhabilita, no lo borra)
  const handleDelete = async (id, nombre) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Desactivar usuario',
      text: `El usuario "${nombre}" sera inhabilitado y no podra iniciar sesion.`,
      showCancelButton: true,
      confirmButtonText: 'Si, desactivar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
    });
    if (!result.isConfirmed) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/usuarios/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Error al desactivar usuario.');
      }
      Swal.fire({ icon: 'success', title: 'Usuario desactivado', text: 'El usuario fue inhabilitado correctamente.', confirmButtonColor: '#0d6efd' });
      fetchUsuarios();
      if (selectedId === id) handleCancel();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#0d6efd' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => { if (isEditing) handleUpdate(); else handleCreate(); };

  return (
    <div className="d-flex flex-column h-100 p-4" style={{ backgroundColor: '#f8fafc' }}>
      <div className="patient-layout">

        {/* LISTA DE USUARIOS */}
        <section className="directory-module">
          <div className="directory-header p-3 bg-light border-bottom">
            <h6 className="fw-bold m-0">Personal de la Clinica</h6>
          </div>
          <div className="patient-list p-2">
            {loading && !users.length && (
              <p className="text-muted small text-center p-3">Cargando usuarios...</p>
            )}
            {users.map(u => (
              <div
                key={u.idUsuario}
                className={`patient-card-item ${selectedId === u.idUsuario ? 'selected' : ''}`}
                onClick={() => handleSelect(u)}
                // Opacidad reducida para usuarios inactivos
                style={{ opacity: u.esActivo ? 1 : 0.5 }}
              >
                {/* Avatar: gris si inactivo, color normal si activo */}
                <div className={`patient-avatar-sm ${u.esActivo ? 'bg-secondary' : 'bg-light border'}`}
                  style={{ color: u.esActivo ? '#fff' : '#adb5bd' }}>
                  {u.nombreUsuario.charAt(0)}
                </div>

                <div className="patient-brief" style={{ flex: 1 }}>
                  <h6 className="m-0 fw-bold" style={{ color: u.esActivo ? 'inherit' : '#adb5bd' }}>
                    {u.nombreUsuario} {u.apellidoUsuario}
                  </h6>
                  <div className="d-flex align-items-center gap-1 flex-wrap">
                    <span className="badge bg-light text-dark border small">{u.rol}</span>
                    {/* Badge de estado: solo se muestra si el usuario esta inactivo */}
                    {!u.esActivo && (
                      <span className="badge small" style={{ backgroundColor: '#fff3cd', color: '#856404', border: '1px solid #ffc107' }}>
                        Inactivo
                      </span>
                    )}
                  </div>
                </div>

                {/* Boton de desactivar: solo visible en usuarios activos */}
                {u.esActivo && (
                  <button
                    className="btn btn-sm btn-outline-danger ms-2"
                    style={{ fontSize: '0.7rem' }}
                    onClick={(e) => { e.stopPropagation(); handleDelete(u.idUsuario, u.nombreUsuario); }}
                    title="Desactivar usuario"
                  >
                    <i className="bi bi-slash-circle"></i>
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* FORMULARIO DE USUARIO */}
        <section className="form-module">
          <div className="form-card bg-white p-4 rounded-4 border shadow-sm">
            <h5 className="fw-bold text-primary mb-4">
              {isEditing ? 'Modificar Usuario' : 'Registrar Nuevo Staff'}
            </h5>

            <form className="row g-3" onSubmit={(e) => e.preventDefault()}>
              <div className="col-md-6">
                <label className="form-label-custom">Nombre</label>
                <input type="text" name="nombreUsuario" className="form-control-custom"
                  value={formData.nombreUsuario} onChange={handleChange} placeholder="Juan" />
              </div>
              <div className="col-md-6">
                <label className="form-label-custom">Apellido</label>
                <input type="text" name="apellidoUsuario" className="form-control-custom"
                  value={formData.apellidoUsuario} onChange={handleChange} placeholder="Perez" />
              </div>
              <div className="col-md-6">
                <label className="form-label-custom">Nombre de Usuario</label>
                <input type="text" name="usernameUsuario" className="form-control-custom"
                  value={formData.usernameUsuario} onChange={handleChange} placeholder="juan.perez" />
              </div>
              <div className="col-md-6">
                <label className="form-label-custom">Correo Electronico</label>
                <input type="email" name="emailUsuario" className="form-control-custom"
                  value={formData.emailUsuario} onChange={handleChange} placeholder="juan@dentalcare.com" />
              </div>
              <div className="col-md-6">
                <label className="form-label-custom">
                  Contrasena
                  {isEditing && <span className="text-muted small ms-1">(dejar vacio para no cambiar)</span>}
                </label>
                <input type="password" name="password" className="form-control-custom"
                  value={formData.password} onChange={handleChange}
                  placeholder={isEditing ? 'Nueva contrasena (opcional)' : 'Contrasena'} />
              </div>
              <div className="col-md-6">
                <label className="form-label-custom">Rol en el Sistema</label>
                <select name="idRol" className="form-control-custom"
                  value={formData.idRol} onChange={handleChange}>
                  {/* Renderiza los roles dinamicamente desde la BD */}
                  {roles.map(r => (
                    <option key={r.idRol} value={r.idRol}>
                      {r.nombreRol}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-12 mt-4 d-flex justify-content-end gap-2">
                <button type="button" className="btn-cancel" onClick={handleCancel} disabled={loading}>
                  Cancelar
                </button>
                <button type="button" className="btn-save" onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Guardando...' : isEditing ? 'Actualizar Usuario' : 'Guardar Usuario'}
                </button>
              </div>
            </form>
          </div>
        </section>

      </div>
    </div>
  );
};

export default UserManagement;