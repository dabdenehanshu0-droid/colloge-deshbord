import React, { useState } from 'react';
import { StudentQuestion } from '../../types';
import { BarChart3, CheckCircle, Lock } from 'lucide-react';

interface PollCardProps {
  poll: {
    id: number;
    status: 'OPEN' | 'CLOSED';
    question: StudentQuestion;
    counts?: Record<number, number>;
  };
  isTeacher?: boolean;
  onRespond?: (optionId: number) => void;
  onClose?: () => void;
  hasResponded?: boolean;
  selectedOptionId?: number;
  className?: string;
}

export const PollCard: React.FC<PollCardProps> = ({
  poll,
  isTeacher = false,
  onRespond,
  onClose,
  hasResponded = false,
  selectedOptionId,
  className = ''
}) => {
  const [localSelection, setLocalSelection] = useState<number | null>(selectedOptionId || null);
  const isClosed = poll.status === 'CLOSED';

  // Compute total votes
  const totalVotes = poll.counts
    ? Object.values(poll.counts).reduce((acc, count) => acc + count, 0)
    : 0;

  const handleSelect = (optionId: number) => {
    if (isClosed || hasResponded) return;
    setLocalSelection(optionId);
    onRespond?.(optionId);
  };

  return (
    <div className={`p-5 rounded-2xl bg-gradient-to-b from-navy-900 to-[#071022] border border-indigo-500/30 shadow-xl ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-300">
            Live Concept Poll · LO{poll.question.learning_outcome_id}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isClosed ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              <Lock className="w-3 h-3 text-slate-400" />
              <span>POLL CLOSED</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>LIVE VOTING</span>
            </span>
          )}

          {isTeacher && !isClosed && onClose && (
            <button
              onClick={onClose}
              className="px-2.5 py-1 rounded text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-colors"
            >
              Close Poll
            </button>
          )}
        </div>
      </div>

      {/* Stem */}
      <h3 className="text-sm sm:text-base font-bold text-white mb-4 leading-snug">
        {poll.question.stem}
      </h3>

      {/* Options List */}
      <div className="space-y-2.5">
        {poll.question.options.map((opt) => {
          const voteCount = poll.counts ? poll.counts[opt.id] || 0 : 0;
          const votePct = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
          const isSelected = localSelection === opt.id || selectedOptionId === opt.id;

          return (
            <div
              key={opt.id}
              onClick={() => handleSelect(opt.id)}
              className={`p-3 rounded-xl border relative overflow-hidden transition-all duration-200 ${
                !isTeacher && !isClosed && !hasResponded
                  ? 'cursor-pointer hover:border-indigo-500/50 hover:bg-slate-800/40'
                  : ''
              } ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-950/40 shadow-sm'
                  : 'border-slate-800 bg-slate-900/50'
              }`}
            >
              {/* Teacher or Closed Poll Vote Distribution Bar */}
              {(isTeacher || isClosed) && (
                <div
                  className="absolute inset-y-0 left-0 bg-indigo-600/20 transition-all duration-500 pointer-events-none"
                  style={{ width: `${votePct}%` }}
                />
              )}

              <div className="relative flex items-center justify-between gap-3 z-10">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-mono font-bold ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {opt.label}
                  </span>
                  <span className="text-xs sm:text-sm text-slate-200 font-medium">
                    {opt.text}
                  </span>
                </div>

                {/* Votes count & percentage */}
                {(isTeacher || isClosed) && (
                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-white block">
                      {votePct}%
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {voteCount} votes
                    </span>
                  </div>
                )}

                {hasResponded && isSelected && !isTeacher && (
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Response confirmation for student */}
      {!isTeacher && hasResponded && (
        <div className="mt-3 text-center text-xs font-medium text-emerald-400 flex items-center justify-center gap-1.5">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Your answer has been registered to the evidence store.</span>
        </div>
      )}
    </div>
  );
};
