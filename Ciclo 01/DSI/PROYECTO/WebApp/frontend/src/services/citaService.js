import api from '../api/axiosConfig';

export const obtenerCitas = async () => {
    const response = await api.get('/citas');
    return response.data;
};

export const crearCita = async (request) => {
    const response = await api.post('/citas', request);
    return response.data;
};
export const actualizarCitaAPI = async (id, request) => {
    const response = await api.put(`/citas/${id}`, request);
    return response.data;
};
// Nueva función para cancelar
export const cancelarCitaAPI = async (id, motivo) => {
    const response = await api.put(`/citas/${id}/cancelar`, { motivoCancelacion: motivo });
    return response.data;
};

// Funciones para llenar los Selects del formulario
export const obtenerPacientes = async () => {
    const response = await api.get('/pacientes'); // Asegúrate de tener este endpoint en el Back
    return response.data;
};

export const obtenerOdontologos = async () => {
    const response = await api.get('/odontologos'); // Asegúrate de tener este endpoint en el Back
    return response.data;
};