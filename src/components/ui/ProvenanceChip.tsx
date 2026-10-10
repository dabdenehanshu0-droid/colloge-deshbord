import React from 'react';
import { Database, Zap } from 'lucide-react';

interface ProvenanceChipProps {
  provenance?: 'LIVE' | 'SEEDED' | 'MIXED';
  note?: string;
  className?: string;
}

export const ProvenanceChip: React.FC<ProvenanceChipProps> = ({
  provenance = 'MIXED',
  note,
  className = ''
}) => {
  if (provenance === 'LIVE') {
    return (
      <span
        title={note || 'Live evidence computed from your real student answers'}
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 ${className}`}
      >
        <Zap className="w-3 h-3 text-emerald-400" />
        <span>LIVE · REAL EVIDENCE</span>
      </span>
    );
  }

  return (
    <span
      title={note || 'Demonstration data: seeded benchmark cohort for academic demonstration'}
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-violet-500/10 text-violet-300 border border-violet-500/25 ${className}`}
    >
      <Database className="w-3 h-3 text-violet-400" />
      <span>DEMONSTRATION DATA</span>
    </span>
  );
};
