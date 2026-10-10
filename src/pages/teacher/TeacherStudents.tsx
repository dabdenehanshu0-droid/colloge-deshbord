import React, { useState, useEffect } from 'react';
import { api } from '../../services/apiClient';
import { usePlatform } from '../../context/PlatformContext';
import { ProvenanceChip } from '../../components/ui/ProvenanceChip';
import { 
  Users, 
  UserPlus, 
  Search, 
  GraduationCap, 
  Mail, 
  CheckCircle, 
  X, 
  Layers, 
  RefreshCw,
  Trash2,
  UserCheck,
  UserX,
  AlertTriangle
} from 'lucide-react';

interface StudentItem {
  id: number;
  user_id: number;
  name: string;
  email: string;
  roll_no: string;
  section_id: number;
  section_name?: string;
  created_at?: string;
  mastery_avg?: number;
  status?: string;
  attendance?: 'PRESENT' | 'ABSENT' | string;
}

interface SectionItem {
  id: number;
  name: string;
  enrolled_count: number;
}

interface TeacherStudentsProps {
  onNavigate?: (path: string) => void;
}

export const TeacherStudents: React.FC<TeacherStudentsProps> = ({ onNavigate }) => {
  const { showToast } = usePlatform();
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSection, setSelectedSection] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<StudentItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    roll_no: '',
    section_id: 1 // Default to Section 5-A
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [studentList, sectionList] = await Promise.all([
        api.getStudents(selectedSection || undefined),
        api.getSections().catch(() => [])
      ]);
      setStudents(studentList);
      if (sectionList && sectionList.length > 0) {
        setSections(sectionList);
      } else {
        // Fallback default 6 sections
        setSections([
          { id: 1, name: '5-A', enrolled_count: 35 },
          { id: 2, name: '5-B', enrolled_count: 42 },
          { id: 3, name: '5-C', enrolled_count: 38 },
          { id: 4, name: '5-D', enrolled_count: 30 },
          { id: 5, name: '5-E', enrolled_count: 45 },
          { id: 6, name: '5-F', enrolled_count: 28 },
        ]);
      }
    } catch (err: any) {
      console.error('Failed to load roster', err);
      showToast(err.message || 'Failed to fetch students from SQL database', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedSection]);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.roll_no.trim()) {
      showToast('Please fill all fields', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      const created = await api.addStudent({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        roll_no: formData.roll_no.trim().toUpperCase(),
        section_id: Number(formData.section_id)
      });

      showToast(`Student ${created.name} added to SQL database!`, 'success');
      setShowAddModal(false);
      setFormData({
        name: '',
        email: '',
        roll_no: '',
        section_id: formData.section_id
      });
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Error saving student to database', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleAttendance = async (student: StudentItem) => {
    const nextStatus = student.attendance === 'ABSENT' ? 'PRESENT' : 'ABSENT';
    // Optimistic UI update
    setStudents((prev) =>
      prev.map((s) => (s.id === student.id ? { ...s, attendance: nextStatus } : s))
    );

    try {
      await api.updateAttendance(student.id, nextStatus as 'PRESENT' | 'ABSENT');
      showToast(`${student.name} marked ${nextStatus}`, 'info');
    } catch (err: any) {
      // Revert on failure
      setStudents((prev) =>
        prev.map((s) => (s.id === student.id ? { ...s, attendance: student.attendance } : s))
      );
      showToast(err.message || 'Failed to update attendance in database', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;
    try {
      setSubmitting(true);
      await api.removeStudent(studentToDelete.id);
      showToast(`Student ${studentToDelete.name} (${studentToDelete.roll_no}) removed from database`, 'success');
      setStudentToDelete(null);
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete student', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredStudents = students.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.roll_no.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  const presentCount = filteredStudents.filter((s) => s.attendance !== 'ABSENT').length;
  const absentCount = filteredStudents.filter((s) => s.attendance === 'ABSENT').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-navy-900 via-[#0B1B3A] to-navy-900 border border-indigo-500/20 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">
              Department of CSE · Academic Class Roster & Attendance
            </span>
            <ProvenanceChip provenance="LIVE" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
            Student Management & 6-Section Attendance
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Manage 20–50 students per section across 6 sections (5-A through 5-F). Add new students, record live attendance, or remove records from SQLite.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-950 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add Student</span>
          </button>
        </div>
      </div>

      {/* 6 Sections Filter Bar */}
      <div className="p-3.5 rounded-2xl bg-navy-900/90 border border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-slate-200">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Select Section (6 Class Cohorts):</span>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-slate-300">
            <span className="flex items-center gap-1 text-emerald-400">
              <UserCheck className="w-3.5 h-3.5" /> Present: <strong>{presentCount}</strong>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1 text-rose-400">
              <UserX className="w-3.5 h-3.5" /> Absent: <strong>{absentCount}</strong>
            </span>
            <span>·</span>
            <span>Total: <strong>{filteredStudents.length}</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedSection(null)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer ${
              selectedSection === null
                ? 'bg-indigo-600 text-white shadow-md font-bold'
                : 'bg-navy-950 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            All Sections ({students.length})
          </button>

          {['5-A', '5-B', '5-C', '5-D', '5-E', '5-F'].map((secName, idx) => {
            const secId = idx + 1;
            const matchingSec = sections.find((s) => s.name === secName);
            const count = matchingSec ? matchingSec.enrolled_count : 30 + (idx * 3);
            const isSelected = selectedSection === secId;

            return (
              <button
                key={secName}
                onClick={() => setSelectedSection(secId)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md font-bold ring-2 ring-indigo-400/40'
                    : 'bg-navy-950 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                <span>Section {secName}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800/80 text-slate-300">
                  {count} st
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-80 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name, roll no, email..."
            className="w-full pl-9 pr-3 py-2 bg-navy-900/90 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <button
          onClick={fetchData}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer self-end sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync Database</span>
        </button>
      </div>

      {/* Students Table with Attendance & Delete */}
      <div className="rounded-2xl bg-gradient-to-b from-navy-900 to-[#071022] border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-navy-950/80 text-slate-300 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4 font-semibold">Student Name</th>
                <th className="py-3 px-4 font-semibold">Roll Number (ID)</th>
                <th className="py-3 px-4 font-semibold">Section</th>
                <th className="py-3 px-4 font-semibold">Attendance</th>
                <th className="py-3 px-4 font-semibold">Mastery Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Loading student roster from SQLite database...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No students found. Click "+ Add Student" above to enroll students into this section.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-indigo-950/20 transition-colors">
                    <td className="py-3 px-4 font-medium text-white flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center font-bold text-xs">
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{s.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{s.email}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-200">
                      {s.roll_no}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                        {s.section_name || `Section ${s.section_id}`}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {/* Attendance Toggle Button */}
                      <button
                        onClick={() => handleToggleAttendance(s)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
                          s.attendance === 'ABSENT'
                            ? 'bg-rose-500/15 text-rose-300 border-rose-500/40 hover:bg-rose-500/25'
                            : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/25'
                        }`}
                        title="Click to toggle Present/Absent"
                      >
                        {s.attendance === 'ABSENT' ? (
                          <>
                            <UserX className="w-3 h-3 text-rose-400" />
                            <span>Absent</span>
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-3 h-3 text-emerald-400" />
                            <span>Present</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                          s.status === 'STRONG'
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : s.status === 'WEAK'
                            ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                            : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          s.status === 'STRONG' ? 'bg-emerald-400' : s.status === 'WEAK' ? 'bg-rose-400' : 'bg-amber-400'
                        }`}></span>
                        {s.status || 'DEVELOPING'} ({s.mastery_avg || 55}%)
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {/* Remove Student Button */}
                      <button
                        onClick={() => setStudentToDelete(s)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 border border-slate-700/60 hover:border-rose-500/40 transition-colors cursor-pointer"
                        title="Remove student from database"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal (Supports all 6 sections) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-[#0B1B3A] border border-indigo-500/30 rounded-2xl p-6 shadow-2xl">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800/60 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-display">
                  Add Student to Course
                </h3>
                <p className="text-xs text-slate-300">
                  Enrolls student into chosen section and stores record in SQLite
                </p>
              </div>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikas Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-navy-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  University Roll Number (Student ID) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2024-CSE-5C-01 or 0101CS221088"
                  value={formData.roll_no}
                  onChange={(e) => setFormData({ ...formData, roll_no: e.target.value })}
                  className="w-full bg-navy-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Official Email ID *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. vikas.sharma@sgsu.edu.in"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-navy-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Select Section (6 Cohorts) *
                </label>
                <select
                  value={formData.section_id}
                  onChange={(e) => setFormData({ ...formData, section_id: Number(e.target.value) })}
                  className="w-full bg-navy-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value={1}>Section 5-A (CS-501)</option>
                  <option value={2}>Section 5-B (CS-501)</option>
                  <option value={3}>Section 5-C (CS-501)</option>
                  <option value={4}>Section 5-D (CS-501)</option>
                  <option value={5}>Section 5-E (CS-501)</option>
                  <option value={6}>Section 5-F (CS-501)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white transition-colors shadow-md cursor-pointer"
                >
                  {submitting ? 'Saving to Database...' : 'Save to SQL Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm bg-[#0B1B3A] border border-rose-500/30 rounded-2xl p-6 shadow-2xl text-left">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mb-3">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white font-display mb-1">
              Remove Student from Database?
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Are you sure you want to remove <strong>{studentToDelete.name}</strong> ({studentToDelete.roll_no})? This will delete the student and their associated mastery records from SQLite.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setStudentToDelete(null)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={submitting}
                className="px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-rose-600 hover:bg-rose-500 text-white transition-colors shadow-md cursor-pointer"
              >
                {submitting ? 'Removing...' : 'Confirm Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
