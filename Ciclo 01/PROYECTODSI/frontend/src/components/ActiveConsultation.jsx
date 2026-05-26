import React, { useState } from 'react';
import { Odontogram } from 'react-odontogram';
import '../estilos/DentalDashboard.css';

const ActiveConsultation = () => {
  const [step, setStep] = useState(1); // 1: Revisión, 2: Odontograma, 3: Cierre
  const [notas, setNotas] = useState('');

  return (
    <div className="d-flex flex-column h-100 p-4" style={{ backgroundColor: '#f8fafc' }}>
      
      {/* BANNER DE ESTADO DE CONSULTA */}
      <div className="d-flex justify-content-between align-items-center p-3 mb-4 bg-white border rounded-4 shadow-sm">
        <div className="d-flex align-items-center gap-3">
          <div className={`status-dot ${step === 2 ? 'bg-success' : 'bg-warning'}`} style={{width: '12px', height: '12px', borderRadius: '50%'}}></div>
          <h5 className="mb-0 fw-bold">Consulta en curso: María Fernanda</h5>
        </div>
        <div className="steps-indicator d-flex gap-2">
          <span className={`badge ${step >= 1 ? 'bg-primary' : 'bg-light text-dark'}`}>1. Revisión</span>
          <span className={`badge ${step >= 2 ? 'bg-primary' : 'bg-light text-dark'}`}>2. Tratamiento</span>
          <span className={`badge ${step >= 3 ? 'bg-primary' : 'bg-light text-dark'}`}>3. Diagnóstico</span>
        </div>
      </div>

      <div className="workspace-card bg-white rounded-4 border shadow-sm p-4 flex-grow-1">
        {step === 1 && (
          <div className="review-step animate__animated animate__fadeIn">
            <h4 className="fw-bold mb-4">Verificación de Datos</h4>
            <div className="row g-4">
              <div className="col-md-6">
                <div className="p-3 border rounded-3 bg-light">
                  <h6 className="fw-bold text-danger"><i className="bi bi-exclamation-triangle me-2"></i>Alergias y Alertas</h6>
                  <p className="mb-0">El paciente reporta alergia a la Penicilina.</p>
                </div>
              </div>
              <div className="col-md-6">
                <div className="p-3 border rounded-3">
                  <h6 className="fw-bold text-primary">Último Diagnóstico</h6>
                  <p className="mb-0 text-muted">Limpieza general realizada el 15/04.</p>
                </div>
              </div>
            </div>
            <button className="btn btn-primary mt-5 px-5 py-3 fw-bold" onClick={() => setStep(2)}>
              Iniciar Intervención Clínica
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="row h-100 animate__animated animate__fadeIn">
            <div className="col-lg-8 border-end">
              <h5 className="fw-bold mb-4">Registro en Odontograma</h5>
              <div className="odontogram-container">
                <Odontogram theme="light" notation="FDI" />
              </div>
            </div>
            <div className="col-lg-4 ps-4 d-flex flex-column">
              <h5 className="fw-bold mb-4">Hallazgos Rápidos</h5>
              <textarea 
                className="form-control-custom flex-grow-1 mb-3" 
                placeholder="Escribe notas clínicas aquí..."
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
              ></textarea>
              <button className="btn btn-success py-3 fw-bold" onClick={() => setStep(3)}>
                Finalizar Tratamiento
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center py-5 animate__animated animate__fadeIn">
            <i className="bi bi-check-circle-fill text-success" style={{fontSize: '5rem'}}></i>
            <h2 className="fw-bold mt-4">Consulta Finalizada</h2>
            <p className="text-muted">El diagnóstico y los hallazgos han sido guardados en el expediente.</p>
            <div className="d-flex justify-content-center gap-3 mt-4">
              <button className="btn btn-outline-primary px-4" onClick={() => window.print()}>Imprimir Receta</button>
              <button className="btn btn-primary px-4" onClick={() => setStep(1)}>Volver al Dashboard</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveConsultation;