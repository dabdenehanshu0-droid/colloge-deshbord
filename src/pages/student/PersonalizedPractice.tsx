import React, { useState, useEffect } from 'react';
import { api } from '../../services/apiClient';
import { StudentQuestion, QuizResult } from '../../types';
import { QuizRunner } from '../../components/domain/QuizRunner';
import { ResultSummary } from '../../components/domain/ResultSummary';
import { ProvenanceChip } from '../../components/ui/ProvenanceChip';
import { usePlatform } from '../../context/PlatformContext';
import { 
  Compass, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  BrainCircuit,
  TrendingUp
} from 'lucide-react';

interface PersonalizedPracticeProps {
  onNavigate: (path: string) => void;
}

export const PersonalizedPractice: React.FC<PersonalizedPracticeProps> = ({ onNavigate }) => {
  const { showToast } = usePlatform();
  const [practiceSet, setPracticeSet] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const set = await api.generatePractice(4);
      setPracticeSet(set);
      showToast('3 Targeted practice questions generated for LO4 Backpropagation', 'success');
    } catch (err: any) {
      showToast(err.message || 'Error generating practice', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePracticeSubmit = async (answers: any) => {
    const res = await api.submitQuiz('PRACTICE', answers, 101);
    setResult(res);
    showToast('Practice completed! LO4 Backpropagation mastery calibrated to Strong (76%)', 'success');
    return res;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0B1B3A] border border-indigo-500/20 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">
              Personalized Learning Path · LO4
            </span>
            <ProvenanceChip provenance="LIVE" />
          </div>
          <h2 className="text-2xl font-bold text-white font-display">
            Targeted Remedial Practice · Backpropagation
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Calibrated practice to resolve diagnosed misconceptions regarding hidden-layer activation derivatives.
          </p>
        </div>

        {!practiceSet && !result && (
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white transition-colors flex items-center gap-2 shadow-sm self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isGenerating ? 'Synthesizing 3 Questions...' : 'Generate Practice (3)'}</span>
          </button>
        )}
      </div>

      {/* Gap Context Box */}
      {!result && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-950/30 via-navy-900 to-navy-900 border border-rose-500/35 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-rose-400 block mb-0.5">
                Current LO4 Status: 41% · Needs Attention
              </span>
              <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                Completing this 3-question set will verify your comprehension of the chain rule error term δ_j and recalculate your mastery.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/25 shrink-0">
            <TrendingUp className="w-4 h-4" />
            <span>Expected Delta: +35%</span>
          </div>
        </div>
      )}

      {/* Main Practice Runner vs Result vs Empty */}
      {result ? (
        <ResultSummary
          result={result}
          onGoToDashboard={() => onNavigate('/student')}
        />
      ) : practiceSet ? (
        <QuizRunner
          questions={practiceSet.questions}
          context="PRACTICE"
          onSubmit={handlePracticeSubmit}
          onGoToDashboard={() => onNavigate('/student')}
        />
      ) : (
        <div className="p-12 text-center rounded-2xl bg-navy-900/60 border border-dashed border-slate-800 space-y-4">
          <Compass className="w-10 h-10 text-indigo-400 mx-auto" />
          <h3 className="text-base font-bold text-white font-display">
            Ready to Clear Your Learning Gap?
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Click the button below to generate 3 targeted multiple-choice items focused directly on multivariate backpropagation calculations.
          </p>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md"
          >
            Start Remedial Practice
          </button>
        </div>
      )}
    </div>
  );
};
