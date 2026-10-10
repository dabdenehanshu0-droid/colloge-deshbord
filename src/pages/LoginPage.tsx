import React, { useState } from 'react';
import { Role } from '../types';
import { usePlatform } from '../context/PlatformContext';
import { GraduationCap, User, ShieldCheck, ArrowRight, Sparkles, Building2 } from 'lucide-react';
import { ProvenanceChip } from '../components/ui/ProvenanceChip';

interface LoginPageProps {
  onNavigate: (path: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { switchRole } = usePlatform();
  const [loadingRole, setLoadingRole] = useState<Role | null>(null);

  const handleSelectRole = async (role: Role) => {
    setLoadingRole(role);
    try {
      await switchRole(role);
      if (role === 'TEACHER') onNavigate('/teacher');
      else if (role === 'STUDENT') onNavigate('/student');
      else if (role === 'ADMIN') onNavigate('/admin');
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#071022] text-slate-100 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl bg-gradient-to-b from-[#0B1B3A] to-[#071022] border border-indigo-500/25 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10">
        {/* University Header */}
        <div className="text-center pb-6 border-b border-slate-800">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-xl font-display mx-auto mb-3 shadow-lg shadow-indigo-950">
            SGSU
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
            Scope Global Skills University
          </h2>
          <p className="text-xs text-indigo-300 font-mono mt-1">
            AI-Native Platform · Conference Demonstrator Access
          </p>
          <div className="mt-2">
            <ProvenanceChip provenance="MIXED" />
          </div>
        </div>

        {/* Instructions */}
        <div className="py-6 text-center">
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
            Select a verified demonstration persona to enter the platform. Each persona connects directly to the shared learning outcome evidence model.
          </p>
        </div>

        {/* 3 Role Selection Cards */}
        <div className="space-y-3.5 mb-6">
          {/* Teacher Card */}
          <button
            onClick={() => handleSelectRole('TEACHER')}
            disabled={loadingRole !== null}
            className="w-full p-4 rounded-2xl bg-navy-900/80 hover:bg-navy-800 border border-indigo-500/30 hover:border-indigo-400 text-left transition-all duration-200 group flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                    Dr. Aarav Mehta
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    TEACHER
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Course Coordinator · CS-501 Artificial Intelligence · Section 5-A
                </p>
              </div>
            </div>
            {loadingRole === 'TEACHER' ? (
              <span className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin shrink-0" />
            ) : (
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
            )}
          </button>

          {/* Student Card */}
          <button
            onClick={() => handleSelectRole('STUDENT')}
            disabled={loadingRole !== null}
            className="w-full p-4 rounded-2xl bg-navy-900/80 hover:bg-navy-800 border border-indigo-500/30 hover:border-indigo-400 text-left transition-all duration-200 group flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <User className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                    Riya Sharma
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    LIVE STUDENT
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  B.Tech CSE Semester 5 · Roll #2024-AI-101 · Live Evidence Contributor
                </p>
              </div>
            </div>
            {loadingRole === 'STUDENT' ? (
              <span className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin shrink-0" />
            ) : (
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
            )}
          </button>

          {/* Academic Admin Card */}
          <button
            onClick={() => handleSelectRole('ADMIN')}
            disabled={loadingRole !== null}
            className="w-full p-4 rounded-2xl bg-navy-900/80 hover:bg-navy-800 border border-indigo-500/30 hover:border-indigo-400 text-left transition-all duration-200 group flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center shrink-0 group-hover:bg-violet-600 group-hover:text-white transition-colors">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white group-hover:text-violet-300 transition-colors">
                    Prof. Sunita Rao
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                    ACADEMIC ADMIN
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Dean of Academics · Multi-Section Aggregates & Curriculum Governance
                </p>
              </div>
            </div>
            {loadingRole === 'ADMIN' ? (
              <span className="w-4 h-4 border-2 border-violet-400 border-t-transparent rounded-full animate-spin shrink-0" />
            ) : (
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
            )}
          </button>
        </div>

        {/* Demo Fast-Track Link */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <button
            onClick={() => onNavigate('/')}
            className="hover:text-white transition-colors"
          >
            ← Back to Overview
          </button>

          <button
            onClick={() => onNavigate('/demo')}
            className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Launch 8-Step Runner</span>
          </button>
        </div>
      </div>
    </div>
  );
};
