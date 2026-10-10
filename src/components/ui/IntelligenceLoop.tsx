import React from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { 
  BookOpen, 
  Users, 
  FileCheck2, 
  BrainCircuit, 
  Compass, 
  GraduationCap, 
  Building2, 
  RotateCw,
  CheckCircle2
} from 'lucide-react';

interface IntelligenceLoopProps {
  compact?: boolean;
  className?: string;
  onStepSelect?: (stepNumber: number) => void;
}

interface LoopNode {
  id: number;
  key: keyof ReturnType<typeof usePlatform>['demoState']['loop'];
  label: string;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NODES: LoopNode[] = [
  { id: 1, key: 'teach', label: '1. TEACH', sub: 'Generate, Review & Approve', icon: BookOpen },
  { id: 2, key: 'learn', label: '2. LEARN', sub: 'Smart Classroom & Polling', icon: Users },
  { id: 3, key: 'assess', label: '3. ASSESS', sub: 'Outcome-Tagged Exit Quiz', icon: FileCheck2 },
  { id: 4, key: 'understand', label: '4. UNDERSTAND', sub: 'Deterministic Evidence Model', icon: BrainCircuit },
  { id: 5, key: 'personalize', label: '5. PERSONALIZE', sub: 'Gap Recap, Practice & Tutor', icon: Compass },
  { id: 6, key: 'support_teacher', label: '6. SUPPORT TEACHER', sub: 'Class Insights & Re-teach', icon: GraduationCap },
  { id: 7, key: 'inform_university', label: '7. INFORM UNIVERSITY', sub: 'Multi-Section Recurring Gaps', icon: Building2 },
  { id: 8, key: 'improve', label: '8. IMPROVE', sub: 'Closed-Loop Next Lesson', icon: RotateCw },
];

export const IntelligenceLoop: React.FC<IntelligenceLoopProps> = ({
  compact = false,
  className = '',
  onStepSelect
}) => {
  const { demoState } = usePlatform();
  const loop = demoState.loop;

  if (compact) {
    return (
      <div className={`p-4 rounded-xl bg-navy-900/80 border border-indigo-500/20 ${className}`}>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <RotateCw className="w-4 h-4 text-indigo-400" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              The Continuous Intelligence Loop
            </h4>
          </div>
          <span className="text-[11px] font-mono text-indigo-400">
            {Object.values(loop).filter(Boolean).length}/8 Active
          </span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {NODES.map((node) => {
            const isCompleted = loop[node.key];
            const Icon = node.icon;
            return (
              <div
                key={node.id}
                onClick={() => onStepSelect?.(node.id)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg text-center cursor-pointer transition-all duration-200 border ${
                  isCompleted
                    ? 'bg-indigo-950/60 border-indigo-500/40 text-indigo-200 shadow-sm'
                    : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className={`p-1.5 rounded-md mb-1.5 ${isCompleted ? 'bg-indigo-600/30 text-indigo-300' : 'bg-slate-800 text-slate-400'}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-bold tracking-tight truncate w-full">{node.label.replace(/^\d+\.\s*/, '')}</span>
                {isCompleted ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 mt-1" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600 mt-1.5" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-[#0B1B3A]/90 to-[#071022]/90 border border-indigo-500/25 shadow-2xl relative overflow-hidden ${className}`}>
      {/* Subtle background glow */}
      <div className="absolute -top-24 -left-24 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 mb-2">
            <RotateCw className="w-3.5 h-3.5" />
            <span>Closed-Loop Academic Architecture</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-display text-white">
            One Learning Outcome · One Shared Evidence Model · Four Connected Experiences
          </h3>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Every slide, live poll, quiz answer, and practice exercise carries an outcome ID. The system dynamically updates teacher insights, student remediation, and university governance.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-navy-950/80 px-4 py-2.5 rounded-xl border border-indigo-500/20">
          <div className="text-right">
            <div className="text-[11px] uppercase tracking-wider text-slate-400">Loop Status</div>
            <div className="text-sm font-bold text-indigo-400 font-mono">
              {Object.values(loop).filter(Boolean).length} / 8 Nodes Verified
            </div>
          </div>
        </div>
      </div>

      {/* 8-Node Process Flow Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {NODES.map((node) => {
          const isCompleted = loop[node.key];
          const Icon = node.icon;
          return (
            <div
              key={node.id}
              onClick={() => onStepSelect?.(node.id)}
              className={`p-4 rounded-xl border transition-all duration-300 relative group cursor-pointer ${
                isCompleted
                  ? 'bg-navy-900/90 border-indigo-500/40 shadow-lg shadow-indigo-950/50 hover:border-indigo-400'
                  : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                    isCompleted
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                {isCompleted ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Live</span>
                  </span>
                ) : (
                  <span className="text-[11px] font-mono text-slate-400">Step {node.id}</span>
                )}
              </div>

              <div className="text-sm font-bold text-white mb-1 group-hover:text-indigo-300 transition-colors">
                {node.label}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {node.sub}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
