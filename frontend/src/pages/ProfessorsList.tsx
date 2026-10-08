import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Plus, Trash2, X, Check, Search, 
  Mail, Building, BookOpen, ToggleLeft, ToggleRight 
} from 'lucide-react';
import { api, Professor } from '../services/api';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export default function ProfessorsList() {
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
    subject: '',
  });

  useEffect(() => {
    loadProfessors();
  }, []);

  const loadProfessors = async () => {
    try {
      const response = await api.getAllProfessors();
      if (response.success) {
        setProfessors(response.professors);
      }
    } catch (error) {
      console.error('Error loading professors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await api.registerProfessor({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        department: formData.department || undefined,
        subject: formData.subject || undefined,
      });

      if (response.success) {
        loadProfessors();
        setShowAddModal(false);
        resetForm();
      } else {
        setError(response.message || 'Failed to add professor');
      }
    } catch {
      setError('Connection error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this professor?')) return;

    try {
      const response = await api.deleteProfessor(id);
      if (response.success) {
        loadProfessors();
      }
    } catch (error) {
      console.error('Error deleting professor:', error);
    }
  };

  const handleToggleActive = async (professor: Professor) => {
    try {
      await api.updateProfessor(professor.professor_id, {
        is_active: !professor.is_active,
      });
      loadProfessors();
    } catch (error) {
      console.error('Error updating professor:', error);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '', department: '', subject: '' });
    setError('');
  };

  const filteredProfessors = professors.filter(p =>
    p.professor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Professors
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage professor accounts
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Professor
        </button>
      </motion.div>

      {/* Search */}
      <motion.div variants={itemVariants} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search professors..."
          className="input-field pl-10"
        />
      </motion.div>

      {/* Professors List */}
      <motion.div variants={itemVariants} className="card overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filteredProfessors.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400">No professors found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase hidden md:table-cell">Department</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase hidden md:table-cell">Subject</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredProfessors.map((professor) => (
                  <tr key={professor.professor_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900 dark:text-white">{professor.professor_name}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{professor.email}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 hidden md:table-cell">{professor.department || '-'}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 hidden md:table-cell">{professor.subject || '-'}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleActive(professor)}
                        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                          professor.is_active
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {professor.is_active ? (
                          <>
                            <ToggleRight className="w-3.5 h-3.5" />
                            Active
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-3.5 h-3.5" />
                            Inactive
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(professor.professor_id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Add Professor Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => { setShowAddModal(false); resetForm(); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="card p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Add Professor
                </h2>
                <button
                  onClick={() => { setShowAddModal(false); resetForm(); }}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input-field pl-10"
                      placeholder="professor@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input-field"
                    placeholder="Create password"
                    required
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Department
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="input-field pl-10"
                      placeholder="e.g., Computer Science"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Subject
                  </label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="input-field pl-10"
                      placeholder="e.g., Mathematics"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setShowAddModal(false); resetForm(); }}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
                    <Check className="w-5 h-5" />
                    Add Professor
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
