import React, { useState } from 'react';
import { ShieldAlert, ArrowLeft, ArrowRight, GraduationCap, User, ShieldCheck } from 'lucide-react';
import { usePlatform } from '../../context/PlatformContext';
import { Role } from '../../types';

interface ForbiddenPageProps {
  onNavigate: (path: string) => void;
  targetPath?: string;
}

export const ForbiddenPage: React.FC<ForbiddenPageProps> = ({ onNavigate, targetPath = '' }) => {
  const { role, switchRole } = usePlatform();
  const [switching, setSwitching] = useState<Role | null>(null);

  // Determine which role is needed for this target path
  let requiredRole: Role | null = null;
  let requiredLabel = '';
  if (targetPath.startsWith('/teacher')) {
    requiredRole = 'TEACHER';
    requiredLabel = 'Teacher Persona (Dr. Aarav Mehta / Dr. Ashok Sharma)';
  } else if (targetPath.startsWith('/student')) {
    requiredRole = 'STUDENT';
    requiredLabel = 'Student Persona (Riya Sharma)';
  } else if (targetPath.startsWith('/admin')) {
    requiredRole = 'ADMIN';
    requiredLabel = 'Academic Admin Persona (Prof. Sunita Rao)';
  }

  const handleReturnHome = () => {
    if (role === 'TEACHER') onNavigate('/teacher');
    else if (role === 'STUDENT') onNavigate('/student');
    else if (role === 'ADMIN') onNavigate('/admin');
    else onNavigate('/');
  };

  const handleSwitchAndGo = async (newRole: Role) => {
    setSwitching(newRole);
    try {
      await switchRole(newRole);
      if (targetPath && targetPath !== '/403') {
        onNavigate(targetPath);
      } else {
        if (newRole === 'TEACHER') onNavigate('/teacher');
        else if (newRole === 'STUDENT') onNavigate('/student');
        else if (newRole === 'ADMIN') onNavigate('/admin');
      }
    } finally {
      setSwitching(null);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 sm:p-6 text-center">
      <div className="max-w-lg w-full bg-[#0B1B3A] border border-rose-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
          <ShieldAlert className="w-9 h-9" />
        </div>

        <div>
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30 uppercase tracking-wider">
            HTTP 403 · Access Restricted
          </span>
          <h2 className="text-2xl font-bold text-white font-display mt-2">
            Persona Scope Guard
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mt-2">
            You are currently accessing the platform as <strong className="text-white font-bold">{role}</strong>.
            {requiredRole
              ? ` This page requires the ${requiredRole} persona.`
              : ' Each user persona is scoped to its specific academic layer.'}
          </p>
        </div>

        {/* 1-Click Auto-Switch Button if required role is identified */}
        {requiredRole && requiredRole !== role && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/70 to-navy-900 border border-indigo-500/40 text-left space-y-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-bold block mb-1">
                RECOMMENDED ACTION
              </span>
              <p className="text-xs text-slate-200">
                Switch to <strong className="text-white">{requiredLabel}</strong> to access this page with full permissions:
              </p>
            </div>
            <button
              onClick={() => handleSwitchAndGo(requiredRole!)}
              disabled={switching !== null}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>{switching === requiredRole ? 'Switching Persona...' : `Switch to ${requiredRole} & Continue`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Quick Persona Switcher Grid */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">
            Or Switch to Any Persona:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              onClick={() => handleSwitchAndGo('TEACHER')}
              disabled={switching !== null}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                role === 'TEACHER'
                  ? 'bg-indigo-600/30 border-indigo-500 text-white'
                  : 'bg-navy-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-bold mb-0.5">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                <span>Teacher</span>
              </div>
              <div className="text-[10px] text-slate-400 truncate">Dr. Aarav Mehta</div>
            </button>

            <button
              onClick={() => handleSwitchAndGo('STUDENT')}
              disabled={switching !== null}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                role === 'STUDENT'
                  ? 'bg-emerald-600/30 border-emerald-500 text-white'
                  : 'bg-navy-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-bold mb-0.5">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span>Student</span>
              </div>
              <div className="text-[10px] text-slate-400 truncate">Riya Sharma</div>
            </button>

            <button
              onClick={() => handleSwitchAndGo('ADMIN')}
              disabled={switching !== null}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                role === 'ADMIN'
                  ? 'bg-violet-600/30 border-violet-500 text-white'
                  : 'bg-navy-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-bold mb-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
                <span>Admin</span>
              </div>
              <div className="text-[10px] text-slate-400 truncate">Prof. Sunita Rao</div>
            </button>
          </div>
        </div>

        <button
          onClick={handleReturnHome}
          className="mt-2 px-5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition-colors inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to {role.toLowerCase()} Home</span>
        </button>
      </div>
    </div>
  );
};

export const NotFoundPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6 text-center">
      <div className="max-w-md bg-[#0B1B3A] border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-4">
        <h2 className="text-3xl font-bold text-white font-display">404</h2>
        <h3 className="text-lg font-bold text-slate-200">Page Not Found</h3>
        <p className="text-xs text-slate-400">
          The requested route does not exist on the platform.
        </p>
        <button
          onClick={() => onNavigate('/')}
          className="mt-4 px-6 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
        >
          Return to Platform Overview
        </button>
      </div>
    </div>
  );
};
