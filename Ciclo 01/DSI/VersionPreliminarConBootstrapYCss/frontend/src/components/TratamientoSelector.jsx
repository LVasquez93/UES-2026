import React, { useState, useRef, useEffect } from 'react';

const API_URL = 'http://localhost:8080/api';

/**
 * Componente selector de tratamientos con búsqueda en tiempo real
 * y formulario inline para crear uno nuevo si no existe en el catálogo.
 *
 * Props:
 *   tratamientos        - lista de tratamientos del catálogo
 *   selectedId          - id del tratamiento actualmente seleccionado
 *   onSelect            - callback cuando el usuario selecciona un tratamiento (id: string)
 *   onTratamientoCreado - callback cuando se crea uno nuevo (tratamiento: object)
 */
const TratamientoSelector = ({ tratamientos, onSelect, onTratamientoCreado, selectedId }) => {
  const [open, setOpen]         = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [nuevoTratamiento, setNuevoTratamiento] = useState({
    nombreTratamiento:      '',
    descripcionTratamiento: '',
    costoTratamiento:       '',
  });

  const ref = useRef(null);

  // Cierra el dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setShowForm(false);
        setBusqueda('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtra la lista según el texto de búsqueda (case-insensitive)
  const filtrados = tratamientos.filter(t =>
    t.nombreTratamiento.toLowerCase().includes(busqueda.toLowerCase()) ||
    t.descripcionTratamiento?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const seleccionado = tratamientos.find(t => t.idTratamiento === parseInt(selectedId));

  // Crea un nuevo tratamiento y notifica al padre para que recargue la lista
  const handleCrear = async () => {
    if (!nuevoTratamiento.nombreTratamiento || !nuevoTratamiento.costoTratamiento) {
      alert('Nombre y costo son obligatorios.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/consulta/tratamientos`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          ...nuevoTratamiento,
          costoTratamiento:       parseFloat(nuevoTratamiento.costoTratamiento),
          descripcionTratamiento: nuevoTratamiento.descripcionTratamiento || nuevoTratamiento.nombreTratamiento,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al crear tratamiento.');
      onTratamientoCreado(data);
      onSelect(String(data.idTratamiento));
      setNuevoTratamiento({ nombreTratamiento: '', descripcionTratamiento: '', costoTratamiento: '' });
      setShowForm(false);
      setOpen(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>

      {/* Botón que abre el dropdown */}
      <div
        className="treatment-dropdown"
        onClick={() => { setOpen(prev => !prev); setShowForm(false); }}
        style={{ cursor: 'pointer' }}
      >
        <div className="dropdown-header">
          <span>{seleccionado ? seleccionado.nombreTratamiento : 'Seleccione un tratamiento'}</span>
          <i className={`bi bi-chevron-${open ? 'up' : 'down'}`} />
        </div>
      </div>

      {/* Panel desplegable */}
      {open && (
        <div style={{
          position:        'absolute',
          top:             'calc(100% + 4px)',
          left: 0, right:  0,
          backgroundColor: '#fff',
          border:          '1px solid var(--border-color)',
          borderRadius:    '12px',
          boxShadow:       '0 8px 24px rgba(0,0,0,0.12)',
          zIndex:          600,
          overflow:        'hidden',
        }}>

          {/* Buscador */}
          <div style={{ padding: '10px', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px',
                          background: '#f8fafc', borderRadius: '8px', padding: '8px 12px' }}>
              <i className="bi bi-search text-muted" style={{ fontSize: '0.85rem' }} />
              <input
                type="text"
                placeholder="Buscar tratamiento..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                onClick={e => e.stopPropagation()}
                style={{ border: 'none', background: 'transparent', outline: 'none',
                         width: '100%', fontSize: '0.85rem' }}
                autoFocus
              />
            </div>
          </div>

          {/* Lista filtrada */}
          <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
            {filtrados.length === 0 && (
              <p className="text-muted small text-center py-3 mb-0">
                No se encontró "{busqueda}"
              </p>
            )}
            {filtrados.map(t => (
              <div
                key={t.idTratamiento}
                onClick={() => { onSelect(String(t.idTratamiento)); setOpen(false); setBusqueda(''); }}
                style={{
                  padding:    '12px 16px',
                  cursor:     'pointer',
                  background: selectedId === String(t.idTratamiento) ? '#eef2ff' : 'transparent',
                  borderLeft: selectedId === String(t.idTratamiento) ? '3px solid var(--primary-color)' : '3px solid transparent',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { if (selectedId !== String(t.idTratamiento)) e.currentTarget.style.background = '#f8fafc'; }}
                onMouseLeave={e => { if (selectedId !== String(t.idTratamiento)) e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-main)' }}>
                  {t.nombreTratamiento}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                  {t.descripcionTratamiento} — <strong>${t.costoTratamiento}</strong>
                </div>
              </div>
            ))}
          </div>

          {/* Botón para crear nuevo */}
          <div style={{ borderTop: '1px solid var(--border-color)', padding: '10px' }}>
            <button
              onClick={e => { e.stopPropagation(); setShowForm(prev => !prev); }}
              style={{ background: 'none', border: 'none', color: 'var(--primary-color)',
                       fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                       width: '100%', textAlign: 'left', padding: '4px 6px' }}
            >
              <i className="bi bi-plus-circle me-2" />
              {showForm ? 'Cancelar nuevo tratamiento' : 'Crear tratamiento nuevo'}
            </button>
          </div>

          {/* Formulario inline de creación */}
          {showForm && (
            <div
              style={{ padding: '12px 16px', borderTop: '1px solid var(--border-color)', background: '#f8fafc' }}
              onClick={e => e.stopPropagation()}
            >
              <p className="fw-bold small mb-2" style={{ color: 'var(--primary-color)' }}>
                Nuevo tratamiento
              </p>
              <div className="mb-2">
                <input type="text" className="form-control-custom"
                  placeholder="Nombre del tratamiento *"
                  value={nuevoTratamiento.nombreTratamiento}
                  onChange={e => setNuevoTratamiento({ ...nuevoTratamiento, nombreTratamiento: e.target.value })}
                  style={{ fontSize: '0.85rem', padding: '8px 10px' }}
                />
              </div>
              <div className="mb-2">
                <input type="text" className="form-control-custom"
                  placeholder="Descripción (opcional)"
                  value={nuevoTratamiento.descripcionTratamiento}
                  onChange={e => setNuevoTratamiento({ ...nuevoTratamiento, descripcionTratamiento: e.target.value })}
                  style={{ fontSize: '0.85rem', padding: '8px 10px' }}
                />
              </div>
              <div className="mb-3">
                <input type="number" className="form-control-custom"
                  placeholder="Costo ($) *"
                  value={nuevoTratamiento.costoTratamiento}
                  onChange={e => setNuevoTratamiento({ ...nuevoTratamiento, costoTratamiento: e.target.value })}
                  style={{ fontSize: '0.85rem', padding: '8px 10px' }}
                  min="0" step="0.01"
                />
              </div>
              <button
                className="btn-register w-100"
                style={{ padding: '10px', fontSize: '0.85rem' }}
                onClick={handleCrear}
                disabled={saving}
              >
                {saving ? 'Guardando...' : 'Guardar y seleccionar'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TratamientoSelector;
