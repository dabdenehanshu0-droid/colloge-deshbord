import React from 'react';
import { TutorChat } from '../../components/domain/TutorChat';
import { ProvenanceChip } from '../../components/ui/ProvenanceChip';
import { Bot, BookOpen, ShieldCheck } from 'lucide-react';

export const AiTutorPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0B1B3A] border border-indigo-500/20 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">
                Student Intelligence · T01
              </span>
              <ProvenanceChip provenance="MIXED" />
            </div>
            <h2 className="text-2xl font-bold text-white font-display">
              AI Academic Tutor (Course Grounded)
            </h2>
            <p className="text-xs text-slate-300">
              Grounded exclusively in SGSU Deep Learning Foundations materials · Zero ungrounded speculation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-300 bg-navy-950 px-3 py-1.5 rounded-xl border border-slate-800 self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Audited Academic Model</span>
        </div>
      </div>

      {/* Embedded Chat Container */}
      <TutorChat />
    </div>
  );
};
