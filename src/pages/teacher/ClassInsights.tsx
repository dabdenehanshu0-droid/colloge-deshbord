import React, { useState, useEffect } from 'react';
import { api } from '../../services/apiClient';
import { ClassInsightsData } from '../../types';
import { OutcomeBarChart } from '../../components/domain/OutcomeBarChart';
import { ClassInsightCard } from '../../components/domain/ClassInsightCard';
import { EvidenceDrawer } from '../../components/domain/EvidenceDrawer';
import { ProvenanceChip } from '../../components/ui/ProvenanceChip';
import { 
  BarChart2, 
  Users, 
  AlertTriangle, 
  ArrowRight, 
  Compass, 
  Layers,
  CheckCircle2
} from 'lucide-react';

interface ClassInsightsProps {
  onNavigate: (path: string) => void;
}

export const ClassInsights: React.FC<ClassInsightsProps> = ({ onNavigate }) => {
  const [insights, setInsights] = useState<ClassInsightsData | null>(null);
  const [selectedSection, setSelectedSection] = useState(1);
  const [evidenceDrawerOpen, setEvidenceDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true);
      try {
        const data = await api.getClassInsights(selectedSection);
        setInsights(data);
      } catch (err) {
        console.error('Failed to load class insights', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, [selectedSection]);

  if (loading || !insights) {
    return <div className="p-8 text-center text-slate-400">Loading Formative Class Insights...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Top Banner with Section Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0B1B3A] border border-indigo-500/20 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">
              Formative Class Intelligence · TI02
            </span>
            <ProvenanceChip provenance={insights.provenance} note={insights.seeded_note} />
          </div>
          <h2 className="text-2xl font-bold text-white font-display">
            Outcome Mastery & Distribution Diagnostics
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Real-time evidence aggregation across live student submissions and baseline benchmark cohort.
          </p>
        </div>

        {/* Section Segmented Control */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setSelectedSection(1)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedSection === 1
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Section 5-A (57)
          </button>
          <button
            onClick={() => setSelectedSection(2)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedSection === 2
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Section 5-B (57)
          </button>
        </div>
      </div>

      {/* Main Class Insight Card (Headline numbers: 35 students / 61% weak) */}
      <ClassInsightCard
        insights={insights}
        onViewEvidence={() => setEvidenceDrawerOpen(true)}
        onOpenRecommendations={() => onNavigate('/teacher/recommendations')}
      />

      {/* Detailed Outcome Bar Chart with 50/70 Reference Lines */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <OutcomeBarChart
            items={insights.outcomes.map((o) => ({
              code: o.code,
              percent: o.class_mastery_percent,
              label: o.statement
            }))}
            title={`${insights.section.name} Formative Learning Outcome Distribution`}
          />
        </div>

        {/* Misconception Summary Rail (4 Cols) */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-[#0B1B3A] border border-indigo-500/25 space-y-4 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100">
                Dominant Error Pattern
              </h3>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 space-y-2 mb-3">
              <span className="text-xs font-bold text-rose-200 block">
                Output error applied directly to hidden weights
              </span>
              <p className="text-xs text-rose-100/90 leading-relaxed font-normal">
                29 students in this cohort bypassed the chain rule, assuming output error δ_out applies directly to hidden layer weights without recursive transpose matrix multiplication.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-xs text-slate-200 space-y-1">
              <span className="font-bold text-white block">Intervention Required:</span>
              <span className="text-slate-200">Remedial 10-minute recap focusing on the multivariate chain rule sensitivity term ∂L/∂w = δ · a.</span>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-700">
            <button
              onClick={() => setEvidenceDrawerOpen(true)}
              className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 transition-colors cursor-pointer"
            >
              Examine Full Response Evidence
            </button>
            <button
              onClick={() => onNavigate('/teacher/recommendations')}
              className="w-full py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-rose-600 hover:bg-rose-500 text-white transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            >
              <span>Review Remedial Segment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Evidence Drawer */}
      <EvidenceDrawer
        isOpen={evidenceDrawerOpen}
        onClose={() => setEvidenceDrawerOpen(false)}
      />
    </div>
  );
};
