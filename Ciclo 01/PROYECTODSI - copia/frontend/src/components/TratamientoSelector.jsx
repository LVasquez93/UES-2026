import React from 'react';

/**
 * Selector de tratamiento con dropdown custom.
 * Incluye formulario para crear un nuevo tratamiento en el catálogo.
 */
const TratamientoSelector = ({
  tratamientos,
  selectedTratamiento,
  setSelectedTratamiento,
  customPrecio,
  setCustomPrecio,
  mostrarFormNuevo,
  setMostrarFormNuevo,
  nuevoTratamiento,
  setNuevoTratamiento,
  onCrearNuevo,
}) => {
  return (
    <>
      {/* Header del selector con botón toggle */}
      <div className="d-flex justify-content-between align-items-center mb-1">
        <label className="form-label-custom m-0">Tratamiento</label>
        <button
          type="button"
          className="btn btn-sm btn-link p-0 text-primary fw-bold text-decoration-none"
          onClick={() => setMostrarFormNuevo(!mostrarFormNuevo)}
        >
          {mostrarFormNuevo ? '✕ Cancelar' : '➕ Crear Nuevo'}
        </button>
      </div>

      {mostrarFormNuevo ? (
        /* Formulario rápido para agregar tratamiento */
        <div className="p-3 border rounded-3 bg-light mb-2 animate__animated animate__fadeIn">
          <span className="text-muted small fw-bold d-block mb-2">Nuevo tratamiento en catálogo:</span>
          <input
            type="text"
            className="form-control-custom mb-2 bg-white"
            placeholder="Nombre (ej: Endodoncia Molar)"
            value={nuevoTratamiento.nombreTratamiento}
            onChange={e => setNuevoTratamiento({ ...nuevoTratamiento, nombreTratamiento: e.target.value })}
          />
          <input
            type="number"
            className="form-control-custom mb-2 bg-white"
            placeholder="Precio base ($)"
            value={nuevoTratamiento.costoTratamiento}
            onChange={e => setNuevoTratamiento({ ...nuevoTratamiento, costoTratamiento: e.target.value })}
          />
          <button
            type="button"
            className="btn btn-sm btn-primary w-100 fw-bold"
            onClick={onCrearNuevo}
          >
            Guardar en Base de Datos
          </button>
        </div>
      ) : (
        /* Dropdown custom de tratamientos */
        <div className="treatment-dropdown">
          <div className="dropdown-header">
            {selectedTratamiento
              ? tratamientos.find(t => t.idTratamiento === parseInt(selectedTratamiento))?.nombreTratamiento
              : 'Seleccione un tratamiento'}
            <i className="bi bi-chevron-down" />
          </div>
          <div className="dropdown-content" style={{ maxHeight: '180px', overflowY: 'auto' }}>
            {tratamientos.map(t => (
              <div
                key={t.idTratamiento}
                className={`item ${selectedTratamiento === String(t.idTratamiento) ? 'active' : ''}`}
                onClick={() => {
                  setSelectedTratamiento(String(t.idTratamiento));
                  setCustomPrecio(String(t.costoTratamiento));
                }}
              >
                {t.nombreTratamiento}
                <span className="text-muted small d-block">${t.costoTratamiento}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Precio editable */}
      <div className="mt-3">
        <label className="form-label-custom">Precio a cobrar ($)</label>
        <input
          type="number"
          className="form-control-custom"
          placeholder="0.00"
          value={customPrecio}
          onChange={e => setCustomPrecio(e.target.value)}
          disabled={mostrarFormNuevo || !selectedTratamiento}
        />
        <small className="text-muted" style={{ fontSize: '0.75rem' }}>
          * Puedes modificar el precio de referencia según la condición del paciente.
        </small>
      </div>
    </>
  );
};

export default TratamientoSelector;
