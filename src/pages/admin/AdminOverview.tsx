import React, { useState, useEffect } from 'react';
import { api } from '../../services/apiClient';
import { AdminOverviewData, AdminGapData } from '../../types';
import { ProvenanceChip } from '../../components/ui/ProvenanceChip';
import { IntelligenceLoop } from '../../components/ui/IntelligenceLoop';
import { usePlatform } from '../../context/PlatformContext';
import { 
  Building2, 
  Users, 
  BookOpen, 
  AlertTriangle, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight,
  TrendingDown,
  CheckCircle2,
  FileText
} from 'lucide-react';

interface AdminOverviewProps {
  onNavigate: (path: string) => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({ onNavigate }) => {
  const { showToast } = usePlatform();
  const [overview, setOverview] = useState<AdminOverviewData | null>(null);
  const [gaps, setGaps] = useState<AdminGapData[]>([]);
  const [draftedRec, setDraftedRec] = useState<any>(null);
  const [isDrafting, setIsDrafting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ov, gp] = await Promise.all([
          api.getAdminOverview(),
          api.getAdminGaps()
        ]);
        setOverview(ov);
        setGaps(gp);
      } catch (err) {
        console.error('Failed to load admin overview', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDraftRecommendation = async () => {
    setIsDrafting(true);
    try {
      const rec = await api.draftAcademicRecommendation(4);
      setDraftedRec(rec);
      showToast('Faculty Senate Academic Recommendation drafted via AI Gateway', 'success');
    } catch (err: any) {
      showToast(err.message || 'Error drafting recommendation', 'error');
    } finally {
      setIsDrafting(false);
    }
  };

  if (loading || !overview) {
    return <div className="p-8 text-center text-slate-400">Loading University Intelligence...</div>;
  }

  const primaryGap = gaps[0];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0B1B3A] border border-indigo-500/20 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-violet-400">
              University Intelligence · Academic Admin
            </span>
            <ProvenanceChip provenance={overview.provenance} note={overview.seeded_note} />
          </div>
          <h2 className="text-2xl font-bold text-white font-display">
            Institutional Curriculum Oversight & Governance
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Aggregated cross-section analytics · Zero individual student surveillance by architectural construction
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-3 py-1.5 rounded-xl self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4" />
          <span>Non-Surveillance Guarantee (k ≥ 5)</span>
        </div>
      </div>

      {/* KPI Tiles Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-navy-900/80 border border-slate-800">
          <div className="text-[11px] font-mono text-slate-400 uppercase mb-1">
            TOTAL ENROLLED STUDENTS
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {overview.total_students}
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">
            Section 5-A (57) + Section 5-B (57)
          </span>
        </div>

        <div className="p-4 rounded-xl bg-navy-900/80 border border-slate-800">
          <div className="text-[11px] font-mono text-slate-400 uppercase mb-1">
            ACTIVE COURSES TRACKED
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {overview.active_courses}
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">
            CS-501 Artificial Intelligence
          </span>
        </div>

        <div className="p-4 rounded-xl bg-navy-900/80 border border-slate-800">
          <div className="text-[11px] font-mono text-slate-400 uppercase mb-1">
            LEARNING OUTCOMES TRACKED
          </div>
          <div className="text-2xl font-bold font-mono text-indigo-400">
            {overview.outcomes_tracked}
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">
            LO1–LO4 (+2 Prerequisite Nodes)
          </span>
        </div>

        <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/35">
          <div className="text-[11px] font-mono text-rose-400 uppercase mb-1 font-bold">
            RECURRING SYSTEMIC GAPS
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400">
            {overview.weak_outcomes}
          </div>
          <span className="text-[11px] text-rose-300 block mt-1">
            LO4 Backpropagation (58% Weak)
          </span>
        </div>
      </div>

      {/* Primary Recurring Learning Gap Card (Build Plan §18, CR-04) */}
      {primaryGap && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-rose-950/30 via-navy-900 to-[#071022] border border-rose-500/40 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-rose-500/20">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  MULTI-SECTION RECURRING DEFICIT
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {primaryGap.outcome.course}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white font-display">
                {primaryGap.outcome.code}: {primaryGap.outcome.statement}
              </h3>
            </div>

            {/* Combined Weak Share Metric */}
            <div className="flex items-center gap-3 bg-navy-950/90 px-4 py-2.5 rounded-xl border border-rose-500/30 self-start md:self-auto">
              <span className="text-xs font-mono text-slate-400 uppercase">COMBINED WEAK SHARE</span>
              <span className="text-2xl font-bold font-mono text-rose-400">
                {primaryGap.combined_weak_share_pct}%
              </span>
              <span className="text-xs text-slate-400 font-mono">
                (66 / {primaryGap.total_respondents})
              </span>
            </div>
          </div>

          {/* Section Comparison Grid */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
              Cross-Section Formative Breakdown:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {primaryGap.sections.map((sec, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-navy-900/80 border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <span className="text-sm font-bold text-white block">
                      {sec.name}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {sec.respondents} Enrolled Respondents
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold font-mono text-rose-400 block">
                      {sec.weak_share_pct}%
                    </span>
                    <span className="text-[10px] uppercase font-mono text-slate-400">
                      Weak Cohort
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Root Cause & Prerequisite Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-navy-900/60 border border-slate-800 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 block">
                Why this matters institutional-wide:
              </span>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {primaryGap.why_this_matters}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-navy-900/60 border border-slate-800 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300 block">
                Correlated Prerequisite Deficits:
              </span>
              <div className="space-y-1.5 pt-1">
                {primaryGap.prerequisites.map((p, i) => (
                  <div key={i} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-white font-medium">{p.code}: {p.name}</span>
                    <span className="font-mono text-amber-400 font-bold">{p.developing_or_better_pct}% Mastery</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Suggested Institutional Actions & Draft Button */}
          <div className="pt-4 border-t border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Recommended Senate Actions:
              </span>
              <ul className="text-xs text-slate-300 space-y-1">
                {primaryGap.suggested_actions.map((act, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={handleDraftRecommendation}
              disabled={isDrafting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white transition-colors flex items-center gap-2 shadow-sm shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isDrafting ? 'Drafting Policy Text...' : 'Draft Academic Recommendation'}</span>
            </button>
          </div>

          {/* Rendered Academic Recommendation Card */}
          {draftedRec && (
            <div className="p-5 rounded-xl bg-violet-950/30 border border-violet-500/40 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-violet-500/30">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-violet-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-white">
                    Faculty Senate Academic Recommendation Draft
                  </span>
                </div>
                <span className="text-[11px] font-mono text-violet-300">
                  Ready for Review
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-serif italic">
                "{draftedRec.text}"
              </p>
              <div className="flex flex-wrap gap-2 pt-1 text-[11px] font-mono text-slate-400">
                {draftedRec.facts?.map((f: string, idx: number) => (
                  <span key={idx} className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Intelligence Loop */}
      <IntelligenceLoop compact onStepSelect={(step) => onNavigate('/demo')} />
    </div>
  );
};
