import { useState, useEffect, useCallback } from 'react';
import { obtenerCitas, crearCita, actualizarCitaAPI, cancelarCitaAPI } from '../services/citaService';
import Swal from 'sweetalert2';

export function useCitas() {
    const [citas, setCitas] = useState([]);
    const [cargando, setCargando] = useState(true);

    const cargarDatos = useCallback(async () => {
        setCargando(true);
        try {
            const datos = await obtenerCitas();
            setCitas(datos);
        } catch (error) {
            console.error("Error al recuperar citas:", error);
            Swal.fire('Error', 'No se pudo sincronizar la agenda odontológica.', 'error');
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    // Lógica para formatear y enviar nueva cita al backend
    const agendarNuevaCita = async (formData) => {
        try {
            const request = {
                ...formData,
                horaInicioCita: `${formData.fechaCita}T${formData.horaInicioCita}:00`,
                horaFinCita: `${formData.fechaCita}T${formData.horaFinCita}:00`
            };
            await crearCita(request);
            Swal.fire('¡Agendada!', 'La cita se ha registrado exitosamente.', 'success');
            await cargarDatos(); // Auto-refresco de la lista
            return true;
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Hubo un problema al agendar la cita.', 'error');
            return false;
        }
    };

    // Lógica para actualizar cita existente
    const modificarCita = async (id, formData) => {
        try {
            const request = {
                ...formData,
                horaInicioCita: `${formData.fechaCita}T${formData.horaInicioCita}:00`,
                horaFinCita: `${formData.fechaCita}T${formData.horaFinCita}:00`
            };
            await actualizarCitaAPI(id, request);
            Swal.fire('¡Modificada!', 'Los cambios han sido guardados.', 'success');
            await cargarDatos();
            return true;
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'No se pudieron guardar las modificaciones.', 'error');
            return false;
        }
    };

    // Modales interactivos elegantes reemplazando el prompt() nativo
    const cancelarCita = async (id) => {
        const { value: motivo } = await Swal.fire({
            title: '¿Cancelar esta cita?',
            text: "Esta acción cambiará el estado de la cita de forma permanente.",
            input: 'text',
            inputLabel: 'Escriba el motivo de la cancelación:',
            inputPlaceholder: 'Ej. Cambio de planes del paciente, emergencia...',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, cancelar cita',
            cancelButtonText: 'Volver',
            inputValidator: (value) => {
                if (!value) {
                    return '¡Es obligatorio indicar un motivo para proceder!';
                }
            }
        });

        if (motivo) {
            try {
                await cancelarCitaAPI(id, motivo);
                Swal.fire('Cancelada', 'La cita fue cancelada correctamente.', 'success');
                await cargarDatos();
            } catch (error) {
                console.error(error);
                Swal.fire('Error', 'No se pudo procesar la cancelación en el servidor.', 'error');
            }
        }
    };

    return {
        citas,
        cargando,
        refrescarCitas: cargarDatos,
        agendarNuevaCita,
        modificarCita,
        cancelarCita
    };
}