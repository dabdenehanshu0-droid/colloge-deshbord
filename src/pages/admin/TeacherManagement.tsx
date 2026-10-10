import React, { useState, useEffect } from 'react';
import { api } from '../../services/apiClient';
import { usePlatform } from '../../context/PlatformContext';
import { ProvenanceChip } from '../../components/ui/ProvenanceChip';
import { 
  GraduationCap, 
  UserPlus, 
  Trash2, 
  Search, 
  RefreshCw, 
  Building2, 
  Mail, 
  CheckCircle, 
  AlertTriangle,
  X,
  Layers
} from 'lucide-react';

interface TeacherItem {
  id: number;
  user_id: number;
  name: string;
  email: string;
  department: string;
  sections?: string[];
  created_at?: string;
}

interface TeacherManagementProps {
  onNavigate?: (path: string) => void;
}

export const TeacherManagement: React.FC<TeacherManagementProps> = ({ onNavigate }) => {
  const { showToast } = usePlatform();
  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<TeacherItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: 'Computer Science & Engineering',
  });

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const list = await api.getTeachers();
      setTeachers(list);
    } catch (err: any) {
      console.error('Failed to load teachers', err);
      showToast(err.message || 'Failed to fetch faculty teachers from SQL', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      showToast('Please fill all required fields', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.addTeacher({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        department: formData.department.trim(),
      });
      showToast(`Faculty ${res.name} enrolled in university database!`, 'success');
      setShowAddModal(false);
      setFormData({
        name: '',
        email: '',
        department: 'Computer Science & Engineering',
      });
      fetchTeachers();
    } catch (err: any) {
      showToast(err.message || 'Failed to add teacher to database', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!teacherToDelete) return;
    try {
      setSubmitting(true);
      await api.removeTeacher(teacherToDelete.id);
      showToast(`Teacher ${teacherToDelete.name} removed from university records`, 'success');
      setTeacherToDelete(null);
      fetchTeachers();
    } catch (err: any) {
      showToast(err.message || 'Cannot remove teacher', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTeachers = teachers.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.email.toLowerCase().includes(search.toLowerCase()) ||
    t.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-navy-900 via-[#0B1B3A] to-navy-900 border border-indigo-500/20 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-violet-400">
              University Academic Administration · Faculty Roster
            </span>
            <ProvenanceChip provenance="LIVE" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
            Teacher & Faculty Management (SQL)
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Add new faculty educators to SQLite or remove outgoing instructors. Persisted in university database.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-950 transition-all cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Add New Teacher</span>
        </button>
      </div>

      {/* Filter and Stats Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-80 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search teacher by name, email, department..."
            className="w-full pl-9 pr-3 py-2 bg-navy-900/90 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-300">
            Total Faculty: <strong className="text-white">{teachers.length}</strong>
          </span>
          <button
            onClick={fetchTeachers}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Teachers</span>
          </button>
        </div>
      </div>

      {/* Faculty Teachers Table */}
      <div className="rounded-2xl bg-gradient-to-b from-navy-900 to-[#071022] border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-navy-950/80 text-slate-300 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4 font-semibold">Faculty Name</th>
                <th className="py-3 px-4 font-semibold">Email Address</th>
                <th className="py-3 px-4 font-semibold">Department</th>
                <th className="py-3 px-4 font-semibold">Assigned Sections</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Loading faculty roster from database...
                  </td>
                </tr>
              ) : filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No faculty found. Click "+ Add New Teacher" above to enroll.
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((t) => (
                  <tr key={t.id} className="hover:bg-indigo-950/20 transition-colors">
                    <td className="py-3 px-4 font-medium text-white flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-violet-600/20 text-violet-300 border border-violet-500/30 flex items-center justify-center font-bold text-xs">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-white">{t.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">Teacher ID #{t.id}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {t.email}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {t.department}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {t.sections && t.sections.length > 0 ? (
                          t.sections.map((secName, i) => (
                            <span key={i} className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                              {secName}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-slate-500 italic">Sections 5-A to 5-F</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setTeacherToDelete(t)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 border border-slate-700/60 hover:border-rose-500/40 transition-colors cursor-pointer"
                        title="Remove teacher from university records"
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

      {/* Add Teacher Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-[#0B1B3A] border border-violet-500/30 rounded-2xl p-6 shadow-2xl">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800/60 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30 flex items-center justify-center">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-display">
                  Add Faculty Teacher
                </h3>
                <p className="text-xs text-slate-300">
                  Creates teacher account in SQLite database
                </p>
              </div>
            </div>

            <form onSubmit={handleAddTeacher} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name & Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Priya Nair"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-navy-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Official Faculty Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. priya.nair@sgsu.edu.in"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-navy-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Department *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Computer Science & Engineering"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full bg-navy-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                />
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
                  className="px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white transition-colors shadow-md cursor-pointer"
                >
                  {submitting ? 'Saving to Database...' : 'Save to SQL Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {teacherToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm bg-[#0B1B3A] border border-rose-500/30 rounded-2xl p-6 shadow-2xl text-left">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mb-3">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white font-display mb-1">
              Remove Teacher from Records?
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Are you sure you want to remove <strong>{teacherToDelete.name}</strong> ({teacherToDelete.email})? They will be removed from university faculty records in SQLite.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setTeacherToDelete(null)}
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
