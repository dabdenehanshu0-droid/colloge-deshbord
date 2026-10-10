import React from 'react';
import { AlertTriangle, Users, BookOpen, Layers } from 'lucide-react';
import { ClassInsightsData } from '../../types';
import { ProvenanceChip } from '../ui/ProvenanceChip';

interface ClassInsightCardProps {
  insights: ClassInsightsData;
  onViewEvidence?: (outcomeId: number) => void;
  onOpenRecommendations?: () => void;
  className?: string;
}

export const ClassInsightCard: React.FC<ClassInsightCardProps> = ({
  insights,
  onViewEvidence,
  onOpenRecommendations,
  className = ''
}) => {
  const lo4 = insights.outcomes.find((o) => o.code === 'LO4');

  return (
    <div className={`p-6 rounded-2xl bg-[#0B1B3A] border border-indigo-500/25 shadow-xl relative overflow-hidden ${className}`}>
      {/* Top Banner with Provenance */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-700/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">
              {insights.section.name} · CS-501 Neural Networks
            </span>
            <ProvenanceChip provenance={insights.provenance} note={insights.seeded_note} />
          </div>
          <h3 className="text-xl font-bold text-white font-display">
            Formative Class Intelligence & Outcome Distribution
          </h3>
        </div>

        {/* Attendance & Respondent stats */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div>
            <span className="text-slate-400 block text-[10px] font-semibold">ENROLLED</span>
            <span className="font-bold text-sm text-white">{insights.section.enrolled_count} Students</span>
          </div>
          <div className="border-l border-slate-700 pl-4">
            <span className="text-slate-400 block text-[10px] font-semibold">RESPONDENTS</span>
            <span className="font-bold text-sm text-emerald-400">{insights.respondents} Submitted</span>
          </div>
          <div className="border-l border-slate-700 pl-4">
            <span className="text-slate-400 block text-[10px] font-semibold">LIVE ACTIVE</span>
            <span className="font-bold text-sm text-indigo-400">{insights.live_participants} (Riya)</span>
          </div>
        </div>
      </div>

      {/* Critical Headline Warning: 35 Students Need Support on LO4 */}
      {lo4 && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-rose-500/30 text-rose-200 border border-rose-500/40">
                  CRITICAL WARNING
                </span>
                <span className="text-base font-bold text-rose-200 font-display">
                  {insights.support_summary.text}
                </span>
              </div>
              <p className="text-xs text-rose-100/90 mt-1 max-w-2xl leading-relaxed font-normal">
                61% of respondents in Section 5-A demonstrated sub-threshold mastery (class average: 41%).
                {lo4.top_misconception && (
                  <span className="block text-rose-200 font-semibold mt-0.5">
                    Dominant misconception: {lo4.top_misconception.label} ({lo4.top_misconception.count} students).
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center shrink-0">
            {onViewEvidence && (
              <button
                onClick={() => onViewEvidence(4)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 transition-colors cursor-pointer"
              >
                View Evidence
              </button>
            )}
            {onOpenRecommendations && (
              <button
                onClick={onOpenRecommendations}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-colors shadow-sm cursor-pointer"
              >
                Re-teach Recommendation
              </button>
            )}
          </div>
        </div>
      )}

      {/* Grid of Outcome Breakdown Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {insights.outcomes.map((item) => {
          const isWarning = item.warning;
          return (
            <div
              key={item.outcome_id}
              className={`p-3.5 rounded-xl border transition-all ${
                isWarning
                  ? 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                  : 'bg-navy-950/80 border-slate-700/80 text-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-mono font-bold text-slate-300">{item.code}</span>
                <span
                  className={`text-sm font-bold font-mono ${
                    isWarning ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {item.class_mastery_percent}%
                </span>
              </div>
              <div className="text-xs text-white font-semibold truncate mb-2" title={item.statement}>
                {item.statement}
              </div>

              {/* Distribution Mini Bar */}
              <div className="h-1.5 w-full bg-slate-800 rounded-full flex overflow-hidden">
                <div
                  className="bg-emerald-500"
                  style={{ width: `${(item.distribution.strong / 57) * 100}%` }}
                  title={`Strong: ${item.distribution.strong}`}
                />
                <div
                  className="bg-amber-500"
                  style={{ width: `${(item.distribution.developing / 57) * 100}%` }}
                  title={`Developing: ${item.distribution.developing}`}
                />
                <div
                  className="bg-rose-500"
                  style={{ width: `${(item.distribution.weak / 57) * 100}%` }}
                  title={`Weak: ${item.distribution.weak}`}
                />
              </div>

              <div className="flex justify-between text-[10px] text-slate-300 mt-1.5 font-mono">
                <span>{item.distribution.strong} Strong</span>
                <span>{item.distribution.developing} Dev</span>
                <span className={item.distribution.weak > 20 ? 'text-rose-400 font-bold' : ''}>
                  {item.distribution.weak} Weak
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
