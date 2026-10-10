import React from 'react';
import { AlertCircle, ArrowRight, BrainCircuit, Compass, MessageSquareText } from 'lucide-react';
import { Recommendation } from '../../types';

interface GapPanelProps {
  recommendation: Recommendation;
  onStartPractice?: () => void;
  onOpenTutor?: () => void;
  onViewEvidence?: () => void;
  className?: string;
}

export const GapPanel: React.FC<GapPanelProps> = ({
  recommendation,
  onStartPractice,
  onOpenTutor,
  onViewEvidence,
  className = ''
}) => {
  return (
    <div className={`p-6 rounded-2xl bg-gradient-to-br from-rose-950/40 via-navy-900/90 to-[#071022] border border-rose-500/35 shadow-xl relative overflow-hidden ${className}`}>
      {/* Visual Accent */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-rose-500/20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-rose-400">
              Personalized Learning Gap Detected · LO4
            </span>
            <h3 className="text-lg font-bold text-white font-display">
              {recommendation.title || 'Backpropagation & Chain Rule Sensitivity'}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            Mastery: {recommendation.mastery_percent ?? 41}% · Needs Attention
          </span>
        </div>
      </div>

      {/* 3-Part Explanation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* 1. What happened? */}
        <div className="p-4 rounded-xl bg-navy-900/80 border border-slate-800">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
            <BrainCircuit className="w-3.5 h-3.5 text-indigo-400" />
            <span>What happened?</span>
          </div>
          <p className="text-sm text-slate-200 leading-relaxed">
            {recommendation.what_happened ||
              'You had difficulty calculating the gradient with respect to hidden-layer weights during the exit quiz, treating output error as directly transferable without chain-rule projection.'}
          </p>
        </div>

        {/* 2. Why am I seeing this? */}
        <div className="p-4 rounded-xl bg-navy-900/80 border border-slate-800">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>Why am I seeing this?</span>
          </div>
          <p className="text-sm text-slate-200 leading-relaxed">
            {recommendation.why_seen || "Based on your answers in today's exit quiz."}
          </p>
          {onViewEvidence && (
            <button
              onClick={onViewEvidence}
              className="mt-2 text-xs font-medium text-indigo-400 hover:text-indigo-300 underline inline-flex items-center gap-1"
            >
              <span>See my answers & evidence</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* 3. Recommended Next Steps (Build Plan §11) */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
          Recommended Next Steps
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Step 1: 2-minute recap */}
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-mono text-indigo-400 font-bold block mb-1">
                STEP 1
              </span>
              <div className="text-sm font-semibold text-white mb-1">
                2-Minute Concept Recap
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Review ∂L/∂w = δ · a and transpose error projection.
              </p>
            </div>
          </div>

          {/* Step 2: 3 practice questions */}
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-mono text-amber-400 font-bold block mb-1">
                STEP 2
              </span>
              <div className="text-sm font-semibold text-white mb-1">
                3 Practice Questions
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Targeted questions calibrated to address your exact misconception.
              </p>
            </div>
            {onStartPractice && (
              <button
                onClick={onStartPractice}
                className="mt-3 w-full py-1.5 px-3 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>Take Practice (3)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Step 3: Ask AI Tutor */}
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-mono text-emerald-400 font-bold block mb-1">
                STEP 3
              </span>
              <div className="text-sm font-semibold text-white mb-1">
                Ask AI Academic Tutor
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                "Explain backpropagation simply using SGSU course material."
              </p>
            </div>
            {onOpenTutor && (
              <button
                onClick={onOpenTutor}
                className="mt-3 w-full py-1.5 px-3 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
              >
                <MessageSquareText className="w-3.5 h-3.5 text-indigo-400" />
                <span>Chat with Tutor</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
