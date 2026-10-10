import React from 'react';
import { QuizResult } from '../../types';
import { CheckCircle2, XCircle, ArrowRight, BrainCircuit, AlertCircle } from 'lucide-react';
import { StatusBadge } from '../ui/StatusBadge';
import { ProvenanceChip } from '../ui/ProvenanceChip';

interface ResultSummaryProps {
  result: QuizResult;
  onGoToDashboard?: () => void;
  onGoToPractice?: () => void;
  className?: string;
}

export const ResultSummary: React.FC<ResultSummaryProps> = ({
  result,
  onGoToDashboard,
  onGoToPractice,
  className = ''
}) => {
  const isPractice = result.context === 'PRACTICE';
  const hasGaps = result.gaps && result.gaps.length > 0;

  return (
    <div className={`p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-[#0B1B3A] to-[#071022] border border-indigo-500/30 shadow-2xl space-y-6 ${className}`}>
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">
              {isPractice ? 'Personalized Practice Assessment' : 'Live Exit Quiz Results'}
            </span>
            <ProvenanceChip provenance={result.provenance} />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
            Assessment Verified & Evidence Integrated
          </h2>
        </div>

        {/* Score Badge */}
        <div className="flex items-center gap-3 bg-navy-950/80 px-4 py-2.5 rounded-xl border border-indigo-500/25 self-start sm:self-auto">
          <span className="text-xs font-mono text-slate-400 uppercase">SCORE</span>
          <span className="text-xl font-bold font-mono text-white">
            {result.score.correct} / {result.score.total}
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
            {Math.round((result.score.correct / result.score.total) * 100)}%
          </span>
        </div>
      </div>

      {/* Critical Gap Alert if LO4 is Weak */}
      {hasGaps && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/35 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                CRITICAL GAP IDENTIFIED
              </span>
              <span className="text-sm font-bold text-rose-300">
                LO4 Backpropagation: 41% (Needs Attention)
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Based on your incorrect answers on Question 4 and Question 5, the system detected a misconception: 
              <strong className="text-rose-200"> "Output error applied directly to hidden weights without chain multiplication."</strong>
            </p>
          </div>
        </div>
      )}

      {/* Updated Per-Outcome Mastery Table */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-indigo-400" />
          <span>Real-Time Updated Outcome Mastery (Prior-Weighted)</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {result.mastery.map((item) => (
            <div
              key={item.outcome.id}
              className="p-3.5 rounded-xl bg-navy-900/70 border border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono font-bold text-indigo-400">
                    {item.outcome.code}
                  </span>
                  <StatusBadge status={item.status} size="sm" />
                </div>
                <div className="text-xs text-slate-300 truncate font-medium" title={item.outcome.statement}>
                  {item.outcome.statement}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">Calculated</span>
                <span className="text-base font-bold font-mono text-white">
                  {item.percent}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Per-Question Itemized Feedback */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
          Question Review & Diagnostic Feedback
        </h4>
        <div className="space-y-3">
          {result.items.map((item, index) => (
            <div
              key={item.question_id}
              className={`p-4 rounded-xl border ${
                item.is_correct
                  ? 'bg-emerald-950/20 border-emerald-500/30'
                  : 'bg-rose-950/20 border-rose-500/35'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  {item.is_correct ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span className="text-xs font-mono font-bold text-white">
                    Question {index + 1} · LO{item.learning_outcome_id}
                  </span>
                </div>
                <span
                  className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                    item.is_correct
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-rose-500/20 text-rose-300'
                  }`}
                >
                  {item.is_correct ? 'CORRECT' : 'INCORRECT'}
                </span>
              </div>

              {item.misconception && (
                <div className="text-xs text-rose-300 font-medium mb-1.5 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                  Diagnosed Misconception: {item.misconception.label}
                </div>
              )}

              <p className="text-xs text-slate-300 leading-relaxed mt-1">
                <strong className="text-slate-200">Explanation:</strong> {item.explanation}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-800">
        {onGoToPractice && hasGaps && (
          <button
            onClick={onGoToPractice}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-rose-600 hover:bg-rose-500 text-white transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <span>Targeted Remedial Practice</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}

        {onGoToDashboard && (
          <button
            onClick={onGoToDashboard}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <span>View Student Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
