import React, { useState, useEffect } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { api } from '../../services/apiClient';
import { Role } from '../../types';
import { IntelligenceLoop } from '../../components/ui/IntelligenceLoop';
import { ProvenanceChip } from '../../components/ui/ProvenanceChip';
import { 
  Sparkles, 
  RotateCcw, 
  CheckCircle2, 
  ArrowRight, 
  ExternalLink,
  Zap,
  Play,
  RotateCw,
  Layers,
  GraduationCap
} from 'lucide-react';

interface DemoRunnerPageProps {
  onNavigate: (path: string) => void;
}

export const DemoRunnerPage: React.FC<DemoRunnerPageProps> = ({ onNavigate }) => {
  const { role, switchRole, demoState, refreshDemoState, resetDemo, isResetting, showToast } = usePlatform();
  const [isAutofilling, setIsAutofilling] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const handleGoToStep = async (step: any) => {
    let targetRole: Role = 'TEACHER';
    if (step.actionLink.startsWith('/student')) {
      targetRole = 'STUDENT';
    } else if (step.actionLink.startsWith('/admin')) {
      targetRole = 'ADMIN';
    } else if (step.actionLink.startsWith('/teacher')) {
      targetRole = 'TEACHER';
    }
    if (role !== targetRole) {
      await switchRole(targetRole);
    }
    onNavigate(step.actionLink);
  };

  useEffect(() => {
    refreshDemoState();
    const interval = setInterval(refreshDemoState, 2000);
    return () => clearInterval(interval);
  }, [refreshDemoState]);

  const handleAutofillQuiz = async () => {
    setIsAutofilling(true);
    try {
      await api.autofillScriptedQuiz();
      refreshDemoState();
      showToast('Autofilled scripted exit quiz: Q1–Q3 correct, Q4–Q5 wrong -> LO4 drops to 41%', 'success');
    } catch (err: any) {
      showToast(err.message || 'Error autofilling quiz', 'error');
    } finally {
      setIsAutofilling(false);
    }
  };

  const completedCount = demoState.steps.filter((s) => s.done).length;

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-navy-900 via-[#0B1B3A] to-indigo-950/80 border border-indigo-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/15 px-2.5 py-0.5 rounded border border-indigo-500/30">
              CONFERENCE DEMONSTRATOR RUNNER · §21 / §28
            </span>
            <ProvenanceChip provenance="MIXED" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            Full 8-Step Architectural Demonstration
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Follow the scripted conference demonstration from Lecture Generation to Smart Classroom, Student Exit Quiz, Mastery Computation, Remediation, and University Governance.
          </p>
        </div>

        {/* Master Actions (Autofill, Reset) */}
        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
          <button
            onClick={handleAutofillQuiz}
            disabled={isAutofilling}
            className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white transition-all shadow-md flex items-center gap-2"
            title="Simulate the live student submitting the scripted 5-question quiz"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>{isAutofilling ? 'Autofilling...' : 'Autofill Scripted Quiz (D03)'}</span>
          </button>

          <button
            onClick={() => setShowResetModal(true)}
            disabled={isResetting}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span>Reset Demo (D01)</span>
          </button>
        </div>
      </div>

      {/* 8-Node Continuous Intelligence Loop Visualizer */}
      <IntelligenceLoop onStepSelect={(step) => {
        const found = demoState.steps.find((s) => s.n === step);
        if (found) handleGoToStep(found);
      }} />

      {/* Step Tracker (STEP n / 8) */}
      <div className="p-6 rounded-2xl bg-navy-900/80 border border-slate-800 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">
              PROGRESS TRACKER
            </span>
            <h3 className="text-xl font-bold text-white font-display">
              Demonstration Stages: STEP {demoState.current_step} of 8
            </h3>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-indigo-300 bg-navy-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <span>{completedCount} / 8 Completed</span>
          </div>
        </div>

        {/* 8 Guided Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {demoState.steps.map((step) => (
            <div
              key={step.n}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                step.done
                  ? 'bg-navy-900/90 border-indigo-500/40 shadow-sm'
                  : step.n === demoState.current_step
                  ? 'bg-gradient-to-br from-indigo-950/40 to-navy-900 border-indigo-500 ring-2 ring-indigo-500/20'
                  : 'bg-slate-900/40 border-slate-800/80 text-slate-400'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold ${
                        step.done
                          ? 'bg-emerald-600 text-white'
                          : step.n === demoState.current_step
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {step.n}
                    </span>
                    <h4 className="text-sm font-bold text-white font-display">
                      {step.label}
                    </h4>
                  </div>

                  {step.done ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>VERIFIED</span>
                    </span>
                  ) : step.n === demoState.current_step ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-indigo-300 bg-indigo-500/15 px-2 py-0.5 rounded border border-indigo-500/30">
                      <span>NEXT ACTION</span>
                    </span>
                  ) : (
                    <span className="text-[11px] font-mono text-slate-400">PENDING</span>
                  )}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {step.detail}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">
                  Target View: {step.actionLink}
                </span>

                <button
                  onClick={() => handleGoToStep(step)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    step.done
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                  }`}
                >
                  <span>Go to Step {step.n}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation Modal for Reset */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[#0B1B3A] border border-indigo-500/30 rounded-2xl p-6 shadow-2xl text-left">
            <h3 className="text-lg font-bold text-white font-display mb-2">
              Restore Demonstration Seed Data?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
              This will reset all dynamically generated sessions, student quiz submissions, evidence logs, and recommendations back to the initial conference benchmark state.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setShowResetModal(false);
                  await resetDemo();
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-rose-600 hover:bg-rose-500 text-white transition-colors shadow-sm"
              >
                Reset Data Benchmark
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
