import React, { useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { Role } from '../../types';
import { ProvenanceChip } from '../ui/ProvenanceChip';
import { 
  GraduationCap, 
  BookOpen, 
  Users, 
  Presentation, 
  BarChart2, 
  Compass, 
  Building2, 
  FileCheck2, 
  Sparkles, 
  ShieldCheck, 
  RotateCcw, 
  Menu, 
  X, 
  ExternalLink,
  ChevronDown,
  UserCheck,
  LogOut
} from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
  activePath: string;
  onNavigate: (path: string) => void;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  activePath,
  onNavigate
}) => {
  const { user, role, switchRole, logout, resetDemo, isResetting, showToast, backendConnected } = usePlatform();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  // Navigation Items per Role
  const teacherNav = [
    { path: '/teacher', label: 'Teacher Dashboard', icon: GraduationCap },
    { path: '/teacher/courses', label: 'My Courses', icon: BookOpen },
    { path: '/teacher/lesson-builder', label: 'Lecture Builder', icon: Sparkles },
    { path: '/teacher/classroom', label: 'Smart Classroom', icon: Presentation },
    { path: '/teacher/assessment', label: 'Assessment Bank', icon: FileCheck2 },
    { path: '/teacher/insights', label: 'Class Insights', icon: BarChart2 },
    { path: '/teacher/recommendations', label: 'AI Recommendations', icon: Compass },
  ];

  const studentNav = [
    { path: '/student', label: 'Student Dashboard', icon: GraduationCap },
    { path: '/student/classroom', label: 'Smart Classroom', icon: Presentation },
    { path: '/student/practice', label: 'Personalized Practice', icon: Compass },
    { path: '/student/tutor', label: 'AI Academic Tutor', icon: Sparkles },
    { path: '/student/skills', label: 'Skill Passport', icon: BookOpen },
  ];

  const adminNav = [
    { path: '/admin', label: 'University Overview', icon: Building2 },
    { path: '/admin/analytics', label: 'Academic Analytics', icon: BarChart2 },
    { path: '/admin/governance', label: 'AI Governance & Audit', icon: ShieldCheck },
  ];

  const currentNav = role === 'TEACHER' ? teacherNav : role === 'STUDENT' ? studentNav : adminNav;

  const handleRoleSwitch = async (newRole: Role) => {
    setShowRoleMenu(false);
    await switchRole(newRole);
    if (newRole === 'TEACHER') onNavigate('/teacher');
    else if (newRole === 'STUDENT') onNavigate('/student');
    else if (newRole === 'ADMIN') onNavigate('/admin');
  };

  const handleConfirmReset = async () => {
    setShowResetModal(false);
    await resetDemo();
  };

  return (
    <div className="min-h-screen bg-[#071022] text-slate-100 flex flex-col font-sans">
      {/* TOP BAR */}
      <header className="h-16 border-b border-indigo-500/20 bg-[#0B1B3A]/90 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left: Brand & Section Badge */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white md:hidden"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div
            onClick={() => onNavigate('/')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold font-display shadow-md shadow-indigo-950">
              SG
            </div>
            <div>
              <span className="font-bold text-sm sm:text-base tracking-tight text-white group-hover:text-indigo-300 transition-colors block leading-tight font-display">
                SGSU Platform
              </span>
              <span className="text-[10px] font-mono text-indigo-300 hidden sm:block">
                AI-Native Academic Intelligence
              </span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-slate-700/60">
            <span className="px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700">
              CS-501 · Section 5-A
            </span>
            <ProvenanceChip provenance="MIXED" />
          </div>
        </div>

        {/* Center / Right: Quick Actions, Role Switcher, Full Demo Link, Reset */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Backend Connection Indicator */}
          <div
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border transition-all ${
              backendConnected
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
            }`}
            title={backendConnected ? 'FastAPI + SQLite Database connected via /api proxy' : 'Backend unreachable - using resilient local store'}
          >
            <span className={`w-2 h-2 rounded-full ${backendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
            <span>{backendConnected ? 'FastAPI Backend Active' : 'Backend Disconnected'}</span>
          </div>

          {/* Demonstration Runner Link */}
          <button
            onClick={() => onNavigate('/demo')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border shadow-sm ${
              activePath === '/demo'
                ? 'bg-indigo-600 text-white border-indigo-500 ring-2 ring-indigo-500/30'
                : 'bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 border-indigo-500/30'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Run Full Demonstration</span>
            <span className="sm:hidden">Demo</span>
          </button>

          {/* Demo Reset Button (Presenter tool) */}
          <button
            onClick={() => setShowResetModal(true)}
            disabled={isResetting}
            title="Reset demonstration data to pristine seed"
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">Reset Demo</span>
          </button>

          {/* Quick Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 transition-colors text-left"
            >
              <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center text-xs font-bold text-white uppercase">
                {user.role[0]}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-white truncate max-w-[110px]">
                  {user.name.split(' ')[0]}
                </div>
                <div className="text-[10px] font-mono text-indigo-300 capitalize">
                  {role.toLowerCase()}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
            </button>

            {/* Dropdown Menu */}
            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#0B1B3A] border border-indigo-500/30 shadow-2xl p-2 z-50 animate-in fade-in-50 duration-150">
                <div className="px-2.5 py-2 text-[11px] font-mono text-slate-400 border-b border-slate-800 uppercase tracking-wider">
                  Switch Active Persona
                </div>
                <div className="space-y-1 pt-1.5">
                  <button
                    onClick={() => handleRoleSwitch('TEACHER')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between ${
                      role === 'TEACHER'
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">Dr. Aarav Mehta</div>
                      <div className="text-[10px] text-slate-400">Teacher · CSE AI</div>
                    </div>
                    {role === 'TEACHER' && <UserCheck className="w-4 h-4 text-white" />}
                  </button>

                  <button
                    onClick={() => handleRoleSwitch('STUDENT')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between ${
                      role === 'STUDENT'
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">Riya Sharma</div>
                      <div className="text-[10px] text-slate-400">Student · Section 5-A</div>
                    </div>
                    {role === 'STUDENT' && <UserCheck className="w-4 h-4 text-white" />}
                  </button>

                  <button
                    onClick={() => handleRoleSwitch('ADMIN')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between ${
                      role === 'ADMIN'
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">Prof. Sunita Rao</div>
                      <div className="text-[10px] text-slate-400">Dean of Academics</div>
                    </div>
                    {role === 'ADMIN' && <UserCheck className="w-4 h-4 text-white" />}
                  </button>

                  <div className="pt-2 border-t border-slate-800">
                    <button
                      onClick={async () => {
                        setShowRoleMenu(false);
                        await logout();
                        onNavigate('/login');
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out Session</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex overflow-hidden">
        {/* SIDEBAR (Desktop) */}
        <aside className="w-64 bg-[#0B1B3A]/60 border-r border-indigo-500/15 hidden md:flex flex-col justify-between p-4 shrink-0 overflow-y-auto">
          <div>
            <div className="px-3 py-2 text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-1">
              {role} LAYER
            </div>

            <nav className="space-y-1">
              {currentNav.map((item) => {
                const isActive = activePath === item.path;
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => onNavigate(item.path)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950 font-bold'
                        : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer info */}
          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-300 space-y-2 px-2">
            <div className="flex items-center justify-between pb-1">
              <div>
                <div className="text-[10px] font-mono text-slate-400">LOGGED IN AS</div>
                <div className="text-xs font-bold text-white truncate max-w-[120px]">{user.name}</div>
              </div>
              <button
                onClick={async () => {
                  await logout();
                  onNavigate('/login');
                }}
                title="Log Out Session"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-rose-950/40 border border-slate-700/60 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="font-semibold text-slate-200">Scope Global Skills University</div>
            <div className="text-slate-300 text-[10px] leading-tight">
              AI-Native Educational Platform · Conference Demonstrator
            </div>
            <div className="text-violet-400 font-mono text-[10px]">
              Demonstration data only
            </div>
          </div>
        </aside>

        {/* MOBILE DRAWER */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="relative w-64 max-w-[80vw] bg-[#0B1B3A] border-r border-slate-800 p-4 flex flex-col justify-between z-10 animate-in slide-in-from-left duration-200">
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                  <span className="text-xs font-bold font-display text-white">Navigation</span>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1 rounded text-slate-400"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-1">
                  {currentNav.map((item) => {
                    const isActive = activePath === item.path;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.path}
                        onClick={() => {
                          onNavigate(item.path);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                          isActive
                            ? 'bg-indigo-600 text-white font-bold'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <div>
                  <span>Profile: </span>
                  <strong className="text-white">{user.name}</strong>
                </div>
                <button
                  onClick={async () => {
                    setIsMobileMenuOpen(false);
                    await logout();
                    onNavigate('/login');
                  }}
                  className="px-2.5 py-1 rounded bg-rose-950/50 border border-rose-500/30 text-rose-300 text-[10px] font-bold flex items-center gap-1"
                >
                  <LogOut className="w-3 h-3" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MAIN CONTENT VIEWPORT */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>

      {/* RESET CONFIRMATION MODAL */}
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
                onClick={handleConfirmReset}
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
