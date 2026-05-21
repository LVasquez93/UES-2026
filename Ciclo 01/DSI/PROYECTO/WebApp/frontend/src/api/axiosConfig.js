// Configuración de Axios para la comunicación con el backend de Spring Boot
import axios from 'axios';

// Creamos una instancia configurada de Axios con la URL base de nuestro backend
//esto sirve para evitar escribir la URL completa en cada solicitud y centralizar la configuración
const api = axios.create({
    baseURL: 'http://localhost:8080/api', // La ruta base del backend Spring Boot
    headers: {
        'Content-Type': 'application/json' // Configuramos el tipo de contenido para las solicitudes
    }
});
// Se pueden agregar interceptores aquí si necesitas manejar tokens de autenticación o errores globales

//Exportamos la instancia de Axios para que pueda ser utilizada en otros archivos de la aplicación, 
//como en los servicios o componentes de React, facilitando así la comunicación con el backend.
export default api;
