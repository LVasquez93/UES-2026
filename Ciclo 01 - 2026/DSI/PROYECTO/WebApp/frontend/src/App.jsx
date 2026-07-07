import { useState } from 'react';
import { Container, Row, Col, Navbar } from 'react-bootstrap';
import CitasLista from './components/CitasLista';
import { useCitas } from './hooks/useCitas';

export default function App() {
  const [citaAEditar, setCitaAEditar] = useState(null);

  // Consumimos el estado y funciones globales de nuestro custom hook
  const {
    citas,
    cargando,
    agendarNuevaCita,
    modificarCita,
    cancelarCita
  } = useCitas();

  const handleCitaGuardada = () => {
    setCitaAEditar(null); // Desactivar modo edición de manera limpia
  };

  return (
    <div style={{ backgroundColor: '#f4f6f9', minHeight: '100vh' }}>
      <Navbar bg="dark" variant="dark" className="px-4">
        <Navbar.Brand href="/"> 🦷 DentalCare System</Navbar.Brand>
      </Navbar>

      <Container fluid className="p-4">
        <Row>
          {/* <Col md={4}> */}
            {/* <div className="bg-white p-4 rounded shadow-sm">
              <h4>{citaAEditar ? "Modificar Cita" : "Agendar Nueva Cita"}</h4>
              <hr />
              <FormularioCita
                citaAEditar={citaAEditar}
                onCitaGuardada={handleCitaGuardada}
                agendarNuevaCita={agendarNuevaCita}
                modificarCita={modificarCita}
              />
            </div> */}
          {/* </Col> */}

          <Col md={12}>
            <div className="bg-white p-4 rounded shadow-sm">
              <CitasLista
                citas={citas}
                cargando={cargando}
                onCancelar={cancelarCita}
                onEditarSeleccionado={setCitaAEditar}
              />
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}