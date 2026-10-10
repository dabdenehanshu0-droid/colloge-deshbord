import React, { useState } from 'react';
import { TutorChat } from '../../components/domain/TutorChat';
import { ProvenanceChip } from '../../components/ui/ProvenanceChip';
import { Bot, ShieldCheck, Mail, Send, X, CheckCircle } from 'lucide-react';
import { api } from '../../services/apiClient';
import { usePlatform } from '../../context/PlatformContext';

export const AiTutorPage: React.FC = () => {
  const { user, showToast } = usePlatform();
  const [showQueryModal, setShowQueryModal] = useState(false);
  const [subject, setSubject] = useState('Doubt regarding Backpropagation & Chain Rule');
  const [question, setQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendEmailQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) {
      showToast('Please type your question for the teacher.', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.submitStudentQuery({
        subject: subject.trim(),
        question: question.trim(),
        teacher_email: 'sharma@sgsu.ac.in',
        priority: 'NORMAL'
      });
      showToast('Your academic doubt was dispatched to Professor Sharma\'s email!', 'success');
      setShowQueryModal(false);
      setQuestion('');
    } catch (err: any) {
      showToast(err.message || 'Failed to dispatch email query', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-[#0B1B3A] border border-slate-200 dark:border-indigo-500/20 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Student Intelligence · T01
              </span>
              <ProvenanceChip provenance="MIXED" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-display">
              AI Academic Tutor (Course Grounded)
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Grounded exclusively in SGSU Deep Learning Foundations materials · Zero ungrounded speculation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowQueryModal(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Mail className="w-4 h-4" />
            <span>Email Query to Teacher</span>
          </button>
        </div>
      </div>

      {/* Embedded Chat Container */}
      <TutorChat />

      {/* Modal: Email Query to Teacher */}
      {showQueryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#0B1B3A] border border-slate-200 dark:border-indigo-500/30 p-6 shadow-2xl text-slate-800 dark:text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                  Send Query to Teacher's Email
                </h3>
              </div>
              <button
                onClick={() => setShowQueryModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendEmailQuery} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Recipient Faculty
                </label>
                <input
                  type="text"
                  disabled
                  value="Prof. Sharma (sharma@sgsu.ac.in)"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-navy-950 text-xs text-slate-600 dark:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Query Topic / Subject
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Detailed Question / Doubt
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Explain your doubt clearly. Teacher will receive this in their faculty inbox..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowQueryModal(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !question.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Dispatching...' : 'Dispatch to Teacher Email'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
