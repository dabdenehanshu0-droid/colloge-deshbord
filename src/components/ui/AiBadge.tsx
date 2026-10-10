import React from 'react';
import { Sparkles, ShieldCheck } from 'lucide-react';

interface AiBadgeProps {
  mode?: 'LIVE' | 'FALLBACK';
  label?: string;
  className?: string;
}

export const AiBadge: React.FC<AiBadgeProps> = ({
  mode = 'LIVE',
  label,
  className = ''
}) => {
  if (mode === 'FALLBACK') {
    return (
      <span
        title="Running with deterministic built-in academic fallback pack"
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/25 ${className}`}
      >
        <ShieldCheck className="w-3 h-3 text-amber-400" />
        <span>{label || 'Demo mode (fallback)'}</span>
      </span>
    );
  }

  return (
    <span
      title="Grounded in approved SGSU course material via AI Gateway"
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 ${className}`}
    >
      <Sparkles className="w-3 h-3 text-indigo-400" />
      <span>{label || 'Grounded AI'}</span>
    </span>
  );
};
