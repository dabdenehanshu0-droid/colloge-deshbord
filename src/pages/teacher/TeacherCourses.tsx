import React, { useEffect, useState } from 'react';
import { api } from '../../services/apiClient';
import { Course, Topic } from '../../types';
import { BookOpen, Sparkles, BarChart2, Layers, ArrowRight } from 'lucide-react';
import { ProvenanceChip } from '../../components/ui/ProvenanceChip';

interface TeacherCoursesProps {
  onNavigate: (path: string) => void;
}

export const TeacherCourses: React.FC<TeacherCoursesProps> = ({ onNavigate }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseList, topicData] = await Promise.all([
          api.getCourses(),
          api.getTopic(101)
        ]);
        setCourses(courseList);
        setTopic(topicData);
      } catch (err) {
        console.error('Failed to load courses', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !courses.length) {
    return <div className="p-8 text-center text-slate-400">Loading course curriculum...</div>;
  }

  const primaryCourse = courses[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0B1B3A] border border-indigo-500/20 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">
              Assigned Courses & Curriculum Graph
            </span>
            <ProvenanceChip provenance="MIXED" />
          </div>
          <h2 className="text-2xl font-bold text-white font-display">
            My Courses & Learning Outcome Mappings
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Scope Global Skills University · Department of Computer Science & Engineering
          </p>
        </div>

        <button
          onClick={() => onNavigate('/teacher/lesson-builder')}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center gap-2 shadow-sm self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>New AI Lecture</span>
        </button>
      </div>

      {/* Course Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-b from-navy-900 to-[#071022] border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {primaryCourse.code}
                </span>
                <h3 className="text-lg font-bold text-white font-display">
                  {primaryCourse.name}
                </h3>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {primaryCourse.programme} · {primaryCourse.semester}
              </p>
            </div>
          </div>

          {/* Sections Badge */}
          <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
            {primaryCourse.sections.map((sec) => (
              <span
                key={sec.id}
                className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700"
              >
                {sec.name}: <strong className="text-white">{sec.enrolled_count} Enrolled</strong>
              </span>
            ))}
          </div>
        </div>

        {/* Selected Topic & Learning Outcomes */}
        {topic && (
          <div className="p-5 rounded-xl bg-navy-950/70 border border-slate-800/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-mono text-indigo-400 uppercase font-bold block mb-0.5">
                  ACTIVE TOPIC #{topic.seq}
                </span>
                <h4 className="text-base font-bold text-white">
                  {topic.title}
                </h4>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('/teacher/lesson-builder')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Open in Lecture Builder</span>
                </button>
                <button
                  onClick={() => onNavigate('/teacher/insights')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
                >
                  <BarChart2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Class Insights</span>
                </button>
              </div>
            </div>

            {/* Outcomes Grid */}
            <div>
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-2">
                Anchored Learning Outcomes (LO1–LO4):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {topic.outcomes.map((lo) => (
                  <div
                    key={lo.id}
                    className="p-3 rounded-lg bg-navy-900/90 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-200"
                  >
                    <span className="px-1.5 py-0.5 rounded font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0">
                      {lo.code}
                    </span>
                    <span className="font-medium leading-relaxed">{lo.statement}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Prerequisites */}
            <div className="pt-2">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-2">
                Required Prerequisite Dependencies:
              </span>
              <div className="flex flex-wrap gap-2">
                {topic.prerequisites.map((p) => (
                  <div
                    key={p.id}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center gap-2"
                  >
                    <span className="font-mono font-bold text-amber-400">{p.code}</span>
                    <span>{p.statement}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
