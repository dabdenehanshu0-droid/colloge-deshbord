import React, { useState } from 'react';
import { Role } from '../types';
import { usePlatform } from '../context/PlatformContext';
import { api } from '../services/apiClient';
import { 
  GraduationCap, 
  User, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  Building2, 
  IdCard,
  LogIn,
  KeyRound,
  CheckCircle2
} from 'lucide-react';
import { ProvenanceChip } from '../components/ui/ProvenanceChip';

interface LoginPageProps {
  onNavigate: (path: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { switchRole, showToast } = usePlatform();
  const [loginMode, setLoginMode] = useState<'persona' | 'student_id'>('persona');
  const [loadingRole, setLoadingRole] = useState<Role | null>(null);
  const [studentIdInput, setStudentIdInput] = useState('');
  const [isSubmittingId, setIsSubmittingId] = useState(false);

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

  const handleStudentIdLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const idToUse = studentIdInput.trim();
    if (!idToUse) {
      showToast('Please enter your Student ID or Roll Number', 'warning');
      return;
    }

    try {
      setIsSubmittingId(true);
      const res = await api.studentLogin(idToUse);
      if (res && res.access_token) {
        localStorage.setItem('sgsu_access_token', res.access_token);
        await switchRole('STUDENT');
        showToast(`Welcome back, ${res.user.name}!`, 'success');
        onNavigate('/student');
      }
    } catch (err: any) {
      showToast(err.message || 'Student ID not found in database', 'error');
    } finally {
      setIsSubmittingId(false);
    }
  };

  const quickFillStudentId = (id: string) => {
    setStudentIdInput(id);
  };

  return (
    <div className="min-h-screen bg-[#071022] text-slate-100 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl bg-gradient-to-b from-[#0B1B3A] to-[#071022] border border-indigo-500/25 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10">
        {/* University Header */}
        <div className="text-center pb-5 border-b border-slate-800">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-xl font-display mx-auto mb-3 shadow-lg shadow-indigo-950">
            SGSU
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
            Scope Global Skills University
          </h2>
          <p className="text-xs text-indigo-300 font-mono mt-1">
            AI-Native Academic Platform · Portal Authentication
          </p>
          <div className="mt-2">
            <ProvenanceChip provenance="LIVE" />
          </div>
        </div>

        {/* Mode Switch Tabs (Role vs Student ID) */}
        <div className="flex rounded-xl bg-navy-950/80 p-1 my-5 border border-slate-800">
          <button
            onClick={() => setLoginMode('persona')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              loginMode === 'persona'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Role Switcher (Demonstrator)</span>
          </button>
          <button
            onClick={() => setLoginMode('student_id')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              loginMode === 'student_id'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <IdCard className="w-3.5 h-3.5" />
            <span>Student ID / Roll No Login</span>
          </button>
        </div>

        {/* Tab 1: Persona Access */}
        {loginMode === 'persona' && (
          <div className="space-y-3.5 mb-6">
            {/* Teacher Card */}
            <button
              onClick={() => handleSelectRole('TEACHER')}
              disabled={loadingRole !== null}
              className="w-full p-4 rounded-2xl bg-navy-900/80 hover:bg-navy-800 border border-indigo-500/30 hover:border-indigo-400 text-left transition-all duration-200 group flex items-center justify-between shadow-sm cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                      Dr. Ashok Sharma
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      TEACHER
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Course Coordinator · CS-501 Artificial Intelligence · Sections 5-A to 5-F
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
              className="w-full p-4 rounded-2xl bg-navy-900/80 hover:bg-navy-800 border border-indigo-500/30 hover:border-indigo-400 text-left transition-all duration-200 group flex items-center justify-between shadow-sm cursor-pointer"
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
                    B.Tech CSE Semester 5 · Roll #2024-CSE-5A-01 · Active Evidence Contributor
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
              className="w-full p-4 rounded-2xl bg-navy-900/80 hover:bg-navy-800 border border-indigo-500/30 hover:border-indigo-400 text-left transition-all duration-200 group flex items-center justify-between shadow-sm cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center shrink-0 group-hover:bg-violet-600 group-hover:text-white transition-colors">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white group-hover:text-violet-300 transition-colors">
                      Prof. Vikram Malhotra
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                      ACADEMIC ADMIN
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Dean of Academics · Multi-Section Analytics & Faculty Management
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
        )}

        {/* Tab 2: Direct Student ID Login */}
        {loginMode === 'student_id' && (
          <form onSubmit={handleStudentIdLogin} className="space-y-4 mb-6">
            <div className="p-4 rounded-2xl bg-navy-900/80 border border-indigo-500/30 space-y-3">
              <label className="block text-xs font-semibold text-slate-200">
                Enter University Roll Number / Student ID:
              </label>
              <div className="relative">
                <IdCard className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={studentIdInput}
                  onChange={(e) => setStudentIdInput(e.target.value)}
                  placeholder="e.g. 2024-CSE-5A-01 or 0101CS221088"
                  className="w-full pl-9 pr-3 py-2.5 bg-navy-950 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Sample Quick-Click IDs */}
              <div>
                <span className="text-[11px] text-slate-400 block mb-1.5 font-medium">
                  Quick select seeded student IDs across sections:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: '2024-CSE-5A-01', name: 'Riya (5-A)' },
                    { id: '2024-CSE-5A-02', name: 'Aarav (5-A)' },
                    { id: '2024-CSE-5B-01', name: 'Dhruv (5-B)' },
                    { id: '2024-CSE-5B-02', name: 'Sneha (5-B)' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => quickFillStudentId(s.id)}
                      className="px-2 py-1 rounded-lg text-[10px] font-mono bg-slate-800 hover:bg-indigo-600/40 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                    >
                      {s.id} ({s.name})
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmittingId}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-950 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>{isSubmittingId ? 'Authenticating...' : 'Enter Student Portal'}</span>
            </button>
          </form>
        )}

        {/* Demo Fast-Track Link */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <button
            onClick={() => onNavigate('/')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            ← Back to Overview
          </button>

          <button
            onClick={() => onNavigate('/demo')}
            className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Launch 8-Step Runner</span>
          </button>
        </div>
      </div>
    </div>
  );
};
