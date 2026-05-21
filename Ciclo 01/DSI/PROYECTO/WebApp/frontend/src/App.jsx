import { useState } from 'react';
import { Container, Row, Col, Navbar } from 'react-bootstrap';
import CitasLista from './components/CitasLista';
import FormularioCita from './components/FormularioCita';

export default function App() {
  const [refresco, setRefresco] = useState(0);
  // Nuevo estado para guardar temporalmente la cita seleccionada para edición
  const [citaAEditar, setCitaAEditar] = useState(null);

  const handleCitaCreadaOActualizada = () => {
    setRefresco(prev => prev + 1);
    setCitaAEditar(null); // Limpiamos el modo edición
  }

  return (
    <div style={{ backgroundColor: '#f4f6f9', minHeight: '100vh' }}>
      <Navbar bg="dark" variant="dark" className="px-4">
        <Navbar.Brand>🦷 DentalCare System</Navbar.Brand>
      </Navbar>

      <Container fluid className="p-4">
        <Row>
          <Col md={4}>
            <div className="bg-white p-4 rounded shadow-sm">
              <h4>{citaAEditar ? "Modificar Cita" : "Agendar Nueva Cita"}</h4>
              <hr />
              <FormularioCita
                onCitaCreada={handleCitaCreadaOActualizada}
                citaAEditar={citaAEditar}
              />
            </div>
          </Col>

          <Col md={8}>
            <div className="bg-white p-4 rounded shadow-sm">
              <CitasLista key={refresco} onEditarSeleccionado={setCitaAEditar} />
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}