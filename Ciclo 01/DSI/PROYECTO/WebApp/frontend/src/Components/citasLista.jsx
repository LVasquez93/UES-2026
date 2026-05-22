import { Table, Button, Spinner, Alert } from 'react-bootstrap';

// Función utilitaria pura local para evitar lógica compleja en el JSX
const obtenerHoraFormateada = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default function CitasLista({ citas, cargando, onCancelar, onEditarSeleccionado }) {
    
    if (cargando) {
        return (
            <div className="text-center p-5">
                <Spinner animation="border" variant="primary" />
                <p className="text-muted mt-2">Cargando agenda médica...</p>
            </div>
        );
    }

    if (citas.length === 0) {
        return <Alert variant="info" className="my-3">No hay citas programadas en el sistema.</Alert>;
    }

    return (
        <>
            <h4 className="mb-3">Agenda Odontológica</h4>
            <Table striped bordered hover responsive size="sm" className="align-middle">
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
                            <td>{obtenerHoraFormateada(cita.horaInicioCita)}</td>
                            <td>{obtenerHoraFormateada(cita.horaFinCita)}</td>
                            <td>{cita.nombreCompletoPaciente}</td>
                            <td>
                                <span className={`badge ${
                                    cita.estadoCita === 'PROGRAMADA' ? 'bg-success' : 
                                    cita.estadoCita === 'CANCELADA' ? 'bg-danger' : 'bg-secondary'
                                }`}>
                                    {cita.estadoCita}
                                </span>
                            </td>
                            <td>
                                {cita.estadoCita !== 'CANCELADA' && (
                                    <Button
                                        variant="danger" 
                                        size="sm" 
                                        className="me-2"
                                        onClick={() => onCancelar(cita.idCitas)}
                                    >
                                        Cancelar
                                    </Button>
                                )}
                                <Button
                                    variant="warning"
                                    size="sm"
                                    onClick={() => onEditarSeleccionado(cita)}
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