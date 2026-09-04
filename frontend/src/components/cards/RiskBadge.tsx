import React from 'react';

interface RiskBadgeProps {
  level: string | null | undefined;
  score?: number;
  count?: number;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, score, count }) => {
  const normLevel = (level || 'LOW').toUpperCase();
  
  let badgeStyle = 'badge-low';
  if (normLevel === 'MEDIUM') badgeStyle = 'badge-medium';
  else if (normLevel === 'HIGH') badgeStyle = 'badge-high';
  else if (normLevel === 'CRITICAL') badgeStyle = 'badge-critical';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wider ${badgeStyle}`}>
      {normLevel} {score !== undefined ? `(${score.toFixed(1)})` : count !== undefined ? `(${count})` : ''}
    </span>
  );
};
