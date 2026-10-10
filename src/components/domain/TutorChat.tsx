import React, { useState } from 'react';
import { Send, Bot, User as UserIcon, Lock, Sparkles, BookOpen } from 'lucide-react';
import { AiBadge } from '../ui/AiBadge';
import { api } from '../../services/apiClient';
import { usePlatform } from '../../context/PlatformContext';

interface Message {
  id: number;
  sender: 'student' | 'tutor';
  text: string;
  timestamp: string;
}

interface TutorChatProps {
  className?: string;
}

export const TutorChat: React.FC<TutorChatProps> = ({ className = '' }) => {
  const { activeSession, showToast } = usePlatform();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'tutor',
      text: 'Hello Riya! I am your AI Academic Tutor for CS-501 Neural Networks, grounded strictly in approved SGSU course material. How can I assist your understanding of backpropagation and gradient flow?',
      timestamp: '10:00 AM'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check if quiz is currently open (CR-14: tutor returns 423 lock during open quiz)
  const isQuizOpen = activeSession?.quiz.status === 'OPEN';

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading || isQuizOpen) return;

    const userMsg: Message = {
      id: Date.now(),
      sender: 'student',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await api.askTutor(text, 4);
      const tutorMsg: Message = {
        id: Date.now() + 1,
        sender: 'tutor',
        text: res.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, tutorMsg]);
    } catch (err: any) {
      if (err.status === 423 || err.message?.includes('QUIZ')) {
        showToast('Tutor is paused during the exit quiz', 'warning');
      } else {
        showToast(err.message || 'Error communicating with tutor', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`p-6 rounded-2xl bg-gradient-to-b from-[#0B1B3A] to-[#071022] border border-indigo-500/25 shadow-xl flex flex-col justify-between min-h-[520px] ${className}`}>
      {/* Header */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-display">
                  SGSU Academic AI Tutor
                </h3>
                <AiBadge mode="LIVE" label="Grounded in Course Material" />
              </div>
              <span className="text-xs text-slate-400">
                Context: CS-501 · LO4 Backpropagation Mechanics
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-navy-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span className="truncate max-w-[220px]">
              Deep Learning Foundations, Ch. 4
            </span>
          </div>
        </div>

        {/* Lock Banner if Quiz is Open */}
        {isQuizOpen && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2.5 mb-4">
            <Lock className="w-4 h-4 shrink-0" />
            <span>
              Academic Integrity Lock Active: Tutor interaction is paused while the exit quiz is in progress.
            </span>
          </div>
        )}

        {/* Messages Stream */}
        <div className="space-y-3.5 max-h-[320px] overflow-y-auto pr-1">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 ${m.sender === 'student' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'tutor' && (
                <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-indigo-300 shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`p-3.5 rounded-2xl max-w-md text-xs sm:text-sm leading-relaxed ${
                  m.sender === 'student'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-navy-900/90 border border-slate-800 text-slate-200 rounded-tl-none'
                }`}
              >
                <p>{m.text}</p>
                <span
                  className={`text-[10px] font-mono block mt-1 ${
                    m.sender === 'student' ? 'text-indigo-200 text-right' : 'text-slate-400'
                  }`}
                >
                  {m.timestamp}
                </span>
              </div>

              {m.sender === 'student' && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                  <UserIcon className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-indigo-400 pl-9 font-mono">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              <span>Synthesizing explanation from course material...</span>
            </div>
          )}
        </div>
      </div>

      {/* Input area & Quick prompt suggestions */}
      <div className="mt-4 pt-3 border-t border-slate-800">
        {/* Quick prompt */}
        <div className="flex items-center gap-2 mb-2.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-mono text-slate-400 shrink-0">Try:</span>
          <button
            onClick={() => handleSend('Explain backpropagation simply using a 2-layer perceptron example')}
            disabled={isQuizOpen || isLoading}
            className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-indigo-300 border border-indigo-500/20 whitespace-nowrap transition-colors"
          >
            Explain backpropagation simply
          </button>
          <button
            onClick={() => handleSend('Why is the transpose weight matrix needed when error flows backward?')}
            disabled={isQuizOpen || isLoading}
            className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 border border-slate-700 whitespace-nowrap transition-colors"
          >
            Why is transpose matrix Wᵀ needed?
          </button>
        </div>

        {/* Input box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isQuizOpen || isLoading}
            placeholder={
              isQuizOpen
                ? 'Tutor is paused during the exit quiz...'
                : 'Ask a conceptual question about backpropagation...'
            }
            className="flex-1 bg-navy-950/90 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 disabled:opacity-40"
          />
          <button
            type="submit"
            disabled={!input.trim() || isQuizOpen || isLoading}
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition-colors shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <p className="text-[11px] text-slate-300 mt-2 text-center">
          Grounded in approved SGSU course material · Responses audited for governance
        </p>
      </div>
    </div>
  );
};
