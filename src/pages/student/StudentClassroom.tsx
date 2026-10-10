import React, { useState, useEffect } from 'react';
import { api } from '../../services/apiClient';
import { SessionState, TeacherQuestion, QuizResult } from '../../types';
import { SlideView } from '../../components/domain/SlideView';
import { PollCard } from '../../components/domain/PollCard';
import { QuizRunner } from '../../components/domain/QuizRunner';
import { ResultSummary } from '../../components/domain/ResultSummary';
import { ProvenanceChip } from '../../components/ui/ProvenanceChip';
import { usePlatform } from '../../context/PlatformContext';
import { 
  Presentation, 
  FileCheck2, 
  MessageSquare, 
  Wifi, 
  WifiOff, 
  ArrowRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface StudentClassroomProps {
  onNavigate: (path: string) => void;
}

export const StudentClassroom: React.FC<StudentClassroomProps> = ({ onNavigate }) => {
  const { showToast } = usePlatform();
  const [session, setSession] = useState<SessionState | null>(null);
  const [questions, setQuestions] = useState<TeacherQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [pollAnswered, setPollAnswered] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [isWsConnected, setIsWsConnected] = useState(false);

  const fetchSession = async () => {
    try {
      const active = await api.getSession(101);
      setSession(active);
    } catch (err: any) {
      console.warn('Student session check:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const [qList] = await Promise.all([api.getQuestions()]);
        setQuestions(qList);
        await api.joinSession(101);
        await fetchSession();
      } catch (err) {
        console.error('Initialization error in student classroom', err);
      }
    };
    init();

    // WebSocket real-time connection (§15.3 & §11.4)
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
          } else if (msg.type === 'poll.open' && msg.payload) {
            setSession((prev) => prev ? { ...prev, active_poll: msg.payload } : prev);
            setPollAnswered(false);
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

    // Polling fallback every 1.5s
    const interval = setInterval(fetchSession, 1500);

    return () => {
      clearInterval(interval);
      if (ws) ws.close();
    };
  }, []);

  const handlePollRespond = async (optionId: number) => {
    if (!session?.active_poll) return;
    try {
      await api.respondPoll(session.active_poll.id, optionId);
      setPollAnswered(true);
      showToast('Poll response recorded to evidence store', 'success');
      fetchSession();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleQuizSubmit = async (answers: any) => {
    const res = await api.submitQuiz('EXIT_QUIZ', answers, 101);
    setQuizResult(res);
    showToast('Exit Quiz submitted & processed atomically', 'success');
    return res;
  };

  if (loading || !session) {
    return <div className="p-8 text-center text-slate-400">Connecting to Smart Classroom...</div>;
  }

  const currentSlide = session.lesson.slides[session.current_slide_index];
  const totalSlides = session.lesson.slides.length;
  const isQuizOpen = session.quiz.status === 'OPEN';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-navy-900 via-[#0B1B3A] to-navy-900 border border-indigo-500/25 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
              SMART CLASSROOM · LIVE PARTICIPANT
            </span>
            <ProvenanceChip provenance="LIVE" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
            Lecture 14: Neural Networks & Backpropagation
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Dr. Aarav Mehta · Section 5-A · Real-time synchronized presentation
          </p>
        </div>

        <div className={`flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-xl border self-start sm:self-auto transition-all ${
          isWsConnected
            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35'
            : 'bg-amber-500/15 text-amber-300 border-amber-500/35'
        }`}>
          {isWsConnected ? <Wifi className="w-4 h-4 text-emerald-400 animate-pulse" /> : <WifiOff className="w-4 h-4 text-amber-400" />}
          <span>{isWsConnected ? 'WebSocket Live Sync' : 'Polling Fallback (1.5s)'}</span>
        </div>
      </div>

      {/* Teacher Prompt Alert Banner (if posted) */}
      {session.active_prompt && (
        <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/35 flex items-start gap-3 shadow-lg">
          <MessageSquare className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 block mb-0.5">
              Teacher's In-Class Question:
            </span>
            <p className="text-sm font-semibold text-white">
              "{session.active_prompt.text}"
            </p>
          </div>
        </div>
      )}

      {/* Main Mode: Exit Quiz vs Presentation Slides */}
      {isQuizOpen ? (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-center gap-2.5">
            <FileCheck2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              The Exit Quiz is now LIVE. Answer all 5 questions to calibrate your learning outcome mastery.
            </span>
          </div>

          <QuizRunner
            questions={questions}
            context="EXIT_QUIZ"
            onSubmit={handleQuizSubmit}
            onGoToDashboard={() => onNavigate('/student')}
            onGoToPractice={() => onNavigate('/student/practice')}
          />
        </div>
      ) : quizResult ? (
        <ResultSummary
          result={quizResult}
          onGoToDashboard={() => onNavigate('/student')}
          onGoToPractice={() => onNavigate('/student/practice')}
        />
      ) : (
        <div className="space-y-6">
          {/* Synchronized Slide Viewer */}
          <SlideView
            slide={currentSlide}
            slideIndex={session.current_slide_index}
            totalSlides={totalSlides}
            isTeacher={false}
          />

          {/* Active Poll Card (if open) */}
          {session.active_poll && (
            <PollCard
              poll={session.active_poll}
              isTeacher={false}
              hasResponded={pollAnswered}
              onRespond={handlePollRespond}
            />
          )}

          {/* Waiting for Quiz Status Notice */}
          <div className="p-5 rounded-2xl bg-navy-900/60 border border-slate-800 text-center space-y-2">
            <span className="text-xs font-bold text-slate-300 block">
              Class in Session
            </span>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              Follow slides as Dr. Mehta presents. When the teacher activates the Exit Quiz, it will open automatically right here.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
