import React, { useEffect, useState } from 'react';
import { api } from '../../services/apiClient';
import { Course, Topic } from '../../types';
import { 
  BookOpen, 
  Sparkles, 
  BarChart2, 
  Layers, 
  Plus, 
  Trash2, 
  Mail, 
  MessageSquare, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  X,
  ChevronRight,
  Send
} from 'lucide-react';
import { ProvenanceChip } from '../../components/ui/ProvenanceChip';
import { usePlatform } from '../../context/PlatformContext';

interface TeacherCoursesProps {
  onNavigate: (path: string) => void;
}

export const TeacherCourses: React.FC<TeacherCoursesProps> = ({ onNavigate }) => {
  const { user, showToast } = usePlatform();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [studentQueries, setStudentQueries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'subjects' | 'queries'>('subjects');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [queryToReply, setQueryToReply] = useState<any | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Subject Form
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    programme: 'B.Tech Computer Science & Engineering',
    semester: 5
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [courseList, topicData, queries] = await Promise.all([
        api.getCourses(),
        api.getTopic(101).catch(() => null),
        api.getStudentQueries(user?.email || 'sharma@sgsu.ac.in').catch(() => [])
      ]);
      setCourses(courseList);
      if (courseList.length > 0 && !selectedCourseId) {
        setSelectedCourseId(courseList[0].id);
      }
      setTopic(topicData);
      setStudentQueries(queries);
    } catch (err) {
      console.error('Failed to load courses', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.name.trim()) {
      showToast('Please fill in Course Code and Title', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.addCourse(formData);
      showToast(`Subject "${formData.name}" added successfully!`, 'success');
      setShowAddModal(false);
      setFormData({
        code: '',
        name: '',
        programme: 'B.Tech Computer Science & Engineering',
        semester: 5
      });
      await fetchData();
    } catch (err: any) {
      showToast(err.message || 'Failed to add subject', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;
    try {
      setIsSubmitting(true);
      await api.removeCourse(courseToDelete.id);
      showToast(`Subject "${courseToDelete.name}" removed from curriculum`, 'success');
      setShowDeleteModal(false);
      setCourseToDelete(null);
      await fetchData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete course', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReplyQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryToReply || !replyText.trim()) return;
    try {
      setIsSubmitting(true);
      await api.replyStudentQuery(queryToReply.id, replyText.trim());
      showToast('Reply dispatched to student successfully!', 'success');
      setShowReplyModal(false);
      setQueryToReply(null);
      setReplyText('');
      await fetchData();
    } catch (err: any) {
      showToast(err.message || 'Failed to dispatch reply', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && !courses.length) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading course curriculum and queries...</div>;
  }

  const selectedCourse = courses.find(c => c.id === selectedCourseId) || courses[0];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-[#0B1B3A] border border-slate-200 dark:border-indigo-500/20 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Assigned Subjects & Student Inbound Queries
            </span>
            <ProvenanceChip provenance="LIVE" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-display">
            Subject & Curriculum Management
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
            Scope Global Skills University · Department of Computer Science & Engineering
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add New Subject</span>
          </button>
          <button
            onClick={() => onNavigate('/teacher/lesson-builder')}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>New AI Lecture</span>
          </button>
        </div>
      </div>

      {/* Tabs: Subjects vs Student Queries */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('subjects')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'subjects'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/60'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Assigned Subjects ({courses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('queries')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'queries'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/60'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Student Email Queries ({studentQueries.length})</span>
          {studentQueries.filter(q => q.status === 'OPEN').length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-500 text-white font-mono font-bold">
              {studentQueries.filter(q => q.status === 'OPEN').length} New
            </span>
          )}
        </button>
      </div>

      {/* VIEW 1: SUBJECTS LIST & TOPIC DETAILS */}
      {activeTab === 'subjects' && (
        <div className="space-y-6">
          {/* Subject Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => {
              const isSelected = selectedCourse?.id === course.id;
              return (
                <div
                  key={course.id}
                  onClick={() => setSelectedCourseId(course.id)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-md ${
                    isSelected
                      ? 'bg-indigo-50/50 dark:bg-navy-900 border-indigo-500 shadow-indigo-100 dark:shadow-none ring-2 ring-indigo-500/20'
                      : 'bg-white dark:bg-navy-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300">
                          {course.code}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                          {course.name}
                        </h4>
                      </div>
                    </div>

                    {courses.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCourseToDelete(course);
                          setShowDeleteModal(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        title="Remove Subject"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 font-normal">
                    {course.programme} · Sem {course.semester}
                  </p>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <span className="font-mono text-slate-500 dark:text-slate-400">
                      {course.sections?.length || 1} Section(s)
                    </span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                      {isSelected ? 'Viewing' : 'Select'} <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Course Details Card */}
          {selectedCourse && (
            <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                      {selectedCourse.code}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
                      {selectedCourse.name}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    {selectedCourse.programme} · Semester {selectedCourse.semester}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                  {selectedCourse.sections?.map((sec) => (
                    <span
                      key={sec.id}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                    >
                      Section {sec.name}: <strong className="text-slate-900 dark:text-white">{sec.enrolled_count || 35} Enrolled</strong>
                    </span>
                  ))}
                </div>
              </div>

              {/* Active Topic & Outcomes */}
              {topic && (
                <div className="p-5 rounded-xl bg-slate-50 dark:bg-navy-950/70 border border-slate-200 dark:border-slate-800/80 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 uppercase font-bold block mb-0.5">
                        ACTIVE TOPIC #{topic.seq}
                      </span>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">
                        {topic.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onNavigate('/teacher/lesson-builder')}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Open in Lecture Builder</span>
                      </button>
                      <button
                        onClick={() => onNavigate('/teacher/insights')}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <BarChart2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span>Class Insights</span>
                      </button>
                    </div>
                  </div>

                  {/* Outcomes Grid */}
                  <div>
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2 font-semibold">
                      Anchored Learning Outcomes (LO1–LO4):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {topic.outcomes.map((lo) => (
                        <div
                          key={lo.id}
                          className="p-3 rounded-lg bg-white dark:bg-navy-900/90 border border-slate-200 dark:border-slate-800 flex items-start gap-2.5 text-xs text-slate-800 dark:text-slate-200 shadow-sm"
                        >
                          <span className="px-1.5 py-0.5 rounded font-mono font-bold bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 shrink-0">
                            {lo.code}
                          </span>
                          <span className="font-medium leading-relaxed">{lo.statement}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Prerequisites */}
                  <div className="pt-2">
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2 font-semibold">
                      Required Prerequisite Dependencies:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {topic.prerequisites.map((p) => (
                        <div
                          key={p.id}
                          className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2 shadow-sm"
                        >
                          <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{p.code}</span>
                          <span>{p.statement}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: STUDENT INBOUND EMAIL QUERIES */}
      {activeTab === 'queries' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
                Inbound Student Academic Email Queries
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Questions dispatched directly to teacher email ({user?.email || 'sharma@sgsu.ac.in'}) from student portal
              </p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-200 dark:border-indigo-500/30">
              {studentQueries.length} Total Queries
            </span>
          </div>

          {studentQueries.length === 0 ? (
            <div className="p-10 text-center text-slate-500 space-y-2">
              <Mail className="w-10 h-10 mx-auto text-slate-400" />
              <p className="font-semibold text-sm">No incoming student queries yet.</p>
              <p className="text-xs">Students can submit doubts directly from their portal to your official university mail.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {studentQueries.map((query) => (
                <div
                  key={query.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-navy-950/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        query.status === 'RESOLVED' 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300' 
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300'
                      }`}>
                        {query.status}
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {query.subject}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        From: {query.student_name} ({query.student_roll})
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300 font-normal">
                      "{query.question}"
                    </p>

                    {query.reply && (
                      <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/30 text-xs text-emerald-900 dark:text-emerald-300 mt-2">
                        <strong className="block text-[11px]">Your Reply (Sent to Student):</strong>
                        {query.reply}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    {query.status === 'OPEN' ? (
                      <button
                        onClick={() => {
                          setQueryToReply(query);
                          setReplyText('');
                          setShowReplyModal(true);
                        }}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Reply & Resolve</span>
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> Resolved
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: ADD NEW SUBJECT */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#0B1B3A] border border-slate-200 dark:border-indigo-500/30 p-6 shadow-2xl text-slate-800 dark:text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                  Add New Subject / Course
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCourse} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Subject / Course Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CS-502 or AI-401"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Subject Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deep Learning & Computer Vision"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Academic Programme
                </label>
                <input
                  type="text"
                  value={formData.programme}
                  onChange={(e) => setFormData({ ...formData, programme: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Semester
                </label>
                <input
                  type="number"
                  min="1"
                  max="8"
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) || 5 })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Create Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE SUBJECT CONFIRMATION */}
      {showDeleteModal && courseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#0B1B3A] border border-slate-200 dark:border-rose-500/30 p-6 shadow-2xl text-slate-800 dark:text-white">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Remove Subject?
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to remove <strong>{courseToDelete.name} ({courseToDelete.code})</strong>? All linked class sections and topic associations will be deleted from SQLite.
            </p>
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCourse}
                disabled={isSubmitting}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white disabled:opacity-50"
              >
                {isSubmitting ? 'Deleting...' : 'Confirm Remove'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REPLY TO STUDENT QUERY */}
      {showReplyModal && queryToReply && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#0B1B3A] border border-slate-200 dark:border-indigo-500/30 p-6 shadow-2xl text-slate-800 dark:text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Reply to Student Query
                </h3>
              </div>
              <button
                onClick={() => setShowReplyModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-navy-950 text-xs space-y-1">
              <span className="font-bold text-slate-900 dark:text-white block">{queryToReply.subject}</span>
              <p className="text-slate-700 dark:text-slate-300">"{queryToReply.question}"</p>
              <span className="text-[10px] text-slate-500 font-mono block">From: {queryToReply.student_name} ({queryToReply.student_roll})</span>
            </div>

            <form onSubmit={handleReplyQuery} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Your Answer / Clarification
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Type your explanation or guidance for the student..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReplyModal(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !replyText.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Sending...' : 'Send Email Reply'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
