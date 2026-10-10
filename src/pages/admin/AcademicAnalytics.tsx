import React, { useState, useEffect } from 'react';
import { api } from '../../services/apiClient';
import { AdminAnalyticsData } from '../../types';
import { ProvenanceChip } from '../../components/ui/ProvenanceChip';
import { BarChart2, Layers, GitCompare, ArrowRight, BookOpen } from 'lucide-react';

export const AcademicAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AdminAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.getAdminAnalytics();
        setAnalytics(data);
      } catch (err) {
        console.error('Failed to load academic analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !analytics) {
    return <div className="p-8 text-center text-slate-400">Loading Academic Analytics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0B1B3A] border border-indigo-500/20 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-violet-400">
              Institutional Intelligence · AD03
            </span>
            <ProvenanceChip provenance="MIXED" />
          </div>
          <h2 className="text-2xl font-bold text-white font-display">
            Cross-Cohort Analytics & Prerequisite Dependencies
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Aggregated competency distributions across 114 students enrolled in CS-501 (Sections 5-A & 5-B).
          </p>
        </div>

        <div className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 self-start sm:self-auto">
          Sample: 114 Students
        </div>
      </div>

      {/* Cross-Section Comparison & Outcomes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section Comparison */}
        <div className="p-6 rounded-2xl bg-navy-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <GitCompare className="w-4 h-4 text-rose-400" />
              <span>LO4 Deficit Comparison by Section</span>
            </h3>
            <span className="text-xs font-mono text-rose-400 font-bold">58% Combined</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Consistent sub-threshold performance on backpropagation across both instructors confirms curriculum-level variance rather than section pedagogy.
          </p>

          <div className="space-y-3 pt-2">
            {analytics.section_comparison.map((sec, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">{sec.section}</span>
                  <span className="font-mono text-rose-400 font-bold">{sec.weak_share_pct}% Below Threshold</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full"
                    style={{ width: `${sec.weak_share_pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prerequisite Competency Panel */}
        <div className="p-6 rounded-2xl bg-navy-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Prerequisite Mathematics Competency</span>
            </h3>
            <span className="text-xs font-mono text-amber-400 font-bold">Calculus Graph</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Student difficulty in LO4 directly correlates with weak retention in P2 (Multivariate Chain Rule) from Semester 3 Engineering Mathematics.
          </p>

          <div className="space-y-3 pt-2">
            {analytics.prerequisites.map((p, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">{p.code}: {p.name}</span>
                  <span
                    className={`font-mono font-bold ${
                      p.mastery_pct < 60 ? 'text-amber-400' : 'text-emerald-400'
                    }`}
                  >
                    {p.mastery_pct}% Verified Retention
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${p.mastery_pct < 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${p.mastery_pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weak-Distribution Breakdown */}
      <div className="p-6 rounded-2xl bg-navy-900/80 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Cohort Distribution by Outcome (Total 114 Students)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {analytics.weak_distribution.map((dist) => (
            <div key={dist.outcome_code} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-indigo-400">{dist.outcome_code}</span>
                <span className="text-xs text-slate-400">114 Total</span>
              </div>

              <div className="flex items-center justify-between text-xs font-mono pt-1">
                <span className="text-emerald-400">{dist.strong} Strong</span>
                <span className="text-amber-400">{dist.developing} Dev</span>
                <span className={dist.weak > 20 ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                  {dist.weak} Weak
                </span>
              </div>

              <div className="w-full h-2 bg-slate-800 rounded-full flex overflow-hidden">
                <div className="bg-emerald-500" style={{ width: `${(dist.strong / 114) * 100}%` }} />
                <div className="bg-amber-500" style={{ width: `${(dist.developing / 114) * 100}%` }} />
                <div className="bg-rose-500" style={{ width: `${(dist.weak / 114) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
