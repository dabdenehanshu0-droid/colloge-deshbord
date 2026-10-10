import React, { useState, useEffect } from 'react';
import { api } from '../../services/apiClient';
import { SessionState } from '../../types';
import { SlideView } from '../../components/domain/SlideView';
import { PollCard } from '../../components/domain/PollCard';
import { QrJoin } from '../../components/ui/QrJoin';
import { ProvenanceChip } from '../../components/ui/ProvenanceChip';
import { usePlatform } from '../../context/PlatformContext';
import { 
  Users, 
  Presentation, 
  BarChart3, 
  FileCheck2, 
  MessageSquare, 
  Send, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  ExternalLink,
  Wifi,
  WifiOff
} from 'lucide-react';

interface TeacherClassroomProps {
  onNavigate: (path: string) => void;
}

export const TeacherClassroom: React.FC<TeacherClassroomProps> = ({ onNavigate }) => {
  const { showToast } = usePlatform();
  const [session, setSession] = useState<SessionState | null>(null);
  const [loading, setLoading] = useState(true);
  const [promptInput, setPromptInput] = useState('');
  const [sessionReport, setSessionReport] = useState<any>(null);

  const [isWsConnected, setIsWsConnected] = useState(false);

  const fetchSession = async () => {
    try {
      const active = await api.getSession(101);
      setSession(active);
    } catch (err: any) {
      console.warn('No active session, fallbacking to initial state', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();

    // WebSocket real-time connection
    let ws: WebSocket | null = null;
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsHost = window.location.host;
      const token = localStorage.getItem('sgsu_access_token') || '';
      ws = new WebSocket(`${protocol}//${wsHost}/ws/sessions/1?token=${token}`);

      ws.onopen = () => {
        setIsWsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'state.sync' && msg.payload) {
            setSession(msg.payload);
          } else if (msg.type === 'slide.change' && msg.payload) {
            setSession((prev) => prev ? { ...prev, current_slide_index: msg.payload.index, version: msg.payload.version } : prev);
          } else if (msg.type === 'poll.update' && msg.payload) {
            setSession((prev) => prev && prev.active_poll ? { ...prev, active_poll: { ...prev.active_poll, counts: msg.payload.counts } } : prev);
          } else if (msg.type === 'quiz.open') {
            setSession((prev) => prev ? { ...prev, quiz: { ...prev.quiz, status: 'OPEN' } } : prev);
          } else if (msg.type === 'quiz.close') {
            setSession((prev) => prev ? { ...prev, quiz: { ...prev.quiz, status: 'CLOSED' } } : prev);
          }
        } catch (e) {
          console.warn('WS message error', e);
        }
      };

      ws.onerror = () => setIsWsConnected(false);
      ws.onclose = () => setIsWsConnected(false);
    } catch {
      setIsWsConnected(false);
    }

    // Poll every 1.5s to maintain real-time sync as fallback
    const interval = setInterval(fetchSession, 1500);

    return () => {
      clearInterval(interval);
      if (ws) ws.close();
    };
  }, []);

  if (loading || !session) {
    return <div className="p-8 text-center text-slate-400">Loading Smart Classroom session...</div>;
  }

  const currentSlide = session.lesson.slides[session.current_slide_index];
  const totalSlides = session.lesson.slides.length;

  const handleNextSlide = async () => {
    try {
      const updated = await api.changeSlide(session.id, 'NEXT');
      setSession(updated);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handlePrevSlide = async () => {
    try {
      const updated = await api.changeSlide(session.id, 'PREV');
      setSession(updated);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleStartPoll = async () => {
    try {
      const poll = await api.startPoll(session.id, 2);
      showToast('Live Concept Poll started on LO2', 'success');
      fetchSession();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleClosePoll = async () => {
    if (!session.active_poll) return;
    try {
      await api.closePoll(session.active_poll.id);
      showToast('Poll closed. Final distribution displayed.', 'info');
      fetchSession();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleSendPrompt = async () => {
    if (!promptInput.trim()) return;
    try {
      await api.postPrompt(session.id, promptInput);
      setPromptInput('');
      showToast('Concept prompt dispatched to all student screens', 'success');
      fetchSession();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleStartExitQuiz = async () => {
    try {
      const updated = await api.startQuiz(session.id);
      setSession(updated);
      showToast('Exit Quiz OPEN: 5 questions pushed to joined students', 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleCloseExitQuiz = async () => {
    try {
      const updated = await api.closeQuiz(session.id);
      setSession(updated);
      showToast('Exit Quiz closed. Triggering formative class gap calculation.', 'info');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleEndClass = async () => {
    try {
      const updated = await api.endSession(session.id);
      setSession(updated);
      setSessionReport({
        attendance: 57,
        pollsCompleted: 1,
        quizSubmissions: session.quiz.submitted_count || 1,
        lo4WeakCount: 35
      });
      showToast('Lecture concluded. Session summary generated.', 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Strip (Presenter Banner) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-navy-900 via-[#0B1B3A] to-navy-900 border border-indigo-500/25 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">
              PRESENTER MODE · CS-501 ARTIFICIAL INTELLIGENCE
            </span>
            <ProvenanceChip provenance="LIVE" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
            Topic 4: Neural Networks & Backpropagation Mechanics
          </h2>
          <div className="flex items-center gap-3 text-xs font-mono text-slate-300 mt-1">
            <span>Section 5-A</span>
            <span>·</span>
            <span>
              Active Slide: <strong>{session.current_slide_index + 1}</strong> of {totalSlides}
            </span>
            {session.current_outcome_id && (
              <>
                <span>·</span>
                <span className="text-indigo-400">LO{session.current_outcome_id}</span>
              </>
            )}
          </div>
        </div>

        {/* Live Status Indicators */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all ${
            isWsConnected
              ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-300'
              : 'bg-amber-500/15 border-amber-500/35 text-amber-300'
          }`}>
            {isWsConnected ? <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> : <WifiOff className="w-3.5 h-3.5 text-amber-400" />}
            <span>{isWsConnected ? 'WS Real-Time' : 'Polling (1.5s)'}</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>
              <strong className="text-white">{session.participants_count}</strong> Joined (1 Live)
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono">
            <FileCheck2 className="w-4 h-4 text-indigo-400" />
            <span>
              Quiz: <strong className="text-white">{session.quiz.status}</strong>
            </span>
          </div>

          <button
            onClick={handleEndClass}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-rose-600 hover:bg-rose-500 text-white transition-colors shadow-sm"
          >
            End Class
          </button>
        </div>
      </div>

      {/* Main Classroom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT / CENTER: Slide View (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <SlideView
            slide={currentSlide}
            slideIndex={session.current_slide_index}
            totalSlides={totalSlides}
            isTeacher={true}
            onNext={handleNextSlide}
            onPrev={handlePrevSlide}
          />

          {/* Teacher Classroom Controls Strip */}
          <div className="p-4 rounded-2xl bg-navy-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-mono uppercase text-slate-400 font-bold">
              Classroom Controls:
            </span>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleStartPoll}
                disabled={session.active_poll?.status === 'OPEN'}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition-colors flex items-center gap-1.5"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Launch Poll (LO2)</span>
              </button>

              {session.quiz.status === 'NOT_STARTED' && (
                <button
                  onClick={handleStartExitQuiz}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <FileCheck2 className="w-3.5 h-3.5" />
                  <span>Start Exit Quiz</span>
                </button>
              )}

              {session.quiz.status === 'OPEN' && (
                <button
                  onClick={handleCloseExitQuiz}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-amber-600 hover:bg-amber-500 text-white transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Close Exit Quiz ({session.quiz.submitted_count} submitted)</span>
                </button>
              )}

              {session.quiz.status === 'CLOSED' && (
                <button
                  onClick={() => onNavigate('/teacher/insights')}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center gap-1.5"
                >
                  <span>View Class Insights →</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT RAIL: QR Join, Live Poll & Concept Prompt (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* QR Join Card */}
          <QrJoin
            joinUrl={session.join_url}
            sessionId={session.id}
            onStudentJoin={() => onNavigate('/student/classroom')}
          />

          {/* Live Poll Component (if active) */}
          {session.active_poll ? (
            <PollCard
              poll={session.active_poll}
              isTeacher={true}
              onClose={handleClosePoll}
            />
          ) : (
            <div className="p-5 rounded-2xl bg-navy-900/60 border border-slate-800 text-center space-y-2">
              <BarChart3 className="w-6 h-6 text-slate-500 mx-auto" />
              <div className="text-xs font-semibold text-slate-300">No Active Poll</div>
              <p className="text-[11px] text-slate-400">
                Click "Launch Poll" above to push an in-class activation check to student screens.
              </p>
            </div>
          )}

          {/* Ask Question / In-Class Prompt Box (SE05) */}
          <div className="p-5 rounded-2xl bg-navy-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Ask Class Question / Push Prompt
              </h4>
            </div>

            {session.active_prompt && (
              <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200">
                <span className="font-bold text-white block mb-0.5">Active Prompt:</span>
                "{session.active_prompt.text}"
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder='e.g. "Why do we multiply by the transpose matrix Wᵀ?"'
                className="flex-1 bg-navy-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleSendPrompt}
                disabled={!promptInput.trim()}
                className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition-colors"
                title="Send Prompt"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Post-Class Session Report Modal if ended */}
      {sessionReport && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-navy-900 to-navy-950 border border-emerald-500/35 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 uppercase mb-1">
              <CheckCircle className="w-4 h-4" />
              <span>Lecture Concluded · Session Report Ready</span>
            </div>
            <h3 className="text-lg font-bold text-white">
              57 Participants Present · 1 Poll Completed · Exit Quiz Submitted
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Formative evaluation identified 35 students requiring remediation on LO4 Backpropagation.
            </p>
          </div>

          <button
            onClick={() => onNavigate('/teacher/insights')}
            className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-md flex items-center gap-2 shrink-0"
          >
            <span>Proceed to Class Insights</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
