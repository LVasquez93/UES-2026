import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./views/Login";
import HomeDashboard from "./views/HomeDashboard";
import DentalDashboard from "./views/DentalDashboard";
import ScheduleAppointments from "./views/ScheduleAppointments";
import PatientManagement from "./views/PatientManagement";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import UserManagement from "./views/UserManagement";
import ConsultaIndex from "./views/ConsultaIndex";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta publica: no requiere autenticacion */}
        <Route path="/" element={<Login />} />

        {/* Rutas privadas: requieren token valido y renderizan dentro del Layout */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard"   element={<HomeDashboard />} />
          {/* <Route path="/odontograma" element={<DentalDashboard />} /> */}
          <Route path="/agenda"      element={<ScheduleAppointments />} />
          <Route path="/pacientes"   element={<PatientManagement />} />
          <Route path="/usuarios"    element={<UserManagement />} />

          {/* Lista de citas del dia: punto de entrada al modulo de consulta */}
          <Route path="/consulta" element={<ConsultaIndex />} />

          {/* Consulta activa: recibe el ID de la cita como parametro de URL
              No se puede navegar aqui sin un citaId valido */}
          <Route path="/consulta/:citaId" element={<DentalDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;