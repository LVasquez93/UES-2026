import React, { useState } from 'react';
import { Odontogram } from 'react-odontogram';
import 'react-odontogram/style.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../estilos/DentalDashboard.css';

/** Esta Pantalla se muestra cuando el odontologo hace click en "Iniciar Consulta"
 *  desde el Dashboard, es el espacio de trabajo principal durante la consulta, 
 * donde se muestra un banner con el estado de la consulta (en curso, finalizada, etc) 
 * y un indicador de pasos (revisión, tratamiento, diagnóstico). El odontologo puede 
 * ir avanzando por cada paso y registrar los hallazgos en un textarea o directamente
 *  en el odontograma. Al finalizar la consulta se muestra una pantalla de resumen con
 *  la opción de imprimir una receta o volver al dashboard.*/

const DentalDashboard = () => {
  const [activeTab, setActiveTab] = useState('historial');
  const [selectedTeeth, setSelectedTeeth] = useState([]);
  const [activeFilter, setActiveFilter] = useState('Hallazgos');

  // Sincroniza los dientes seleccionados con el input de la derecha
  const handleOdontogramChange = (teeth) => {
    setSelectedTeeth(teeth);
  };

  const piecesText = selectedTeeth.map(t => t.notations.fdi).join(', ');

  // Leemos los datos del usuario que guardo Login.jsx en localStorage al autenticarse
  const userName     = localStorage.getItem('userName')  || 'Usuario';
  const userRole     = localStorage.getItem('userRole')  || '';
  // Generamos las iniciales a partir del nombre completo (ej. "Juan Perez" -> "JP")
  
  return (
    <div className="d-flex flex-column h-100 p-4" style={{ backgroundColor: 'var(--bg-app)' }}>

      {/* 1. HEADER DEL PACIENTE (Estilo fiel a la imagen original) */}
      <div className="d-flex align-items-center pb-3 mb-4 w-100" style={{ borderBottom: '1px solid var(--border-color)' }}>

        {/* Título integrado al fondo */}
        <span className="text-muted fw-semibold me-4" style={{ fontSize: '1.05rem' }}>
          Datos del paciente
        </span>

        {/* "Chip" del paciente estilo SaaS (Píldora blanca flotante) */}
        <div className="d-flex align-items-center bg-white border rounded-pill px-2 py-1 shadow-sm" style={{ gap: '12px' }}>
          <img
            src="https://i.pravatar.cc/150?img=47"
            alt="María Fernanda"
            className="rounded-circle object-fit-cover"
            style={{ width: '40px', height: '40px' }}
          />
          <div className="d-flex flex-column justify-content-center pe-3">
            <span className="fw-bold text-dark lh-1 mb-1" style={{ fontSize: '0.9rem' }}>María Fernanda L. G.</span>
            <span className="text-muted lh-1" style={{ fontSize: '0.75rem' }}>Telf: 000 000 000</span>
          </div>
        </div>

      </div>

      {/* 2. TABS DE NAVEGACIÓN */}
      <nav className="body-tabs mb-3">
        <button
          className={activeTab === 'historial' ? 'active' : ''}
          onClick={() => setActiveTab('historial')}
        >
          Historial bucodental
        </button>
        <button
          className={activeTab === 'planes' ? 'active' : ''}
          onClick={() => setActiveTab('planes')}
        >
          Planes de tratamiento
        </button>
      </nav>

      {/* 3. ÁREA DE TRABAJO (Odontograma y Formulario) */}
      <div className="workspace-card" style={{ flexGrow: 1, overflow: 'hidden' }}>

        {/* COLUMNA IZQUIERDA: ODONTOGRAMA */}
        <div className="odontogram-section">
          <div className="filters-bar">
            <i className="bi bi-funnel text-muted"></i>
            <span className="small text-muted">Filtros:</span>
            {['Hallazgos', 'Presupuestado', 'Programado', 'Realizado'].map(f => (
              <button
                key={f}
                className={`filter-pill ${activeFilter === f ? 'active' : ''}`}
                onClick={() => setActiveFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="odontogram-container">
            <Odontogram
              onChange={handleOdontogramChange}
              theme="light"
              notation="FDI"
              className="custom-odontogram"
            />
          </div>
          <p className="text-center text-muted small mt-3">
            Selecciona las piezas en el gráfico para registrar un hallazgo
          </p>
        </div>

        {/* COLUMNA DERECHA: PANEL DE CONTROL */}
        <aside className="control-panel">
          <div className="row g-3 mb-4">
            <div className="col-8">
              <label className="form-label-custom">Indica la pieza</label>
              <input
                type="text"
                className="form-control-custom"
                value={piecesText}
                placeholder="Ej: 11, 21"
                readOnly
              />
            </div>
            <div className="col-4 text-center">
              <label className="form-label-custom">Cara</label>
              <div className="cara-selector">
                <i className="bi bi-record-circle-fill"></i>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label-custom">Elige un tratamiento</label>
            <div className="treatment-dropdown">
              <div className="dropdown-header">
                Aparatos Dentales <i className="bi bi-chevron-up"></i>
              </div>
              <div className="dropdown-content">
                <div className="item">Ortodoncia invisible</div>
                <div className="item active">Puente dental</div>
                <div className="item">Retirada de brackets</div>
              </div>
            </div>
          </div>

          <button className="btn-register" disabled={selectedTeeth.length === 0}>
            Registrar Hallazgo
          </button>
        </aside>

      </div>
    </div>
  );
};

export default DentalDashboard; 