import React from 'react';
import { MasteryStatus, Role } from '../../types';
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react';

interface StatusBadgeProps {
  status: MasteryStatus | 'DRAFT' | 'REVIEWED' | 'APPROVED' | 'PUBLISHED';
  role?: Role;
  className?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  role = 'STUDENT',
  className = '',
  size = 'md'
}) => {
  const pad = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  if (status === 'STRONG') {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-md font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 ${pad} ${className}`}>
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        <span>Strong</span>
      </span>
    );
  }

  if (status === 'DEVELOPING') {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-md font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 ${pad} ${className}`}>
        <Clock className="w-3.5 h-3.5 text-amber-400" />
        <span>Developing</span>
      </span>
    );
  }

  if (status === 'WEAK') {
    // CR-05: Student UI reads "Needs Attention", Teacher/Admin UI reads "Weak"
    const label = role === 'STUDENT' ? 'Needs Attention' : 'Weak';
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-md font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/35 ${pad} ${className}`}>
        <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
        <span>{label}</span>
      </span>
    );
  }

  // Lesson status mappings
  if (status === 'DRAFT') {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-md font-medium bg-slate-500/15 text-slate-300 border border-slate-500/30 ${pad} ${className}`}>
        <span>Draft</span>
      </span>
    );
  }
  if (status === 'REVIEWED') {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-md font-medium bg-sky-500/15 text-sky-300 border border-sky-500/30 ${pad} ${className}`}>
        <span>Reviewed</span>
      </span>
    );
  }
  if (status === 'APPROVED') {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-md font-medium bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 ${pad} ${className}`}>
        <span>Approved</span>
      </span>
    );
  }
  if (status === 'PUBLISHED') {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-md font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 ${pad} ${className}`}>
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        <span>Published</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center rounded-md font-medium bg-slate-800 text-slate-300 ${pad} ${className}`}>
      {status}
    </span>
  );
};
