import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./views/Login";
import HomeDashboard from "./views/HomeDashboard";
import DentalDashboard from "./views/DentalDashboard";
import ScheduleAppointments from "./views/ScheduleAppointments";
import PatientManagement from "./views/PatientManagement";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import UserManagement from "./views/UserManagement";
import ActiveConsultation from "./components/ActiveConsultation";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* RUTA PÚBLICA (No lleva menú lateral) */}
        <Route path="/" element={<Login />} />
        
        {/* RUTAS PRIVADAS (Envueltas por Protección y por el Layout) */}
        <Route 
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Todas estas pantallas ahora aparecerán mágicamente dentro del <Outlet /> del Layout */}
          <Route path="/dashboard" element={<HomeDashboard />} />
          <Route path="/odontograma" element={<DentalDashboard />} />
          <Route path="/agenda" element={<ScheduleAppointments />} />
          <Route path="/pacientes" element={<PatientManagement />} />
          <Route path="/usuarios" element={<UserManagement />} />
          <Route path="/consulta" element={<ActiveConsultation />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;