import React, { useState, useEffect } from 'react';
import { StudentQuestion, QuizResult, QuizSubmissionItem } from '../../types';
import { ResultSummary } from './ResultSummary';
import { CheckCircle2, ArrowRight, ArrowLeft, Send, Sparkles } from 'lucide-react';

interface QuizRunnerProps {
  questions: StudentQuestion[];
  context: 'EXIT_QUIZ' | 'PRACTICE';
  onSubmit: (answers: QuizSubmissionItem[]) => Promise<QuizResult>;
  onGoToDashboard?: () => void;
  onGoToPractice?: () => void;
  className?: string;
}

export const QuizRunner: React.FC<QuizRunnerProps> = ({
  questions,
  context,
  onSubmit,
  onGoToDashboard,
  onGoToPractice,
  className = ''
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>(() => {
    try {
      const saved = sessionStorage.getItem(`quiz_answers_${context}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [isReviewStep, setIsReviewStep] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);

  // Sync answers with sessionStorage to survive page refresh
  useEffect(() => {
    try {
      sessionStorage.setItem(`quiz_answers_${context}`, JSON.stringify(selectedAnswers));
    } catch (e) {
      console.warn('Could not save quiz answers to session storage', e);
    }
  }, [selectedAnswers, context]);

  if (result) {
    return (
      <ResultSummary
        result={result}
        onGoToDashboard={onGoToDashboard}
        onGoToPractice={onGoToPractice}
        className={className}
      />
    );
  }

  const currentQ = questions[currentIndex];
  const totalCount = questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;
  const isAllAnswered = answeredCount === totalCount;

  const handleSelectOption = (questionId: number, optionId: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const handleNext = () => {
    if (currentIndex < totalCount - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsReviewStep(true);
    }
  };

  const handlePrev = () => {
    if (isReviewStep) {
      setIsReviewStep(false);
    } else if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!isAllAnswered || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const payload: QuizSubmissionItem[] = questions.map((q) => ({
        question_id: q.id,
        option_id: selectedAnswers[q.id]
      }));
      const res = await onSubmit(payload);
      setResult(res);
      sessionStorage.removeItem(`quiz_answers_${context}`);
    } catch (err) {
      console.error('Quiz submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Review Step ---
  if (isReviewStep) {
    return (
      <div className={`p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-[#0B1B3A] to-[#071022] border border-indigo-500/30 shadow-2xl space-y-6 ${className}`}>
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">
              {context === 'PRACTICE' ? 'Practice Mode' : 'Exit Quiz Review'}
            </span>
            <h2 className="text-xl font-bold text-white font-display">
              Review Answers Before Submission
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-300">
            {answeredCount} of {totalCount} Answered
          </span>
        </div>

        <div className="space-y-3">
          {questions.map((q, idx) => {
            const chosenOptId = selectedAnswers[q.id];
            const chosenOpt = q.options.find((o) => o.id === chosenOptId);

            return (
              <div
                key={q.id}
                onClick={() => {
                  setCurrentIndex(idx);
                  setIsReviewStep(false);
                }}
                className="p-3.5 rounded-xl bg-navy-900/60 border border-slate-800 hover:border-indigo-500/40 cursor-pointer transition-all flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-md bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center text-xs font-mono font-bold">
                    Q{idx + 1}
                  </span>
                  <div>
                    <div className="text-xs font-semibold text-white truncate max-w-md">
                      {q.stem}
                    </div>
                    <div className="text-xs text-indigo-300 mt-0.5">
                      Selected: <strong>{chosenOpt?.label}</strong> · {chosenOpt?.text}
                    </div>
                  </div>
                </div>

                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={() => setIsReviewStep(false)}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            ← Back to Questions
          </button>

          <button
            onClick={handleSubmit}
            disabled={!isAllAnswered || isSubmitting}
            className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white transition-all shadow-md flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Computing Evidence...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Submit Final Assessment</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // --- Single Question Step ---
  return (
    <div className={`p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-[#0B1B3A] to-[#071022] border border-indigo-500/30 shadow-2xl flex flex-col justify-between min-h-[440px] ${className}`}>
      <div>
        {/* Progress header */}
        <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              QUESTION {currentIndex + 1} OF {totalCount}
            </span>
            <span className="text-xs font-mono text-slate-400">
              LO{currentQ.learning_outcome_id}
            </span>
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center gap-1.5">
            {questions.map((q, idx) => {
              const isAnswered = Boolean(selectedAnswers[q.id]);
              const isCurrent = idx === currentIndex;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    isCurrent
                      ? 'bg-indigo-400 ring-2 ring-indigo-400/30'
                      : isAnswered
                      ? 'bg-emerald-500'
                      : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                  title={`Question ${idx + 1}`}
                />
              );
            })}
          </div>
        </div>

        {/* Question Stem */}
        <h3 className="text-base sm:text-lg font-bold text-white mb-6 leading-snug font-display">
          {currentQ.stem}
        </h3>

        {/* Options */}
        <div className="space-y-3">
          {currentQ.options.map((opt) => {
            const isSelected = selectedAnswers[currentQ.id] === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => handleSelectOption(currentQ.id, opt.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-indigo-950/60 border-indigo-500 shadow-md ring-1 ring-indigo-500/30'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold transition-colors ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {opt.label}
                  </span>
                  <span className="text-sm font-medium text-slate-200">
                    {opt.text}
                  </span>
                </div>

                {isSelected && (
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between gap-3 pt-6 mt-6 border-t border-slate-800">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Previous</span>
        </button>

        <span className="text-xs font-mono text-slate-400 hidden sm:inline">
          {answeredCount} / {totalCount} completed
        </span>

        {currentIndex === totalCount - 1 ? (
          <button
            onClick={() => setIsReviewStep(true)}
            disabled={!isAllAnswered}
            className="px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white transition-all shadow-sm flex items-center gap-1.5"
          >
            <span>Review & Submit</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-sm flex items-center gap-1.5"
          >
            <span>Next Question</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
