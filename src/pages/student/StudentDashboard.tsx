import React, { useState, useEffect } from 'react';
import { api } from '../../services/apiClient';
import { MasteryItem, Recommendation, User } from '../../types';
import { OutcomeList } from '../../components/domain/OutcomeList';
import { OutcomeBarChart } from '../../components/domain/OutcomeBarChart';
import { GapPanel } from '../../components/domain/GapPanel';
import { IntelligenceLoop } from '../../components/ui/IntelligenceLoop';
import { ProvenanceChip } from '../../components/ui/ProvenanceChip';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EvidenceDrawer } from '../../components/domain/EvidenceDrawer';
import { 
  User as UserIcon, 
  Compass, 
  Presentation, 
  BookOpen, 
  Sparkles, 
  ArrowRight,
  TrendingUp,
  BrainCircuit
} from 'lucide-react';

interface StudentDashboardProps {
  onNavigate: (path: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate }) => {
  const [masteryData, setMasteryData] = useState<{
    student: User;
    items: MasteryItem[];
    overall_percent: number;
    overall_status: string;
    provenance: 'LIVE' | 'MIXED';
  } | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [evidenceDrawerOpen, setEvidenceDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mast, recs] = await Promise.all([
          api.getStudentMastery(101),
          api.getStudentRecommendations(101)
        ]);
        setMasteryData(mast);
        setRecommendations(recs);
      } catch (err) {
        console.error('Failed to load student dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !masteryData) {
    return <div className="p-8 text-center text-slate-400">Loading Student Intelligence...</div>;
  }

  const primaryRec = recommendations[0];

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-navy-900 via-[#0B1B3A] to-navy-900 border border-indigo-500/20 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-lg font-display">
            RS
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">
                Student Intelligence · Roll #2024-AI-101
              </span>
              <ProvenanceChip provenance={masteryData.provenance} />
            </div>
            <h2 className="text-2xl font-bold text-white font-display">
              Welcome back, {masteryData.student.name}
            </h2>
            <p className="text-xs text-slate-300">
              B.Tech CSE (AI & ML) · Semester 5 · Section 5-A
            </p>
          </div>
        </div>

        {/* Course Progress Badge */}
        <div className="flex items-center gap-3 bg-navy-950/80 px-4 py-2.5 rounded-xl border border-indigo-500/25 self-start sm:self-auto">
          <div>
            <span className="text-[10px] font-mono text-slate-400 block uppercase">
              OVERALL AI MASTERY
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold font-mono text-white">
                {masteryData.overall_percent}%
              </span>
              <StatusBadge status={masteryData.overall_status as any} role="STUDENT" size="sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Learning Gap Panel (Build Plan §11) */}
      {primaryRec && (
        <GapPanel
          recommendation={primaryRec}
          onStartPractice={() => onNavigate('/student/practice')}
          onOpenTutor={() => onNavigate('/student/tutor')}
          onViewEvidence={() => setEvidenceDrawerOpen(true)}
        />
      )}

      {/* Mastery List & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Detailed Outcome Breakdown (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-indigo-400" />
              <span>Verified Learning Outcome Mastery (LO1–LO4)</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">
              Prior-Weighted Estimator
            </span>
          </div>

          <OutcomeList items={masteryData.items} role="STUDENT" />
        </div>

        {/* Right: Bar Chart & Quick Links (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <OutcomeBarChart
            items={masteryData.items}
            title="My Outcome Competency Profile"
          />

          {/* Classroom Join Prompt Tile */}
          <div className="p-5 rounded-2xl bg-navy-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Presentation className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Smart Classroom
                </h4>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                LIVE SESSION #101
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Dr. Aarav Mehta is teaching Lecture 14. Follow live presentation slides, answer polls, and complete the exit quiz.
            </p>
            <button
              onClick={() => onNavigate('/student/classroom')}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Enter Live Classroom</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
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
