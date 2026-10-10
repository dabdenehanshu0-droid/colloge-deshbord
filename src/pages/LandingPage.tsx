import React from 'react';
import { IntelligenceLoop } from '../components/ui/IntelligenceLoop';
import { 
  GraduationCap, 
  Presentation, 
  UserCheck, 
  Building2, 
  Database, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Cpu
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (path: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-[#071022] text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Top Navigation */}
      <header className="h-20 border-b border-indigo-500/20 bg-[#0B1B3A]/80 backdrop-blur-md sticky top-0 z-40 px-6 sm:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold font-display shadow-lg shadow-indigo-950">
            SG
          </div>
          <div>
            <h1 className="font-bold text-base sm:text-lg text-white font-display leading-tight">
              Scope Global Skills University
            </h1>
            <span className="text-xs font-mono text-indigo-300">
              AI-Native University Platform · Academic Conference Demonstrator
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('/demo')}
            className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-500/30 transition-all flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Run Guided 8-Step Demo</span>
            <span className="sm:hidden">Demo</span>
          </button>
          <button
            onClick={() => onNavigate('/login')}
            className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-950/50 flex items-center gap-2"
          >
            <span>Enter Platform</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 sm:py-24 px-6 sm:px-12 max-w-7xl mx-auto w-full text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 mb-6">
          <Cpu className="w-3.5 h-3.5 text-indigo-400" />
          <span>Continuous Learning Outcome Tracking Architecture</span>
        </div>

        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white font-display tracking-tight leading-tight max-w-4xl mx-auto mb-6">
          "One answer from one student did not stay inside a quiz. It became evidence."
        </h2>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed mb-10">
          Imagine a B.Tech AI classroom where the university does not just deliver content — it continuously understands what students are learning and uses that evidence to improve teaching.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => onNavigate('/login')}
            className="px-8 py-3.5 rounded-xl text-sm font-bold uppercase tracking-wider bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-950/50 transition-all flex items-center gap-2.5"
          >
            <span>Launch Platform (Teacher / Student / Admin)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigate('/demo')}
            className="px-6 py-3.5 rounded-xl text-sm font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Step-by-Step Conference Flow</span>
          </button>
        </div>
      </section>

      {/* 4 Layers on Platform Core Architecture Diagram (Build Plan §4) */}
      <section className="py-12 px-6 sm:px-12 max-w-7xl mx-auto w-full">
        <div className="text-center mb-10">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">
            PLATFORM ARCHITECTURE
          </span>
          <h3 className="text-2xl sm:text-3xl font-bold text-white font-display mt-1">
            Four Connected Experiences on One Platform Core
          </h3>
          <p className="text-sm text-slate-400 mt-1 max-w-xl mx-auto">
            No layer calls another layer. They all read and write the exact same learning outcome evidence model.
          </p>
        </div>

        {/* The 4 Connected Layer Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Layer 1: Teacher Studio */}
          <div className="p-5 rounded-2xl bg-navy-900/80 border border-slate-800 hover:border-indigo-500/40 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-3">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="text-xs font-mono text-indigo-400 uppercase font-bold">Layer 1</div>
            <h4 className="text-base font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
              AI Teacher Studio
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Curriculum anchoring, structured lesson generation, human review/approval gate, and re-teach recommendations.
            </p>
          </div>

          {/* Layer 2: Smart Classroom */}
          <div className="p-5 rounded-2xl bg-navy-900/80 border border-slate-800 hover:border-indigo-500/40 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center mb-3">
              <Presentation className="w-5 h-5" />
            </div>
            <div className="text-xs font-mono text-emerald-400 uppercase font-bold">Layer 2</div>
            <h4 className="text-base font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">
              AI Smart Classroom
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Live presenter mode, slide sync, instant concept polls, student QR join, and 5-question exit quiz.
            </p>
          </div>

          {/* Layer 3: Student Intelligence */}
          <div className="p-5 rounded-2xl bg-navy-900/80 border border-slate-800 hover:border-indigo-500/40 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center mb-3">
              <UserCheck className="w-5 h-5" />
            </div>
            <div className="text-xs font-mono text-amber-400 uppercase font-bold">Layer 3</div>
            <h4 className="text-base font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">
              Student Intelligence
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Deterministic mastery tracking, "Your Learning Gap" panel, targeted remedial practice, and grounded AI tutor.
            </p>
          </div>

          {/* Layer 4: University Intelligence */}
          <div className="p-5 rounded-2xl bg-navy-900/80 border border-slate-800 hover:border-indigo-500/40 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center mb-3">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="text-xs font-mono text-violet-400 uppercase font-bold">Layer 4</div>
            <h4 className="text-base font-bold text-white mb-2 group-hover:text-violet-300 transition-colors">
              University Intelligence
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Multi-section aggregated recurring gaps (58% on LO4), prerequisite deficit analytics, and AI governance audit.
            </p>
          </div>
        </div>

        {/* Platform Core Foundation Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-navy-900 via-indigo-950/60 to-navy-900 border border-indigo-500/30 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-indigo-300 mb-2">
            <Database className="w-4 h-4 text-indigo-400" />
            <span>Platform Core (One Unified Evidence Model)</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Curriculum Graph · Lesson & Content · Assessment Engine · Evidence Store · Learner Model · Recommendation Engine · AI Gateway · Analytics & Governance
          </p>
        </div>
      </section>

      {/* Intelligence Loop Visualization */}
      <section className="py-12 px-6 sm:px-12 max-w-7xl mx-auto w-full">
        <IntelligenceLoop onStepSelect={(step) => onNavigate('/demo')} />
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 py-8 px-6 sm:px-12 bg-[#0B1B3A]/40 text-center text-xs text-slate-400">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            Scope Global Skills University (SGSU) AI-Native Platform Demonstrator
          </div>
          <div className="text-violet-400 font-mono">
            DEMONSTRATION DATA CHIP: Seeded cohort (114 enrolled) + Live student (Riya Sharma)
          </div>
        </div>
      </footer>
    </div>
  );
};
