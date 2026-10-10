import React from 'react';
import { Block } from '../../types';
import { BookOpen, AlertCircle, HelpCircle, CheckCircle, Quote, Sparkles } from 'lucide-react';

interface SlideViewProps {
  slide?: Block;
  slideIndex: number;
  totalSlides: number;
  isTeacher?: boolean;
  onNext?: () => void;
  onPrev?: () => void;
  className?: string;
}

export const SlideView: React.FC<SlideViewProps> = ({
  slide,
  slideIndex,
  totalSlides,
  isTeacher = false,
  onNext,
  onPrev,
  className = ''
}) => {
  if (!slide) {
    return (
      <div className={`p-12 text-center rounded-2xl bg-navy-900/60 border border-slate-800 text-slate-400 ${className}`}>
        No active slide in lesson.
      </div>
    );
  }

  const getTypeIcon = () => {
    switch (slide.type) {
      case 'OBJECTIVES':
        return <CheckCircle className="w-5 h-5 text-indigo-400" />;
      case 'MISCONCEPTION':
        return <AlertCircle className="w-5 h-5 text-rose-400" />;
      case 'QUICK_CHECK':
        return <HelpCircle className="w-5 h-5 text-amber-400" />;
      case 'EXAMPLE':
        return <Sparkles className="w-5 h-5 text-emerald-400" />;
      case 'SOURCE':
        return <Quote className="w-5 h-5 text-violet-400" />;
      default:
        return <BookOpen className="w-5 h-5 text-indigo-400" />;
    }
  };

  return (
    <div className={`p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-[#0B1B3A] to-[#071022] border border-indigo-500/20 shadow-2xl flex flex-col justify-between min-h-[420px] relative overflow-hidden ${className}`}>
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header metadata */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-md bg-indigo-500/15 border border-indigo-500/25">
              {getTypeIcon()}
            </span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-300">
              {slide.type.replace('_', ' ')}
            </span>
            {slide.outcome_ids && slide.outcome_ids.length > 0 && (
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                LO{slide.outcome_ids.join(', LO')}
              </span>
            )}
          </div>

          <div className="text-xs font-mono text-slate-400">
            Slide <strong className="text-white">{slideIndex + 1}</strong> / {totalSlides}
          </div>
        </div>

        {/* Title */}
        {slide.title && (
          <h2 className="text-xl sm:text-2xl font-bold text-white font-display mb-4 leading-snug">
            {slide.title}
          </h2>
        )}

        {/* Content Body */}
        <div className="text-slate-200 text-base leading-relaxed space-y-4">
          {slide.content.text && (
            <p className="text-slate-200 font-normal leading-relaxed text-base sm:text-lg">
              {slide.content.text}
            </p>
          )}

          {slide.content.subtext && (
            <p className="text-sm text-slate-400 italic">
              {slide.content.subtext}
            </p>
          )}

          {slide.content.items && (
            <ul className="space-y-2.5 pt-2">
              {slide.content.items.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 p-2.5 rounded-lg bg-navy-900/60 border border-slate-800/80">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 mt-2 shrink-0" />
                  <span className="text-slate-200 text-sm font-medium">{item}</span>
                </li>
              ))}
            </ul>
          )}

          {slide.content.question && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 my-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-1">
                Question
              </span>
              <p className="text-sm font-semibold text-white">
                {slide.content.question}
              </p>
              {slide.content.answer && (
                <div className="mt-3 pt-3 border-t border-amber-500/20">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                    Verified Answer
                  </span>
                  <p className="text-xs text-slate-300">
                    {slide.content.answer}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Teacher Navigation Bar */}
      {isTeacher && (
        <div className="flex items-center justify-between gap-3 pt-6 mt-6 border-t border-slate-800">
          <button
            onClick={onPrev}
            disabled={slideIndex === 0}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-white border border-slate-700 transition-colors"
          >
            ← Previous Slide
          </button>
          <span className="text-xs font-mono text-slate-400">
            Interactive Presentation Control
          </span>
          <button
            onClick={onNext}
            disabled={slideIndex === totalSlides - 1}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:pointer-events-none text-white transition-colors shadow-sm"
          >
            Next Slide →
          </button>
        </div>
      )}
    </div>
  );
};
