import React from 'react';

const ESTADOS_CITA = [
  { value: 'PROGRAMADA',   label: 'Programada' },
  { value: 'PENDIENTE',    label: 'Pendiente' },
  { value: 'EN_PROGRESO',  label: 'En Progreso' },
  { value: 'COMPLETADA',   label: 'Completada' },
  { value: 'REPROGRAMADA', label: 'Reprogramada' },
  { value: 'NO_ASISTIO',   label: 'No Asistió' },
  { value: 'CANCELADA',    label: 'Cancelada' },
  { value: 'OTRO',         label: 'Otro' },
];

/**
 * Formulario para crear o editar una cita.
 * No contiene lógica de fetch; recibe todo por props desde useAgenda.
 *
 * Props:
 *   isEditing   - boolean: modo edición o creación
 *   date        - Date seleccionada (para el título del formulario)
 *   formData    - estado del formulario { idPaciente, idOdontologo, ... }
 *   pacientes   - listado de pacientes para el select
 *   odontologos - listado de odontólogos para el select
 *   loading     - boolean: deshabilita el botón mientras guarda
 *   onChange    - handler genérico de inputs (e) => void
 *   onSubmit    - llama handleCrear o handleActualizar según modo
 *   onCancelar  - cierra el formulario sin guardar
 */
const AppointmentForm = ({
  isEditing,
  date,
  formData,
  pacientes,
  odontologos,
  loading,
  onChange,
  onSubmit,
  onCancelar,
}) => {
  return (
    <div className="appointment-form-card">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="fw-bold m-0">
          {isEditing ? 'Editar Cita' : `Nueva Cita: ${date.toLocaleDateString()}`}
        </h5>
        <button className="btn btn-sm btn-outline-secondary" onClick={onCancelar}>
          <i className="bi bi-arrow-left" /> Volver
        </button>
      </div>

      <div className="row g-3">

        {/* Paciente */}
        <div className="col-12">
          <label className="form-label-custom">Paciente</label>
          <select
            name="idPaciente"
            className="form-control-custom"
            value={formData.idPaciente}
            onChange={onChange}
          >
            <option value="">Seleccione un paciente...</option>
            {pacientes.map(p => (
              <option key={p.idPaciente} value={p.idPaciente}>
                {p.nombrePaciente} {p.apellidoPaciente} — {p.numeroIdentidadPaciente}
              </option>
            ))}
          </select>
        </div>

        {/* Odontólogo */}
        <div className="col-12">
          <label className="form-label-custom">Odontólogo</label>
          <select
            name="idOdontologo"
            className="form-control-custom"
            value={formData.idOdontologo}
            onChange={onChange}
          >
            <option value="">Seleccione un odontólogo...</option>
            {odontologos.map(o => (
              <option key={o.idOdontologo} value={o.idOdontologo}>
                {o.especialidadOdontologo} — JVPO: {o.jvpoId}
              </option>
            ))}
          </select>
        </div>

        {/* Fecha */}
        <div className="col-12">
          <label className="form-label-custom">Fecha</label>
          <input
            type="date"
            name="fechaCita"
            className="form-control-custom"
            value={formData.fechaCita}
            onChange={onChange}
          />
        </div>

        {/* Hora Inicio */}
        <div className="col-md-6">
          <label className="form-label-custom">Hora Inicio</label>
          <input
            type="datetime-local"
            name="horaInicioCita"
            className="form-control-custom"
            value={formData.horaInicioCita}
            onChange={onChange}
          />
        </div>

        {/* Hora Fin */}
        <div className="col-md-6">
          <label className="form-label-custom">Hora Fin</label>
          <input
            type="datetime-local"
            name="horaFinCita"
            className="form-control-custom"
            value={formData.horaFinCita}
            onChange={onChange}
          />
        </div>

        {/* Estado (solo visible al editar) */}
        {isEditing && (
          <div className="col-12">
            <label className="form-label-custom">Estado</label>
            <select
              name="estadoCita"
              className="form-control-custom"
              value={formData.estadoCita}
              onChange={onChange}
            >
              {ESTADOS_CITA.map(e => (
                <option key={e.value} value={e.value}>{e.label}</option>
              ))}
            </select>
          </div>
        )}

        {/* Acciones */}
        <div className="col-12 mt-4 d-flex gap-2">
          <button type="button" className="btn-cancel w-100" onClick={onCancelar} disabled={loading}>
            Cancelar
          </button>
          <button type="button" className="btn-register w-100" onClick={onSubmit} disabled={loading}>
            {loading ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Confirmar Cita'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentForm;
