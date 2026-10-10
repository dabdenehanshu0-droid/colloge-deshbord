import React from 'react';
import { X, BarChart2, CheckCircle2, AlertTriangle, Users } from 'lucide-react';

interface EvidenceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  evidenceData?: any;
}

export const EvidenceDrawer: React.FC<EvidenceDrawerProps> = ({
  isOpen,
  onClose,
  evidenceData
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-xl bg-[#0B1B3A] border-l border-indigo-500/30 text-white h-full shadow-2xl overflow-y-auto p-6 z-10 animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <BarChart2 className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold font-display">
              Formative Evidence & Misconception Breakdown
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-6">
          {/* Cohort Provenance Banner */}
          <div className="p-3.5 rounded-xl bg-violet-500/10 border border-violet-500/25 flex items-center justify-between text-xs">
            <span className="text-violet-300 font-medium">
              Data Sample: 1 Live Student (Riya) + 56 Seeded Benchmarks
            </span>
            <span className="font-mono text-violet-400 font-bold">57 RESPONDENTS</span>
          </div>

          {/* Top Misconceptions */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Diagnosed Student Misconceptions</span>
            </h4>
            <div className="space-y-2.5">
              <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/35">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-rose-300">
                    Direct Output Error Application
                  </span>
                  <span className="text-xs font-mono font-bold bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded">
                    29 Students (51%)
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Students applied the final output layer loss directly to hidden layers without multiplying by the downstream weight matrix transpose Wᵀ.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/35">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-amber-300">
                    Hidden Layer Activation Independence
                  </span>
                  <span className="text-xs font-mono font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">
                    28 Students (49%)
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Students assumed that preceding layer weight updates operate independently of hidden-layer activation slope saturation σ'(z) = 0.
                </p>
              </div>
            </div>
          </div>

          {/* Option Distribution */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
              Itemized Question Response Distribution (LO4)
            </h4>

            {/* Q4 */}
            <div className="p-4 rounded-xl bg-navy-900/90 border border-slate-800 mb-4">
              <div className="text-xs font-mono font-bold text-indigo-400 mb-1">
                QUESTION 4 · WEIGHT GRADIENT CALCULATION
              </div>
              <p className="text-xs text-white font-medium mb-3">
                During backpropagation, how is the weight gradient ∂L/∂w_ij mathematically derived?
              </p>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>A: By multiplying error δ_j with activation a_i (Correct)</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-400">22 votes (39%)</span>
                </div>

                <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-rose-500/15 border border-rose-500/35">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-rose-500 flex items-center justify-center text-[10px] text-white">✕</span>
                    <span>B: Output error applied directly (Misconception)</span>
                  </div>
                  <span className="font-mono font-bold text-rose-300">29 votes (51%)</span>
                </div>

                <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-800/60 text-slate-400">
                  <span>C: By adding learning rate to activation</span>
                  <span className="font-mono">4 votes (7%)</span>
                </div>
                <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-800/60 text-slate-400">
                  <span>D: By calculating forward loss variance</span>
                  <span className="font-mono">2 votes (3%)</span>
                </div>
              </div>
            </div>

            {/* Q5 */}
            <div className="p-4 rounded-xl bg-navy-900/90 border border-slate-800">
              <div className="text-xs font-mono font-bold text-indigo-400 mb-1">
                QUESTION 5 · SATURATION & VANISHING GRADIENT
              </div>
              <p className="text-xs text-white font-medium mb-3">
                If a hidden neuron enters saturation σ'(z) ≈ 0, what happens to gradients for preceding layers?
              </p>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>B: The gradient vanishes along that path (Correct)</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-400">22 votes (39%)</span>
                </div>

                <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-rose-500/15 border border-rose-500/35">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-rose-500 flex items-center justify-center text-[10px] text-white">✕</span>
                    <span>C: Preceding layers update normally (Misconception)</span>
                  </div>
                  <span className="font-mono font-bold text-rose-300">28 votes (49%)</span>
                </div>

                <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-800/60 text-slate-400">
                  <span>A: The weight update rate doubles</span>
                  <span className="font-mono">3 votes (5%)</span>
                </div>
                <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-800/60 text-slate-400">
                  <span>D: Optimizer resets weights to uniform</span>
                  <span className="font-mono">4 votes (7%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
