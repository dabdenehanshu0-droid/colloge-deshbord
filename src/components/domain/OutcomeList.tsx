import React from 'react';
import { MasteryItem, Role } from '../../types';
import { MasteryBar } from './MasteryBar';

interface OutcomeListProps {
  items: MasteryItem[];
  role?: Role;
  className?: string;
}

export const OutcomeList: React.FC<OutcomeListProps> = ({
  items,
  role = 'STUDENT',
  className = ''
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((item) => (
        <MasteryBar key={item.outcome.id} item={item} role={role} />
      ))}
    </div>
  );
};
