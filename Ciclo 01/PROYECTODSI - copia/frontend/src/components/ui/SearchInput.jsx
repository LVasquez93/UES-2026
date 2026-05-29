import React from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';

/**
 * Barra de búsqueda reutilizable con ícono y botón de limpiar.
 */
const SearchInput = ({
  value,
  onChange,
  onClear,
  placeholder = 'Buscar...',
  className = '',
}) => (
  <div className={`flex items-center gap-2 px-3 py-2.5 bg-white border border-slate-200
                   rounded-xl hover:border-primary-300 focus-within:ring-2
                   focus-within:ring-primary-500 focus-within:border-transparent
                   transition-all ${className}`}>
    <i className="bi bi-search text-slate-400 text-sm flex-shrink-0" />
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400
                 outline-none min-w-0"
    />
    {value && onClear && (
      <button
        type="button"
        onClick={onClear}
        aria-label="Limpiar búsqueda"
        className="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
      >
        <i className="bi bi-x text-sm" />
      </button>
    )}
  </div>
);

export default SearchInput;
