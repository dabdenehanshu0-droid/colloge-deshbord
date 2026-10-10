import React, { useState, useEffect } from 'react';
import { api } from '../../services/apiClient';
import { Recommendation, ReteachSegment } from '../../types';
import { EvidenceDrawer } from '../../components/domain/EvidenceDrawer';
import { ProvenanceChip } from '../../components/ui/ProvenanceChip';
import { AiBadge } from '../../components/ui/AiBadge';
import { usePlatform } from '../../context/PlatformContext';
import { 
  Compass, 
  Sparkles, 
  CheckCircle2, 
  BarChart2, 
  Users, 
  Clock, 
  BookOpen, 
  HelpCircle,
  ArrowRight
} from 'lucide-react';

interface TeacherRecommendationsProps {
  onNavigate: (path: string) => void;
}

export const TeacherRecommendations: React.FC<TeacherRecommendationsProps> = ({ onNavigate }) => {
  const { showToast } = usePlatform();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isGeneratingSegment, setIsGeneratingSegment] = useState(false);
  const [activeSegment, setActiveSegment] = useState<ReteachSegment | null>(null);
  const [evidenceDrawerOpen, setEvidenceDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchRecs = async () => {
    try {
      const recList = await api.getClassRecommendations(1);
      setRecommendations(recList);
      if (recList.length > 0 && recList[0].segment) {
        setActiveSegment(recList[0].segment);
      }
    } catch (err) {
      console.error('Failed to load teacher recommendations', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecs();
  }, []);

  const handleGenerateSegment = async () => {
    setIsGeneratingSegment(true);
    try {
      const seg = await api.generateReteachSegment(1, 4);
      setActiveSegment(seg);
      showToast('10-Minute remedial re-teach segment synthesized by AI Gateway', 'success');
      fetchRecs();
    } catch (err: any) {
      showToast(err.message || 'Failed to generate segment', 'error');
    } finally {
      setIsGeneratingSegment(false);
    }
  };

  const handleAssignPractice = async () => {
    try {
      const res = await api.assignPractice(1, 4);
      showToast(`Targeted remedial practice assigned to ${res.assigned_count} students with LO4 deficits`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to assign practice', 'error');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading AI Recommendations...</div>;
  }

  const primaryRec = recommendations[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0B1B3A] border border-indigo-500/20 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">
              Teacher Intelligence · TI04 / TI05
            </span>
            <ProvenanceChip provenance="MIXED" />
          </div>
          <h2 className="text-2xl font-bold text-white font-display">
            Formative Remediation & AI Re-teach Assistance
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Closing the loop: Exit quiz evidence directly drives teaching intervention for Section 5-A.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <AiBadge mode="LIVE" label="Academic Gateway" />
        </div>
      </div>

      {/* Main Recommendation Card */}
      {primaryRec && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-rose-950/30 via-navy-900 to-[#071022] border border-rose-500/35 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-rose-500/20">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  RE-TEACH RECOMMENDATION · LO4
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Triggered by Section 5-A Exit Quiz
                </span>
              </div>
              <h3 className="text-xl font-bold text-white font-display">
                {primaryRec.title || 'Re-teach Backpropagation & Multivariate Chain Rule'}
              </h3>
            </div>

            {/* 3 Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleGenerateSegment}
                disabled={isGeneratingSegment}
                className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isGeneratingSegment ? 'Generating...' : 'Generate Re-teach Segment'}</span>
              </button>

              <button
                onClick={() => setEvidenceDrawerOpen(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
              >
                <BarChart2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>View Evidence</span>
              </button>

              <button
                onClick={handleAssignPractice}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 transition-colors flex items-center gap-1.5"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Assign Practice (35)</span>
              </button>
            </div>
          </div>

          {/* Rationale & Suggested Approach */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-navy-900/80 border border-slate-800 space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Why this recommendation?
              </span>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {primaryRec.why || "Low mastery detected from today's exit quiz. 35 students in Section 5-A failed the chain rule calculation."}
              </p>
              <div className="pt-2 text-xs text-rose-300 font-mono">
                Class Mastery: <strong>41%</strong> · Weak Threshold: <strong>&lt;50%</strong>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-navy-900/80 border border-slate-800 space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Suggested Pedagogical Approach:
              </span>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {primaryRec.suggested_approach || "Use a simple worked example showing how error propagates from output to hidden layers."}
              </p>
              <div className="pt-2 text-xs text-indigo-300 font-mono">
                Duration: <strong>10 Minutes</strong> · Mode: Interactive Walkthrough
              </div>
            </div>
          </div>

          {/* Rendered 10-Minute Re-teach Segment (if generated) */}
          {activeSegment && (
            <div className="p-6 rounded-2xl bg-navy-950 border border-indigo-500/30 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <h4 className="text-sm font-bold text-white font-display">
                    {activeSegment.title}
                  </h4>
                </div>
                <AiBadge mode="LIVE" label="AI-Drafted Remedial Segment" />
              </div>

              {/* Minute Outline */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  10-Minute Activity Breakdown:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {activeSegment.outline.map((o, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                      <span className="text-xs font-mono font-bold text-indigo-400 block mb-1">
                        {o.minute_range}
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {o.activity}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Worked Example */}
              <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/25 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 block">
                  Step-by-Step Worked Demonstration:
                </span>
                <p className="text-xs text-slate-300 font-medium">{activeSegment.worked_example.setup}</p>
                <div className="space-y-1.5 pt-1">
                  {activeSegment.worked_example.steps.map((st, i) => (
                    <div key={i} className="text-xs font-mono text-slate-200 p-2 rounded bg-navy-900 border border-slate-800">
                      {st}
                    </div>
                  ))}
                </div>
                <div className="pt-2 text-xs text-emerald-300 font-medium">
                  <strong>Core Takeaway:</strong> {activeSegment.worked_example.takeaway}
                </div>
              </div>

              {/* 2 Quick Check Items */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Formative Verification Check Items (2):
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {activeSegment.check_items.map((ci, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1.5">
                      <span className="font-bold text-white block">Item {idx + 1}: {ci.stem}</span>
                      <div className="text-[11px] text-emerald-400 font-mono">
                        Key: {ci.answer}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Evidence Drawer */}
      <EvidenceDrawer
        isOpen={evidenceDrawerOpen}
        onClose={() => setEvidenceDrawerOpen(false)}
      />
    </div>
  );
};
