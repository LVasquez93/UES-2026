import { useState, useEffect } from 'react';
import { Table, Button, Spinner, Alert } from 'react-bootstrap';
import { obtenerCitas } from '../services/citaService';

export default function CitasLista({ onEditarSeleccionado }) {
    const [citas, setCitas] = useState([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const datos = await obtenerCitas();
                setCitas(datos);
            } catch (error) {
                console.error("Error", error);
            } finally {
                setCargando(false);
            }
        };
        cargarDatos();
    }, []);

    const manejarCancelar = async (id) => {
        const motivo = prompt("Ingrese el motivo de la cancelación:");
        if (motivo) {
            try {
                await cancelarCitaAPI(id, motivo);
                alert("Cita cancelada");
                // Aquí llamamos a la función que recarga la lista
                cargarDatos();
            } catch (e) {
                alert("No se pudo cancelar");
            }
        }
    };

    if (cargando) {
        return <Spinner animation="border" variant="primary" />;
    }

    if (citas.length === 0) {
        return <Alert variant="info">No hay citas programadas para hoy.</Alert>;
    }

    return (
        <>
            <h4 className="mb-3">Agenda Odontológica</h4>
            {/* Table de Bootstrap: rayada, con bordes y efecto hover */}
            <Table striped bordered hover responsive size="sm">
                <thead className="table-dark">
                    <tr>
                        <th>Fecha</th>
                        <th>Inicio</th>
                        <th>Fin</th>
                        <th>Paciente</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {citas.map((cita) => (
                        <tr key={cita.idCitas}>
                            <td>{cita.fechaCita}</td>
                            <td>{new Date(cita.horaInicioCita).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                            <td>{new Date(cita.horaFinCita).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                            <td>{cita.nombreCompletoPaciente}</td>
                            <td>
                                {/* Un pequeño detalle visual para el estado */}
                                <span className={`badge ${cita.estadoCita === 'PROGRAMADA' ? 'bg-success' : 'bg-secondary'}`}>
                                    {cita.estadoCita}
                                </span>
                            </td>
                            <td>
                                <Button
                                    variant="danger" size="sm" className="me-2"
                                    onClick={() => manejarCancelar(cita.idCitas)} // <-- LLAMADA A LA FUNCIÓN
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    variant="warning"
                                    size="sm"
                                    onClick={() => onEditarSeleccionado(cita)} // <-- Al hacer clic, envía la cita al padre App.jsx
                                >
                                    Modificar
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </>
    );
}