import axios from "axios";

const API_URL = "http://localhost:8080/api/usuarios";

// Obtener todos los usuarios
export const getUsuarios = async () => {
  return await axios.get(API_URL);
};

// Crear usuario
export const createUsuario = async (usuario) => {
  return await axios.post(API_URL, usuario);
};

// (Opcional) eliminar usuario
export const deleteUsuario = async (id) => {
  return await axios.delete(`${API_URL}/${id}`);
};

// (Opcional) actualizar usuario
export const updateUsuario = async (id, usuario) => {
  return await axios.put(`${API_URL}/${id}`, usuario);
};
