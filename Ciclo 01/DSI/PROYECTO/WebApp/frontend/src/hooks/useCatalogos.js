import { useState, useEffect } from 'react';
import { obtenerPacientes } from '../services/pacienteService';
import { obtenerOdontologos } from '../services/odontologoService';
import Swal from 'sweetalert2';

// 
export function useCatalogos() {
    const [pacientes, setPacientes] = useState([]);
    const [odontologos, setOdontologos] = useState([]);
    const [cargandoCatalogos, setCargandoCatalogos] = useState(true);

    useEffect(() => {
        const cargarCatalogos = async () => {
            try {
                // Ejecución en paralelo para mejorar rendimiento
                const [listaPacientes, listaOdontologos] = await Promise.all([
                    obtenerPacientes(),
                    obtenerOdontologos()
                ]);
                setPacientes(listaPacientes);
                setOdontologos(listaOdontologos);
            } catch (error) {
                console.error("Error cargando catálogos:", error);
                Swal.fire({
                    title: 'Error de Conexión',
                    text: 'No se pudieron cargar las listas de pacientes u odontólogos.',
                    icon: 'error',
                    confirmButtonColor: '#3085d6'
                });
            } finally {
                setCargandoCatalogos(false);
            }
        };
        cargarCatalogos();
    }, []);

    return { pacientes, odontologos, cargandoCatalogos };
}