import React from 'react';

const SIZES = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-11 h-11 text-base',
};

const COLORS = [
  'bg-sky-600',
  'bg-violet-600',
  'bg-emerald-600',
  'bg-amber-500',
  'bg-rose-600',
  'bg-indigo-600',
];

/**
 * Avatar circular con iniciales.
 * El color se elige automáticamente según las iniciales para consistencia.
 */
const AvatarBadge = ({ initials = '?', size = 'md', inactive = false, className = '' }) => {
  // Color determinístico basado en el primer carácter
  const colorIdx = initials.charCodeAt(0) % COLORS.length;
  const color = inactive ? 'bg-slate-300' : COLORS[colorIdx];

  return (
    <div className={`
      ${SIZES[size] ?? SIZES.md} ${color}
      rounded-full flex items-center justify-center
      font-bold text-white flex-shrink-0 select-none
      ${className}
    `}>
      {initials.slice(0, 2).toUpperCase()}
    </div>
  );
};

export default AvatarBadge;
