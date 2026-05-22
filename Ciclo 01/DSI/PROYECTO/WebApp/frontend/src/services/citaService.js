import api from '../api/axiosConfig'; //importamos la configuracion de instancia del backend

//Esta se  encarga exclusivamente de interactuar con los endpoints del backend,
//  mapeando promesas y abstrayendo las peticiones HTTP directas.

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

export const cancelarCitaAPI = async (id, motivo) => {
    const response = await api.put(`/citas/${id}/cancelar`, { motivoCancelacion: motivo });
    return response.data;
};


