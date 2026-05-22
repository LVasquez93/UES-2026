import api from '../api/axiosConfig';

export const obtenerPacientes = async () => {
    const response = await api.get('/pacientes');
    return response.data;
};