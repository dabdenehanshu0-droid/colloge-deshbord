import React, { useEffect, useState } from 'react';
import { api } from '../../services/apiClient';
import { ClassInsightCard } from '../../components/domain/ClassInsightCard';
import { OutcomeBarChart } from '../../components/domain/OutcomeBarChart';
import { IntelligenceLoop } from '../../components/ui/IntelligenceLoop';
import { ProvenanceChip } from '../../components/ui/ProvenanceChip';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EvidenceDrawer } from '../../components/domain/EvidenceDrawer';
import { 
  GraduationCap, 
  Sparkles, 
  Presentation, 
  Compass, 
  AlertTriangle, 
  ArrowRight,
  BookOpen,
  Users
} from 'lucide-react';

interface TeacherDashboardProps {
  onNavigate: (path: string) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onNavigate }) => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [evidenceDrawerOpen, setEvidenceDrawerOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dash, ins] = await Promise.all([
          api.getTeacherDashboard(),
          api.getClassInsights(1)
        ]);
        setDashboardData(dash);
        setInsights(ins);
      } catch (err) {
        console.error('Failed to load teacher dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !dashboardData) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 bg-navy-900/60 rounded-2xl border border-slate-800" />
        <div className="h-64 bg-navy-900/60 rounded-2xl border border-slate-800" />
        <div className="h-48 bg-navy-900/60 rounded-2xl border border-slate-800" />
      </div>
    );
  }

  const lo4Weak = insights?.outcomes.find((o: any) => o.code === 'LO4');

  return (
    <div className="space-y-6">
      {/* Top Welcome & KPI Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-navy-900 via-[#0B1B3A] to-navy-900 border border-indigo-500/20 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">
              Teacher Studio · Dr. Aarav Mehta
            </span>
            <ProvenanceChip provenance="MIXED" />
          </div>
          <h2 className="text-2xl font-bold text-white font-display">
            Formative Academic Dashboard & Closed-Loop Control
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            CS-501 Artificial Intelligence · Topic 4: Neural Networks & Backpropagation
          </p>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigate('/teacher/faculty')}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Manage Teachers (Add/Remove)</span>
          </button>
          <button
            onClick={() => onNavigate('/teacher/lesson-builder')}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Open Lecture Builder</span>
          </button>
          <button
            onClick={() => onNavigate('/teacher/classroom')}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Presentation className="w-3.5 h-3.5 text-white" />
            <span>Launch Live Classroom</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-navy-900/70 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase text-slate-400 block mb-0.5">
              CURRENT COURSE
            </span>
            <span className="text-sm font-bold text-white">CS-501 Neural Architectures</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">B.Tech CSE · Sem 5</span>
          </div>
          <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-navy-900/70 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase text-slate-400 block mb-0.5">
              COHORT ENROLLMENT
            </span>
            <span className="text-sm font-bold text-white">Section 5-A (57 Enrolled)</span>
            <span className="text-[11px] text-emerald-400 block mt-0.5">57 Quiz Respondents</span>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-navy-900/70 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase text-slate-400 block mb-0.5">
              CRITICAL LEARNING GAP
            </span>
            <span className="text-sm font-bold text-rose-400">LO4 Backpropagation</span>
            <span className="text-[11px] text-rose-300 block mt-0.5">35 students need support</span>
          </div>
          <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Class Insight Card (Headline 35 Students / 61% and Warning) */}
      {insights && (
        <ClassInsightCard
          insights={insights}
          onViewEvidence={() => setEvidenceDrawerOpen(true)}
          onOpenRecommendations={() => onNavigate('/teacher/recommendations')}
        />
      )}

      {/* Primary Chart & Weak Learning Outcome Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <OutcomeBarChart
            items={dashboardData.class_mastery}
            title="Class 5-A Formative Outcome Mastery (Thresholds: 50% & 70%)"
          />
        </div>

        {/* AI Recommendations Highlight Tile */}
        <div className="p-5 rounded-2xl bg-gradient-to-b from-navy-900 to-[#071022] border border-indigo-500/25 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-indigo-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  AI Teaching Recommendation
                </h4>
              </div>
              <span className="text-[11px] font-mono font-bold text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/30">
                ACTIVE
              </span>
            </div>

            <h3 className="text-base font-bold text-white mb-2">
              Re-teach Backpropagation & Chain Rule Sensitivity
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Low mastery (41%) detected from today's exit quiz. 35 students in Section 5-A mistakenly applied final error directly without recursive weight matrix transpose projection.
            </p>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-1 mb-4">
              <span className="font-semibold text-white block">Suggested Action:</span>
              <span>10-Minute conceptual recap with a simplified worked example before moving to convolutional architectures.</span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('/teacher/recommendations')}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <span>Review Re-teach Segment</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Compact Intelligence Loop */}
      <IntelligenceLoop compact onStepSelect={(step) => onNavigate('/demo')} />

      {/* Evidence Drawer */}
      <EvidenceDrawer
        isOpen={evidenceDrawerOpen}
        onClose={() => setEvidenceDrawerOpen(false)}
      />
    </div>
  );
};
