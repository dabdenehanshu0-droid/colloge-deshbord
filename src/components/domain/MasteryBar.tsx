import React from 'react';
import { MasteryItem, Role } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';
import { ProvenanceChip } from '../ui/ProvenanceChip';

interface MasteryBarProps {
  item: MasteryItem;
  role?: Role;
  showDetails?: boolean;
  className?: string;
}

export const MasteryBar: React.FC<MasteryBarProps> = ({
  item,
  role = 'STUDENT',
  showDetails = true,
  className = ''
}) => {
  const { outcome, percent, status, evidence_count, prior_note, provenance } = item;

  // Color mapping based on status
  const barColor =
    status === 'STRONG'
      ? 'bg-emerald-500'
      : status === 'DEVELOPING'
      ? 'bg-amber-500'
      : 'bg-rose-500';

  return (
    <div className={`p-4 rounded-xl bg-navy-900/60 border border-slate-800 hover:border-indigo-500/30 transition-colors ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            {outcome.code}
          </span>
          <span className="text-sm font-semibold text-white">
            {outcome.statement}
          </span>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <StatusBadge status={status} role={role} size="sm" />
          <span className="text-base font-bold font-mono text-white min-w-[3rem] text-right">
            {percent}%
          </span>
        </div>
      </div>

      {/* Progress Track with 50% and 70% threshold indicators */}
      <div className="relative w-full h-3 bg-slate-800 rounded-full overflow-hidden my-2">
        {/* Threshold Reference Lines */}
        <div className="absolute top-0 bottom-0 left-[50%] w-0.5 bg-amber-400/40 z-10" title="Developing Threshold (50%)" />
        <div className="absolute top-0 bottom-0 left-[70%] w-0.5 bg-emerald-400/40 z-10" title="Strong Threshold (70%)" />

        {/* Fill bar */}
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        />
      </div>

      {showDetails && (
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-300 pt-1 gap-2">
          <div className="flex items-center gap-3">
            <span>
              Evidence: <strong className="text-slate-200">{evidence_count}</strong> answers
            </span>
            <span>·</span>
            <span>{prior_note}</span>
          </div>

          <ProvenanceChip provenance={provenance} />
        </div>
      )}
    </div>
  );
};
