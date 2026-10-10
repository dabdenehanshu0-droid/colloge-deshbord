import React, { useState, useEffect } from 'react';
import { api } from '../../services/apiClient';
import { Lesson, Block, Topic, Course, Source } from '../../types';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { AiBadge } from '../../components/ui/AiBadge';
import { ProvenanceChip } from '../../components/ui/ProvenanceChip';
import { usePlatform } from '../../context/PlatformContext';
import { 
  Sparkles, 
  CheckCircle2, 
  BookOpen, 
  Edit3, 
  RotateCw, 
  ShieldCheck, 
  Send, 
  Presentation, 
  Quote, 
  Save, 
  X,
  AlertCircle
} from 'lucide-react';

interface LessonBuilderProps {
  onNavigate: (path: string) => void;
}

export const LessonBuilder: React.FC<LessonBuilderProps> = ({ onNavigate }) => {
  const { showToast } = usePlatform();
  const [courses, setCourses] = useState<Course[]>([]);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingBlockId, setEditingBlockId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [regeneratingBlockId, setRegeneratingBlockId] = useState<number | null>(null);
  const [regenerateInstruction, setRegenerateInstruction] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cList, tData, sList, lList] = await Promise.all([
          api.getCourses(),
          api.getTopic(101),
          api.getSources(101),
          api.getLessons(101)
        ]);
        setCourses(cList);
        setTopic(tData);
        setSources(sList);
        if (lList.length > 0) {
          setLesson(lList[0]);
        }
      } catch (err) {
        console.error('Failed to load lesson builder data', err);
      }
    };
    fetchData();
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const newLesson = await api.generateLesson(101);
      setLesson(newLesson);
      showToast('Structured lesson generated successfully across LO1–LO4', 'success');
    } catch (err: any) {
      showToast(err.message || 'Error generating lesson', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveBlockEdit = async (blockId: number) => {
    if (!lesson) return;
    try {
      const updated = await api.updateLessonBlock(lesson.id, blockId, undefined, { text: editText });
      setLesson((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          blocks: prev.blocks.map((b) => (b.id === blockId ? updated : b))
        };
      });
      setEditingBlockId(null);
      showToast('Lesson block updated & origin marked as EDITED', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update block', 'error');
    }
  };

  const handleRegenerateBlock = async (blockId: number) => {
    if (!lesson) return;
    setRegeneratingBlockId(blockId);
    try {
      const updated = await api.regenerateLessonBlock(lesson.id, blockId, regenerateInstruction);
      setLesson((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          blocks: prev.blocks.map((b) => (b.id === blockId ? updated : b))
        };
      });
      setRegenerateInstruction('');
      showToast('Block regenerated via AI Gateway', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to regenerate block', 'error');
    } finally {
      setRegeneratingBlockId(null);
    }
  };

  const handleReview = async () => {
    if (!lesson) return;
    try {
      const updated = await api.reviewLesson(lesson.id);
      setLesson(updated);
      showToast('Lesson marked as REVIEWED', 'success');
    } catch (err: any) {
      showToast(err.message || 'Review failed', 'error');
    }
  };

  const handleApprove = async () => {
    if (!lesson) return;
    try {
      const updated = await api.approveLesson(lesson.id);
      setLesson(updated);
      showToast('Human approval recorded & content hash generated', 'success');
    } catch (err: any) {
      showToast(err.message || 'Approval failed', 'error');
    }
  };

  const handlePublish = async () => {
    if (!lesson) return;
    try {
      const updated = await api.publishLesson(lesson.id);
      setLesson(updated);
      showToast('Lesson PUBLISHED to classroom schedule', 'success');
    } catch (err: any) {
      showToast(err.message || 'Publish failed', 'error');
    }
  };

  const handleStartClass = async () => {
    if (!lesson) return;
    try {
      await api.startSession(lesson.id, 1);
      showToast('Smart Classroom session started', 'success');
      onNavigate('/teacher/classroom');
    } catch (err: any) {
      showToast(err.message || 'Failed to start class', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0B1B3A] border border-indigo-500/20 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">
              AI Lecture Builder · Human Approval Gate
            </span>
            <ProvenanceChip provenance="MIXED" />
          </div>
          <h2 className="text-2xl font-bold text-white font-display">
            Curriculum-Anchored Lecture Authoring & Governance
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            CS-501 Neural Networks · 4 Learning Outcomes Tagged · Verified Academic Grounding
          </p>
        </div>

        {/* Generate / Regenerate Action */}
        <div className="flex items-center gap-2 self-start lg:self-auto">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white transition-colors flex items-center gap-2 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isGenerating ? 'Drafting Lesson... (AI)' : 'Generate AI Lesson'}</span>
          </button>
        </div>
      </div>

      {/* Two-Pane Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT PANE: Cascading Selectors & Learning Outcomes (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Topic & Course Meta Card */}
          <div className="p-5 rounded-2xl bg-navy-900/80 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Curriculum Parameters
            </h3>

            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">PROGRAMME & COURSE</label>
              <div className="p-2.5 rounded-lg bg-navy-950 border border-slate-800 text-xs text-white font-medium">
                B.Tech CSE · CS-501 Artificial Intelligence
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">LECTURE TOPIC</label>
              <div className="p-2.5 rounded-lg bg-navy-950 border border-slate-800 text-xs text-white font-medium">
                Topic 4: Neural Networks & Backpropagation
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">TARGET COHORT</label>
              <div className="p-2.5 rounded-lg bg-navy-950 border border-slate-800 text-xs text-white font-medium">
                Section 5-A (57 Enrolled Students)
              </div>
            </div>
          </div>

          {/* Anchored Learning Outcomes */}
          {topic && (
            <div className="p-5 rounded-2xl bg-navy-900/80 border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Mapped Learning Outcomes
              </h3>
              <div className="space-y-2">
                {topic.outcomes.map((lo) => (
                  <div
                    key={lo.id}
                    className="p-2.5 rounded-lg bg-navy-950/80 border border-slate-800 text-xs text-slate-200"
                  >
                    <span className="font-mono font-bold text-indigo-400 block mb-0.5">
                      {lo.code}
                    </span>
                    <span className="text-[11px] leading-snug">{lo.statement}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Approved Sources */}
          {sources.length > 0 && (
            <div className="p-5 rounded-2xl bg-navy-900/80 border border-slate-800 space-y-2.5">
              <div className="flex items-center gap-2">
                <Quote className="w-4 h-4 text-violet-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Approved Academic Source
                </h3>
              </div>
              <div className="p-3 rounded-lg bg-violet-950/20 border border-violet-500/25 text-xs text-violet-200 leading-relaxed">
                <div className="font-semibold text-white mb-1">{sources[0].title}</div>
                <div className="text-[11px] text-violet-300/80">{sources[0].citation}</div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANE: Structured Lesson Editor & Workflow (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {lesson ? (
            <div className="space-y-6">
              {/* Stepper Status Bar */}
              <div className="p-4 rounded-2xl bg-navy-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono uppercase text-slate-400 font-bold">
                    WORKFLOW:
                  </span>
                  <StatusBadge status={lesson.status} />
                  <span className="text-xs font-mono text-slate-400">
                    Unedited AI: <strong className="text-white">{lesson.unedited_ai_pct}%</strong>
                  </span>
                </div>

                {/* Workflow Action Transitions (CR-08) */}
                <div className="flex flex-wrap items-center gap-2">
                  {lesson.status === 'DRAFT' && (
                    <button
                      onClick={handleReview}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white transition-colors"
                    >
                      Mark Reviewed
                    </button>
                  )}

                  {lesson.status === 'REVIEWED' && (
                    <button
                      onClick={handleApprove}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center gap-1.5"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Approve Lesson</span>
                    </button>
                  )}

                  {lesson.status === 'APPROVED' && (
                    <button
                      onClick={handlePublish}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Publish Lesson</span>
                    </button>
                  )}

                  {lesson.status === 'PUBLISHED' && (
                    <button
                      onClick={handleStartClass}
                      className="px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <Presentation className="w-3.5 h-3.5" />
                      <span>Start Live Class</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Lesson Blocks List */}
              <div className="space-y-4">
                {lesson.blocks.map((block) => {
                  const isEditing = editingBlockId === block.id;
                  const isRegenerating = regeneratingBlockId === block.id;

                  return (
                    <div
                      key={block.id}
                      className="p-5 rounded-2xl bg-navy-900/70 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
                    >
                      {/* Block Header */}
                      <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-800/80">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-md bg-slate-800 text-slate-300 text-xs font-mono font-bold flex items-center justify-center">
                            #{block.seq}
                          </span>
                          <span className="text-xs font-mono font-bold uppercase text-indigo-400">
                            {block.type.replace('_', ' ')}
                          </span>
                          {block.outcome_ids && (
                            <span className="text-[10px] font-mono text-slate-400">
                              (LO{block.outcome_ids.join(', LO')})
                            </span>
                          )}
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400">
                            Origin: {block.origin}
                          </span>
                        </div>

                        {/* Edit & Regenerate buttons (disabled if Approved/Published) */}
                        {lesson.status !== 'APPROVED' && lesson.status !== 'PUBLISHED' && (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                setEditingBlockId(block.id);
                                setEditText(block.content.text || '');
                              }}
                              className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                              title="Edit Block Content"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleRegenerateBlock(block.id)}
                              disabled={isRegenerating}
                              className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-indigo-400 transition-colors"
                              title="Regenerate with AI"
                            >
                              <RotateCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin text-indigo-400' : ''}`} />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Title if present */}
                      {block.title && (
                        <h4 className="text-sm font-bold text-white">
                          {block.title}
                        </h4>
                      )}

                      {/* Content Renderer or Inline Editor */}
                      {isEditing ? (
                        <div className="space-y-3 pt-2">
                          <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            rows={4}
                            className="w-full bg-navy-950 border border-indigo-500 rounded-xl p-3 text-xs text-white focus:outline-none"
                          />
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setEditingBlockId(null)}
                              className="px-3 py-1 rounded-lg text-xs bg-slate-800 text-slate-300"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveBlockEdit(block.id)}
                              className="px-3 py-1 rounded-lg text-xs bg-indigo-600 text-white font-semibold"
                            >
                              Save Changes
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                          {block.content.text && <p>{block.content.text}</p>}
                          {block.content.subtext && <p className="text-slate-400 italic text-xs mt-1">{block.content.subtext}</p>}
                          {block.content.items && (
                            <ul className="list-disc pl-4 space-y-1 mt-2 text-xs">
                              {block.content.items.map((it, i) => (
                                <li key={i}>{it}</li>
                              ))}
                            </ul>
                          )}
                          {block.content.question && (
                            <div className="p-3 rounded-lg bg-navy-950 border border-slate-800 mt-2">
                              <span className="font-bold text-white block mb-1">Concept Check:</span>
                              <p className="text-xs text-slate-300">{block.content.question}</p>
                              {block.content.answer && (
                                <span className="text-[11px] text-emerald-400 block mt-1">Answer: {block.content.answer}</span>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl bg-navy-900/60 border border-dashed border-slate-800 text-slate-400 space-y-3">
              <Sparkles className="w-8 h-8 text-indigo-400 mx-auto" />
              <h3 className="text-base font-bold text-white">No Lecture Draft Generated Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Select your parameters and click "Generate AI Lesson" to draft an outcome-anchored lecture block suite.
              </p>
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="mt-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md"
              >
                Draft Lesson Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
