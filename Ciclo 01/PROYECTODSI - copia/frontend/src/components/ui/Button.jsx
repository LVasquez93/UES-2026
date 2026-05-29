import React from 'react';

const VARIANTS = {
  primary:  'bg-primary-600 text-white hover:bg-primary-700 shadow-sm hover:shadow-md',
  secondary:'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50',
  danger:   'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100',
  ghost:    'text-slate-600 hover:bg-slate-100',
  success:  'bg-emerald-600 text-white hover:bg-emerald-700',
  outline:  'border border-primary-600 text-primary-600 hover:bg-primary-50',
};

const SIZES = {
  xs: 'px-2.5 py-1.5 text-xs rounded-lg',
  sm: 'px-3 py-2 text-sm rounded-lg',
  md: 'px-4 py-2.5 text-sm rounded-xl',
  lg: 'px-5 py-3 text-base rounded-xl',
};

/**
 * Botón genérico con variantes de estilo y tamaño.
 *
 * @param {'primary'|'secondary'|'danger'|'ghost'|'success'|'outline'} variant
 * @param {'xs'|'sm'|'md'|'lg'} size
 */
const Button = ({
  children,
  variant = 'primary',
  size    = 'md',
  className = '',
  disabled,
  loading,
  icon,
  fullWidth,
  ...props
}) => (
  <button
    {...props}
    disabled={disabled || loading}
    className={`
      inline-flex items-center justify-center gap-2 font-medium
      transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed
      ${VARIANTS[variant] ?? VARIANTS.primary}
      ${SIZES[size]       ?? SIZES.md}
      ${fullWidth ? 'w-full' : ''}
      ${className}
    `}
  >
    {loading && (
      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
    )}
    {icon && !loading && <span className="text-sm">{icon}</span>}
    {children}
  </button>
);

export default Button;
