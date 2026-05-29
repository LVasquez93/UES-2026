import React, { useEffect } from 'react';

/**
 * Modal accesible y reutilizable.
 * Reemplaza todos los overlays inline del proyecto.
 *
 * @param {boolean} isOpen      - Controla visibilidad
 * @param {() => void} onClose  - Se llama al cerrar (backdrop click o botón X)
 * @param {string} title        - Título del modal
 * @param {string} [subtitle]   - Subtítulo (opcional)
 * @param {React.ReactNode} children - Contenido del modal
 * @param {React.ReactNode} [footer] - Pie del modal (botones de acción)
 * @param {'sm'|'md'|'lg'|'xl'} [size] - Ancho del modal
 */
const SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

const Modal = ({ isOpen, onClose, title, subtitle, children, footer, size = 'md' }) => {
  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-[2px] flex items-center
                 justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full ${SIZES[size]}
                    max-h-[90vh] flex flex-col animate-fade-in-up`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h5 id="modal-title" className="font-bold text-slate-800 text-base">{title}</h5>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="w-8 h-8 flex items-center justify-center rounded-lg
                       text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <i className="bi bi-x text-lg" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-5 py-3 border-t border-slate-100 flex gap-2 justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
