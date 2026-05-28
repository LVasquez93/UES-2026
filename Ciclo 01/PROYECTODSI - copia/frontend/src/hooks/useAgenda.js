import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const API_URL = 'http://localhost:8080/api';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers de fecha/hora (puros, sin estado — exportables para tests)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Normaliza una fecha que viene del backend como array [y, m, d]
 * o como string "yyyy-MM-dd" a formato "yyyy-MM-dd".
 */
export const normalizarFecha = (fechaCita) => {
  if (!fechaCita) return '';
  if (Array.isArray(fechaCita)) {
    const [y, m, d] = fechaCita;
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }
  return fechaCita;
};

/**
 * Formatea un LocalDateTime (array o string) a "HH:MM AM/PM".
 */
export const formatHora = (hora) => {
  if (!hora) return '';
  const d = Array.isArray(hora)
    ? new Date(hora[0], hora[1] - 1, hora[2], hora[3], hora[4])
    : new Date(hora);
  return d.toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit' });
};

/**
 * Formatea una fecha "yyyy-MM-dd" para encabezados de la vista semana.
 * Ej: "lunes 26 de mayo"
 */
export const formatFechaHeader = (fechaStr) => {
  const [y, m, d] = fechaStr.split('-');
  return new Date(y, m - 1, d).toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
};

/**
 * Formatea un LocalDateTime a "yyyy-MM-ddTHH:mm" para inputs datetime-local.
 */
export const formatDT = (dt) => {
  if (!dt) return '';
  if (Array.isArray(dt)) {
    const [y, mo, d, h, min] = dt;
    return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}T${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
  }
  return dt.substring(0, 16);
};

/**
 * Devuelve la clase CSS del badge de estado de una cita.
 */
export const getStatusClass = (estado) => {
  const map = {
    PROGRAMADA:   'pendiente',
    PENDIENTE:    'pendiente',
    EN_PROGRESO:  'confirmada',
    COMPLETADA:   'confirmada',
    REPROGRAMADA: 'pendiente',
    NO_ASISTIO:   'cancel',
    CANCELADA:    'cancel',
    OTRO:         'pendiente',
  };
  return map[estado] || '';
};

// ─────────────────────────────────────────────────────────────────────────────
// Hook principal
// ─────────────────────────────────────────────────────────────────────────────

const FORM_INICIAL = {
  idPaciente:     '',
  idOdontologo:   '',
  fechaCita:      '',
  horaInicioCita: '',
  horaFinCita:    '',
  estadoCita:     'PROGRAMADA',
};

/**
 * Gestiona el estado y las operaciones CRUD de la pantalla de agenda.
 *
 * @param {Date} date - Fecha seleccionada en el calendario (controlada por el componente).
 */
