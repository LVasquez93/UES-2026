import React from 'react';
import { getEstadoConfig } from '../../utils/cita.utils';

/**
 * Badge de estado de cita — usa ESTADO_CONFIG como única fuente de verdad.
 */
const StatusBadge = ({ estado }) => {
  const { tw, label } = getEstadoConfig(estado);
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tw}`}>
      {label}
    </span>
  );
};

export default StatusBadge;
