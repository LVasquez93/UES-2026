import { useState, useEffect } from 'react';
import { Form, Button, Row, Col, InputGroup, Spinner } from 'react-bootstrap';
import { useCatalogos } from '../hooks/useCatalogos';

export default function FormularioCita({ citaAEditar, onCitaGuardada, agendarNuevaCita, modificarCita }) {
    const { pacientes, odontologos, cargandoCatalogos } = useCatalogos();

    const [formData, setFormData] = useState({
        idPaciente: '',
        idOdontologo: '',
        fechaCita: '',
        horaInicioCita: '',
        horaFinCita: '',
        estadoCita: 'PROGRAMADA'
    });

    // Sincronización limpia con el modo edición
    useEffect(() => {
        if (citaAEditar) {
            const horaInicio = citaAEditar.horaInicioCita.split('T')[1]?.substring(0, 5) || '';
            const horaFin = citaAEditar.horaFinCita.split('T')[1]?.substring(0, 5) || '';

            setFormData({
                idPaciente: citaAEditar.idPaciente,
                idOdontologo: citaAEditar.idOdontologo,
                fechaCita: citaAEditar.fechaCita,
                horaInicioCita: horaInicio,
                horaFinCita: horaFin,
                estadoCita: citaAEditar.estadoCita
            });
        } else {
            setFormData({ 
                idPaciente: '', 
                idOdontologo: '', 
                fechaCita: '', 
                horaInicioCita: '', 
                horaFinCita: '', 
                estadoCita: 'PROGRAMADA' 
            });
        }
    }, [citaAEditar]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        let exito = false;

        if (citaAEditar) {
            exito = await modificarCita(citaAEditar.idCitas, formData);
        } else {
            exito = await agendarNuevaCita(formData);
        }

        if (exito) {
            onCitaGuardada(); // Notificar al padre para limpiar estados
        }
    };

    if (cargandoCatalogos) {
        return (
            <div className="text-center p-4">
                <Spinner animation="border" size="sm" variant="primary" />
                <span className="ms-2 text-muted">Cargando doctores y pacientes...</span>
            </div>
        );
    }

    return (
        <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
                <Form.Label>Paciente</Form.Label>
                <InputGroup>
                    <Form.Select
                        required
                        value={formData.idPaciente}
                        onChange={(e) => setFormData({ ...formData, idPaciente: e.target.value })}
                    >
                        <option value="">Seleccione un paciente...</option>
                        {pacientes.map(p => (
                            <option key={p.idPaciente} value={p.idPaciente}>
                                {p.nombrePaciente} {p.apellidoPaciente}
                            </option>
                        ))}
                    </Form.Select>
                    <Button variant="outline-primary" onClick={() => alert("Abrir modal de nuevo paciente")}>
                        +
                    </Button>
                </InputGroup>
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Odontólogo</Form.Label>
                <Form.Select
                    required
                    value={formData.idOdontologo}
                    onChange={(e) => setFormData({ ...formData, idOdontologo: e.target.value })}
                >
                    <option value="">Seleccione un doctor...</option>
                    {odontologos.map(o => (
                        <option key={o.idOdontologo} value={o.idOdontologo}>
                            Dr/a. {o.nombreCompleto} - {o.especialidadOdontologo}
                        </option>
                    ))}
                </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Fecha</Form.Label>
                <Form.Control
                    type="date"
                    required
                    value={formData.fechaCita}
                    onChange={(e) => setFormData({ ...formData, fechaCita: e.target.value })}
                />
            </Form.Group>

            <Row>
                <Col>
                    <Form.Group className="mb-3">
                        <Form.Label>Hora Inicio</Form.Label>
                        <Form.Control
                            type="time"
                            required
                            value={formData.horaInicioCita}
                            onChange={(e) => setFormData({ ...formData, horaInicioCita: e.target.value })}
                        />
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group className="mb-3">
                        <Form.Label>Hora Fin</Form.Label>
                        <Form.Control
                            type="time"
                            required
                            value={formData.horaFinCita}
                            onChange={(e) => setFormData({ ...formData, horaFinCita: e.target.value })}
                        />
                    </Form.Group>
                </Col>
            </Row>

            <Button variant={citaAEditar ? "warning" : "primary"} type="submit" className="w-100 mt-3">
                {citaAEditar ? "Guardar Cambios" : "Agendar Cita"}
            </Button>
        </Form>
    );
}