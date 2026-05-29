import React, { useState } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';

const INITIAL = { fechaCita: '', horaInicioCita: '', horaFinCita: '' };

const Label = ({ children }) => (
  <label className="block text-xs font-medium text-slate-600 mb-1">{children}</label>
);

const Input = (props) => (
  <input
    {...props}
    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-white
               text-slate-800 outline-none focus:ring-2 focus:ring-primary-500
               focus:border-transparent transition-all"
  />
);

/**
 * Modal de reprogramación de cita.
 * Maneja su propio estado de fecha/hora (local al modal).
 */
const ReprogramModal = ({ cita, loading, onConfirmar, onCerrar }) => {
  const [reprogramData, setReprogramData] = useState(INITIAL);

  const handleChange = (campo, valor) =>
    setReprogramData(prev => ({ ...prev, [campo]: valor }));

  const handleClose = () => {
    setReprogramData(INITIAL);
    onCerrar();
  };

  return (
    <Modal
      isOpen={!!cita}
      onClose={handleClose}
      title="Reprogramar Cita"
      subtitle={cita ? `Paciente: ${cita.nombreCompletoPaciente}` : ''}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={() => onConfirmar(reprogramData)} loading={loading}>
            Confirmar cambio
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <Label>Nueva Fecha</Label>
          <Input
            type="date"
            value={reprogramData.fechaCita}
            onChange={e => handleChange('fechaCita', e.target.value)}
          />
        </div>
        <div>
          <Label>Nueva Hora Inicio</Label>
          <Input
            type="datetime-local"
            value={reprogramData.horaInicioCita}
            onChange={e => handleChange('horaInicioCita', e.target.value)}
          />
        </div>
        <div>
          <Label>Nueva Hora Fin</Label>
          <Input
            type="datetime-local"
            value={reprogramData.horaFinCita}
            onChange={e => handleChange('horaFinCita', e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
};

export default ReprogramModal;