export const useAgenda = (date) => {
  const [appointments, setAppointments] = useState([]);
  const [pacientes,    setPacientes]    = useState([]);
  const [odontologos,  setOdontologos]  = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [selectedCita, setSelectedCita] = useState(null);
  const [isEditing,    setIsEditing]    = useState(false);
  const [formData,     setFormData]     = useState(FORM_INICIAL);

  // ── Carga inicial ──────────────────────────────────────────────────────────
  useEffect(() => {
    fetchCitas();
    fetchPacientes();
    fetchOdontologos();
  }, []);

  // ── Fetchers ───────────────────────────────────────────────────────────────
  const fetchCitas = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/citas`);
      if (!res.ok) throw new Error('Error al cargar citas.');
      setAppointments(await res.json());
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#0d6efd' });
    } finally {
      setLoading(false);
    }
  };

  const fetchPacientes = async () => {
    try {
      const res = await fetch(`${API_URL}/pacientes`);
      if (!res.ok) throw new Error('Error al cargar pacientes.');
      setPacientes(await res.json());
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#0d6efd' });
    }
  };

  const fetchOdontologos = async () => {
    try {
      const res = await fetch(`${API_URL}/odontologos`);
      if (!res.ok) throw new Error('Error al cargar odontólogos.');
      setOdontologos(await res.json());
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#0d6efd' });
    }
  };

  // ── Datos derivados ────────────────────────────────────────────────────────

  /** Citas del día seleccionado en el calendario. */
  const citasDelDia = appointments.filter(app => {
    const fechaCita = normalizarFecha(app.fechaCita);
    return fechaCita === date.toISOString().split('T')[0];
  });

  /** Todas las citas agrupadas por fecha { "yyyy-MM-dd": [cita, ...] }. */
  const citasPorFecha = appointments.reduce((grupos, app) => {
    const key = normalizarFecha(app.fechaCita);
    if (!key) return grupos;
    if (!grupos[key]) grupos[key] = [];
    grupos[key].push(app);
    return grupos;
  }, {});

  // ── Preparar formulario ────────────────────────────────────────────────────

  const prepararNuevaCita = () => {
    setIsEditing(false);
    setSelectedCita(null);
    setFormData({
      ...FORM_INICIAL,
      fechaCita: date.toISOString().split('T')[0],
    });
  };

  const prepararEditarCita = (cita) => {
    setIsEditing(true);
    setSelectedCita(cita);
    setFormData({
      idPaciente:     cita.idPaciente    || '',
      idOdontologo:   cita.idOdontologo  || '',
      fechaCita:      normalizarFecha(cita.fechaCita),
      horaInicioCita: formatDT(cita.horaInicioCita),
      horaFinCita:    formatDT(cita.horaFinCita),
      estadoCita:     cita.estadoCita    || 'PROGRAMADA',
    });
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ── CRUD ───────────────────────────────────────────────────────────────────

  const handleCrear = async (onSuccess) => {
    setLoading(true);
    try {
      const payload = {
        ...formData,
        idPaciente:   parseInt(formData.idPaciente),
        idOdontologo: parseInt(formData.idOdontologo),
      };
      const res = await fetch(`${API_URL}/citas`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al registrar la cita.');
      Swal.fire({ icon: 'success', title: 'Cita registrada', text: `Cita para ${data.nombreCompletoPaciente} registrada correctamente.`, confirmButtonColor: '#0d6efd' });
      fetchCitas();
      onSuccess?.();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#0d6efd' });
    } finally {
      setLoading(false);
    }
  };

  const handleActualizar = async (onSuccess) => {
    setLoading(true);
    try {
      const payload = {
        ...formData,
        idPaciente:   parseInt(formData.idPaciente),
        idOdontologo: parseInt(formData.idOdontologo),
      };
      const res = await fetch(`${API_URL}/citas/${selectedCita.idCitas}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al actualizar la cita.');
      Swal.fire({ icon: 'success', title: 'Cita actualizada', text: 'Los cambios fueron guardados correctamente.', confirmButtonColor: '#0d6efd' });
      fetchCitas();
      onSuccess?.();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#0d6efd' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = async (cita) => {
    const { value: motivo, isConfirmed } = await Swal.fire({
      title:             'Cancelar cita',
      text:              `Cita de ${cita.nombreCompletoPaciente}`,
      input:             'textarea',
      inputLabel:        'Motivo de cancelación',
      inputPlaceholder:  'Escriba el motivo...',
      showCancelButton:  true,
      confirmButtonText: 'Confirmar cancelación',
      cancelButtonText:  'Volver',
      confirmButtonColor: '#dc3545',
      cancelButtonColor:  '#6c757d',
      inputValidator: (v) => { if (!v) return 'El motivo es obligatorio.'; },
    });
    if (!isConfirmed) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/citas/${cita.idCitas}/cancelar`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ motivoCancelacion: motivo }),
      });
      if (!res.ok) throw new Error('Error al cancelar la cita.');
      Swal.fire({ icon: 'success', title: 'Cita cancelada', text: 'La cita fue cancelada correctamente.', confirmButtonColor: '#0d6efd' });
      fetchCitas();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#0d6efd' });
    } finally {
      setLoading(false);
    }
  };

  const handleReprogramar = async (idCita, reprogramData, onSuccess) => {
    if (!reprogramData.fechaCita || !reprogramData.horaInicioCita || !reprogramData.horaFinCita) {
      Swal.fire({ icon: 'warning', title: 'Campos incompletos', text: 'Completa fecha, hora inicio y hora fin.', confirmButtonColor: '#0d6efd' });
      return;
    }
    setLoading(true);
    try {
      const payload = {
        idPaciente:     selectedCita.idPaciente,
        idOdontologo:   selectedCita.idOdontologo,
        estadoCita:     'PROGRAMADA',
        ...reprogramData,
      };
      const res = await fetch(`${API_URL}/citas/${idCita}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Error al reprogramar la cita.');
      Swal.fire({ icon: 'success', title: 'Cita reprogramada', text: 'La cita fue reprogramada correctamente.', confirmButtonColor: '#0d6efd' });
      fetchCitas();
      onSuccess?.();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#0d6efd' });
    } finally {
      setLoading(false);
    }
  };

  /** Decide si crear o actualizar según el modo del formulario. */
  const handleSubmit = (onSuccess) => {
    if (isEditing) handleActualizar(onSuccess);
    else handleCrear(onSuccess);
  };

  return {
    // Estado
    appointments, loading,
    pacientes, odontologos,
    selectedCita, setSelectedCita,
    isEditing,
    formData,
    // Datos derivados
    citasDelDia,
    citasPorFecha,
    // Acciones
    handleChange,
    prepararNuevaCita,
    prepararEditarCita,
    handleCancelar,
    handleReprogramar,
    handleSubmit,
  };
};
