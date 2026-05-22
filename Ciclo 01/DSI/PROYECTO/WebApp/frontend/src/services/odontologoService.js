import api from '../api/axiosConfig';

export const obtenerOdontologos = async () => {
    const response = await api.get('/odontologos');
    return response.data;
};