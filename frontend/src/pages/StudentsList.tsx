import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, User, Mail, Calendar, Users, Plus, Camera, GraduationCap } from 'lucide-react';
import { api, Student } from '../services/api';
import Notification from '../components/Notification';
import FileUpload from '../components/FileUpload';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export default function StudentsList() {
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', class: '' });
  const [photos, setPhotos] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [searchTerm, classFilter, students]);

  const loadStudents = async () => {
    setIsLoading(true);
    try {
      const response = await api.getAllStudents();
      if (response.success) {
        setAllStudents(response.students);
        setStudents(response.students);
        setFilteredStudents(response.students);
      } else {
        setNotification({
          type: 'error',
          message: 'Erreur lors du chargement des etudiants',
        });
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Erreur de connexion au serveur',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadStudentsByClass = async (className: string) => {
    if (!className) {
      setStudents(allStudents);
      setFilteredStudents(allStudents);
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.getStudentsByClass(className);
      if (response.success) {
        setStudents(response.students);
        setFilteredStudents(response.students);
      } else {
        setNotification({
          type: 'error',
          message: 'Erreur lors du filtrage par classe',
        });
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Erreur de connexion au serveur',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = students;

    if (searchTerm) {
      filtered = filtered.filter(
        (student) =>
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredStudents(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      setNotification({
        type: 'error',
        message: 'Veuillez remplir tous les champs obligatoires',
      });
      return;
    }

    if (photos.length === 0) {
      setNotification({
        type: 'error',
        message: 'Veuillez télécharger au moins une photo',
      });
      return;
    }

    setIsSubmitting(true);
    setNotification(null);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('email', formData.email);
      data.append('class', formData.class);
      photos.forEach((photo) => {
        data.append('photos', photo);
      });

      const response = await api.registerStudent(data);

      if (response.success) {
        setNotification({
          type: 'success',
          message: `Étudiant enregistré avec succès! (${response.photos_analyzed} photos analysées)`,
        });
        setShowAddForm(false);
        setFormData({ name: '', email: '', class: '' });
        setPhotos([]);
        loadStudents();
      } else {
        setNotification({
          type: 'error',
          message: response.message || 'Erreur lors de l\'enregistrement',
        });
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Erreur de connexion au serveur',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const uniqueClasses = Array.from(new Set(allStudents.map((s) => s.class).filter(Boolean)));

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-brand-50 dark:bg-brand-900/20">
              <Users className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
                Etudiants
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {allStudents.length} etudiant{allStudents.length > 1 ? 's' : ''} enregistre{allStudents.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Student
          </button>
        </div>
      </motion.div>

      {notification && (
        <motion.div variants={itemVariants} className="mb-4">
          <Notification
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(null)}
          />
        </motion.div>
      )}

      {/* Add Student Form */}
      {showAddForm && (
        <motion.div 
          variants={itemVariants} 
          initial="hidden"
          animate="visible"
          className="card p-6 mb-4"
        >
          <div className="flex items-center gap-2 mb-4">
            <Camera className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <h2 className="text-lg font-medium text-slate-900 dark:text-white">
              Nouvel Etudiant
            </h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  <User className="w-4 h-4 inline mr-1" />
                  Nom Complet *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder="Ex: Jean Dupont"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                  placeholder="Ex: jean.dupont@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  <GraduationCap className="w-4 h-4 inline mr-1" />
                  Classe
                </label>
                <input
                  type="text"
                  value={formData.class}
                  onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                  className="input-field"
                  placeholder="Ex: Terminale S"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Photos *
              </label>
              <FileUpload
                multiple={true}
                maxFiles={5}
                onChange={setPhotos}
                label="Cliquez ou glissez-deposez 1-5 photos du visage"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Enregistrer
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setFormData({ name: '', email: '', class: '' });
                  setPhotos([]);
                }}
                className="btn-secondary"
              >
                Annuler
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Filters */}
      <motion.div variants={itemVariants} className="card p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-9"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <select
              value={classFilter}
              onChange={(e) => {
                setClassFilter(e.target.value);
                loadStudentsByClass(e.target.value);
              }}
              className="input-field pl-9 appearance-none cursor-pointer"
            >
              <option value="">Toutes les classes</option>
              {uniqueClasses.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div variants={itemVariants}>
        {isLoading ? (
          <div className="card p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-600 border-t-transparent mx-auto"></div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">Chargement...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="card p-12 text-center">
            <User className="h-10 w-10 text-slate-400 mx-auto mb-3" />
            <p className="text-sm text-slate-500 dark:text-slate-400">Aucun etudiant trouve</p>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Nom
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Classe
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredStudents.map((student) => (
                    <tr key={student.student_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                          {student.student_id}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 bg-brand-50 dark:bg-brand-900/20 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-slate-900 dark:text-white">
                              {student.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                          <Mail className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                          {student.email}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="badge-info">
                          {student.class || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                          <Calendar className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                          {new Date(student.created_at).toLocaleDateString('fr-FR')}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
