import React, { useState, useEffect } from 'react';
import { api } from '../../services/apiClient';
import { TeacherQuestion } from '../../types';
import { FileCheck2, CheckCircle2, AlertTriangle, BookOpen } from 'lucide-react';
import { ProvenanceChip } from '../../components/ui/ProvenanceChip';

export const AssessmentViewer: React.FC = () => {
  const [questions, setQuestions] = useState<TeacherQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const qList = await api.getQuestions();
        setQuestions(qList);
      } catch (err) {
        console.error('Failed to load assessment bank', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading Question Bank...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0B1B3A] border border-indigo-500/20 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">
              Formative Assessment Bank · Q01
            </span>
            <ProvenanceChip provenance="MIXED" />
          </div>
          <h2 className="text-2xl font-bold text-white font-display">
            Exit Quiz Question Bank & Misconception Diagnostics
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            5 Validated Items Tagged to LO1, LO2, LO3, LO4 · Verified Answer Keys & Distractor Diagnostics
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 self-start sm:self-auto">
          Read-Only Assessment Auditor
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {questions.map((q) => (
          <div
            key={q.id}
            className="p-6 rounded-2xl bg-navy-900/80 border border-slate-800 space-y-4 shadow-lg hover:border-slate-700 transition-all"
          >
            {/* Question Header */}
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 rounded-md bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-mono font-bold">
                  Q{q.seq}
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                  LO{q.learning_outcome_id}
                </span>
                <span className="text-xs text-slate-400">
                  Purpose: <strong className="text-white">{q.purpose}</strong>
                </span>
              </div>
            </div>

            {/* Stem */}
            <h3 className="text-base font-bold text-white leading-relaxed">
              {q.stem}
            </h3>

            {/* Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {q.options.map((opt) => (
                <div
                  key={opt.id}
                  className={`p-3 rounded-xl border flex items-start gap-3 ${
                    opt.is_correct
                      ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                      : opt.misconception
                      ? 'bg-rose-950/20 border-rose-500/40 text-rose-200'
                      : 'bg-navy-950/60 border-slate-800 text-slate-300'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5 ${
                      opt.is_correct
                        ? 'bg-emerald-600 text-white'
                        : opt.misconception
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {opt.label}
                  </span>
                  <div className="flex-1">
                    <span className="text-xs font-medium leading-relaxed block">{opt.text}</span>
                    {opt.is_correct && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 mt-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>CORRECT KEY</span>
                      </span>
                    )}
                    {opt.misconception && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-rose-400 mt-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>MISCONCEPTION: {opt.misconception.label}</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Explanation */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
              <strong className="text-white block mb-1">Pedagogical Rationale & Analytical Derivation:</strong>
              {q.explanation}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
