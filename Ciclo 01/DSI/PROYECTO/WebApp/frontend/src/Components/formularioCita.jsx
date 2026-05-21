import { useState, useEffect } from 'react';
import { Form, Button, Row, Col, InputGroup } from 'react-bootstrap';
import { obtenerPacientes, obtenerOdontologos, crearCita } from '../services/citaService';
// NOTA: Asegúrate de importar también actualizarCitaAPI si la vas a usar en el handleSubmit
// import { actualizarCitaAPI } from '../services/citaService';

// CORRECCIÓN 1: Recibir citaAEditar
export default function FormularioCita({ onCitaCreada, citaAEditar }) {
    const [pacientes, setPacientes] = useState([]);
    const [odontologos, setOdontologos] = useState([]);

    const [formData, setFormData] = useState({
        idPaciente: '',
        idOdontologo: '',
        fechaCita: '',
        horaInicioCita: '',
        horaFinCita: '',
        estadoCita: 'PROGRAMADA'
    });

    useEffect(() => {
        const cargarCatalogos = async () => {
            try {
                const p = await obtenerPacientes();
                const o = await obtenerOdontologos();
                setPacientes(p);
                setOdontologos(o);
            } catch (e) {
                console.error("Error cargando catálogos", e);
            }
        };
        cargarCatalogos();
    }, []);

    useEffect(() => {
        if (citaAEditar) {
            const horaInicio = citaAEditar.horaInicioCita.split('T')[1].substring(0, 5);
            const horaFin = citaAEditar.horaFinCita.split('T')[1].substring(0, 5);

            setFormData({
                idPaciente: citaAEditar.idPaciente,
                idOdontologo: citaAEditar.idOdontologo,
                fechaCita: citaAEditar.fechaCita,
                horaInicioCita: horaInicio,
                horaFinCita: horaFin,
                estadoCita: citaAEditar.estadoCita
            });
        } else {
            setFormData({ idPaciente: '', idOdontologo: '', fechaCita: '', horaInicioCita: '', horaFinCita: '', estadoCita: 'PROGRAMADA' });
        }
    }, [citaAEditar]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const request = {
                ...formData,
                horaInicioCita: `${formData.fechaCita}T${formData.horaInicioCita}:00`,
                horaFinCita: `${formData.fechaCita}T${formData.horaFinCita}:00`
            };

            if (citaAEditar) {
                // await actualizarCitaAPI(citaAEditar.idCitas, request);
                alert("Cita modificada con éxito (Descomenta la API para que funcione)");
            } else {
                await crearCita(request);
                alert("Cita agendada con éxito");
            }
            onCitaCreada();
        } catch (err) { alert("Error al procesar la operación"); }
    };

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
                        {pacientes.map(p => <option key={p.idPaciente} value={p.idPaciente}>{p.nombrePaciente} {p.apellidoPaciente}</option>)}
                    </Form.Select>
                    <Button variant="outline-primary" onClick={() => alert("Aquí abriríamos el Modal de nuevo paciente")}>
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
                    value={formData.fechaCita} // CORRECCIÓN 2: Atributo value
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
                            value={formData.horaInicioCita} // CORRECCIÓN 2: Atributo value
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
                            value={formData.horaFinCita} // CORRECCIÓN 2: Atributo value
                            onChange={(e) => setFormData({ ...formData, horaFinCita: e.target.value })}
                        />
                    </Form.Group>
                </Col>
            </Row>

            {/* CORRECCIÓN 3: Eliminado el botón duplicado */}
            <Button variant={citaAEditar ? "warning" : "primary"} type="submit" className="w-100 mt-3">
                {citaAEditar ? "Guardar Cambios" : "Agendar Cita"}
            </Button>
        </Form>
    );
}