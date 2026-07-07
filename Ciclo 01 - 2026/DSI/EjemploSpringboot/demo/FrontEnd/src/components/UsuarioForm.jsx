import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';

import { getUsuarios, createUsuario, deleteUsuario, updateUsuario } from '../services/usuarioServices';

const UsuarioForm = () => {

  const [usuarios, setUsuarios] = useState([]);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: ''
  });

  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    obtenerUsuarios();
  }, []);

  const obtenerUsuarios = async () => {
    try {
      setLoading(true);
      const response = await getUsuarios();
      setUsuarios(response.data);
      setError(null);
    } catch (err) {
      setError("Error al cargar usuarios");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateUsuario(editingId, formData);
      } else {
        await createUsuario(formData);
      }
      obtenerUsuarios();
      setFormData({ nombre: '', email: '', password: '' });
      setEditingId(null);
      setError(null);
    } catch (err) {
      setError(editingId ? "Error al actualizar usuario" : "Error al crear usuario");
      console.error(err);
    }
  };

  const handleEdit = (id) => {
    const usuario = usuarios.find(u => u.id === id);
    if (usuario) {
      setFormData({
        nombre: usuario.nombre,
        email: usuario.email,
        password: usuario.password || '' 
      });
      setEditingId(id);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteUsuario(id);
      obtenerUsuarios();
    } catch (err) {
      setError("Error al eliminar usuario");
      console.error(err);
    }
  };

  return (
    <div className="container mt-4">

      <div className="contenedor-formulario">
        <h2 className="mb-4">{editingId ? 'Editar Usuario' : 'Registrar Usuario'}</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Nombre</label>
            <input
              type="text"
              className="form-control"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Correo</label>
            <input
              type="email"
              className="form-control"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              className="form-control"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100">
            {editingId ? 'Actualizar' : 'Guardar'}
          </button>

          {editingId && (
            <button
              type="button"
              className="btn btn-secondary w-100 mt-2"
              onClick={() => {
                setEditingId(null);
                setFormData({ nombre: '', email: '', password: '' });
              }}
            >
              Cancelar
            </button>
          )}
        </form>
      </div>

      <div className="lista-usuarios mt-5">
        <h3>Usuarios</h3>

        {loading && <p>Cargando...</p>}
        {error && <p className="text-danger">{error}</p>}

        <ul className="list-group">
          {usuarios.map(usuario => (
            <li key={usuario.id} className="list-group-item d-flex justify-content-between">
              <span>
                <strong>{usuario.nombre}</strong>
              </span>
              <span>
                <strong>{usuario.email}</strong>
              </span>
              <button
                className="btn btn-warning btn-sm"
                onClick={() => handleEdit(usuario.id)}
              >
                Editar
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => handleDelete(usuario.id)}
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
};

export default UsuarioForm;