import React, { useState, useEffect } from 'react';
import { api } from '../../services/apiClient';
import { SkillPassportData } from '../../types';
import { ProvenanceChip } from '../../components/ui/ProvenanceChip';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { 
  Award, 
  Briefcase, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  ArrowRight,
  TrendingUp,
  BrainCircuit
} from 'lucide-react';

export const SkillPassportPage: React.FC = () => {
  const [passport, setPassport] = useState<SkillPassportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPassport = async () => {
      try {
        const data = await api.getSkillPassport(101);
        setPassport(data);
      } catch (err) {
        console.error('Failed to load skill passport', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPassport();
  }, []);

  if (loading || !passport) {
    return <div className="p-8 text-center text-slate-400">Loading Skill Passport Profile...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0B1B3A] border border-indigo-500/20 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">
                Institutional Skill Passport · SK01
              </span>
              <ProvenanceChip provenance={passport.provenance} />
            </div>
            <h2 className="text-2xl font-bold text-white font-display">
              {passport.profile}
            </h2>
            <p className="text-xs text-slate-300">
              Verified competency transcript directly synchronized with classroom evidence
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-300 bg-navy-950 px-3.5 py-2 rounded-xl border border-slate-800 self-start sm:self-auto">
          <BrainCircuit className="w-4 h-4 text-indigo-400" />
          <span>Real-Time Evidence Integration</span>
        </div>
      </div>

      {/* Career Pathway & Recommended Next Skill Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-navy-900 border border-indigo-500/30 flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 shrink-0">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase font-bold text-indigo-400 block mb-0.5">
              TARGET CAREER DIRECTION
            </span>
            <h4 className="text-base font-bold text-white font-display">
              {passport.career_direction}
            </h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Curriculum progression aligns with AI engineering and deep learning systems architecture standards.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-violet-950/40 to-navy-900 border border-violet-500/30 flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-violet-600/20 text-violet-400 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase font-bold text-violet-400 block mb-0.5">
              RECOMMENDED NEXT COMPETENCY
            </span>
            <h4 className="text-base font-bold text-white font-display">
              {passport.recommended_next_skill}
            </h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Once LO4 Backpropagation reaches Strong mastery, self-attention and transformer blocks unlock in Semester 6.
            </p>
          </div>
        </div>
      </div>

      {/* Verified Skills Transcript Table */}
      <div className="p-6 rounded-2xl bg-navy-900/80 border border-slate-800 space-y-4 shadow-lg">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
          Competency Transcript & Evidence Source
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                <th className="py-3 px-4">SKILL DOMAIN</th>
                <th className="py-3 px-4">VERIFIED LEVEL</th>
                <th className="py-3 px-4">ORIGIN</th>
                <th className="py-3 px-4 text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {passport.skills.map((skill, index) => {
                const isDerived = skill.source === 'DERIVED';
                const isRec = skill.level === 'RECOMMENDED_NEXT';

                return (
                  <tr key={index} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {skill.name}
                    </td>
                    <td className="py-3.5 px-4">
                      {isRec ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-violet-500/20 text-violet-300 border border-violet-500/30">
                          Recommended Next
                        </span>
                      ) : (
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono ${
                            skill.level === 'STRONG'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {skill.level}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      {isDerived ? (
                        <span className="text-indigo-400 font-bold">Live Evidence Model</span>
                      ) : (
                        <span>Demonstration Seed</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Verified</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Evidence Trail */}
      <div className="p-6 rounded-2xl bg-navy-900/60 border border-slate-800 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Underlying Verified Evidence Trail
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {passport.evidence.map((ev, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
              <span className="font-semibold text-white block mb-1">{ev.label}</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">{ev.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
