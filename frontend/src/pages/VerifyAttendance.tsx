import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, ArrowLeft, Scan, Calendar, BookOpen, 
  GraduationCap, Loader2, Camera
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api, AttendanceResult } from '../services/api';
import FileUpload from '../components/FileUpload';
import Notification from '../components/Notification';
import AttendanceResults from '../components/AttendanceResults';

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

export default function VerifyAttendance() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    session_date: new Date().toISOString().split('T')[0],
    course_name: '',
    class: '',
  });
  const [groupPhoto, setGroupPhoto] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  const [results, setResults] = useState<AttendanceResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.session_date || !formData.course_name) {
      setNotification({
        type: 'error',
        message: 'Veuillez remplir la date et le nom du cours',
      });
      return;
    }

    if (groupPhoto.length === 0) {
      setNotification({
        type: 'error',
        message: 'Veuillez telecharger une photo de groupe',
      });
      return;
    }

    setIsLoading(true);
    setNotification(null);
    setResults(null);

    try {
      const data = new FormData();
      data.append('session_date', formData.session_date);
      data.append('course_name', formData.course_name);
      if (formData.class) {
        data.append('class', formData.class);
      }
      data.append('group_photo', groupPhoto[0]);

      console.log('Sending attendance verification request...');
      const response = await api.verifyAttendance(data);
      console.log('Received response:', response);

      if (response.success) {
        setResults(response);
        setNotification({
          type: 'success',
          message: `Presence verifiee: ${response.present}/${response.total_students} etudiants presents`,
        });
      } else {
        setNotification({
          type: 'error',
          message: response.message || 'Erreur lors de la verification',
        });
      }
    } catch (error) {
      console.error('Error verifying attendance:', error);
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Erreur de connexion au serveur',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-3xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white mb-4 transition-colors group text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5 group-hover:-translate-x-0.5 transition-transform" />
          Retour
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-lg bg-brand-50 dark:bg-brand-900/20">
            <Scan className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
              Verifier la Presence
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Telechargez une photo de groupe pour verification automatique
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 ml-12">
          Analyse par intelligence artificielle en temps reel
        </p>
      </motion.div>

      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4"
          >
            <Notification
              type={notification.type}
              message={notification.message}
              onClose={() => setNotification(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form */}
      <motion.div
        variants={itemVariants}
        className="card p-6 mb-6"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  Date de Session <span className="text-red-500">*</span>
                </div>
              </label>
              <input
                type="date"
                value={formData.session_date}
                onChange={(e) =>
                  setFormData({ ...formData, session_date: e.target.value })
                }
                className="input-field"
                required
              />
            </div>

            {/* Course Name Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  Nom du Cours <span className="text-red-500">*</span>
                </div>
              </label>
              <input
                type="text"
                value={formData.course_name}
                onChange={(e) =>
                  setFormData({ ...formData, course_name: e.target.value })
                }
                className="input-field"
                placeholder="Ex: Mathematiques Avancees"
                required
              />
            </div>
          </div>

          {/* Class Field */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              <div className="flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4" />
                Classe (optionnel)
              </div>
            </label>
            <input
              type="text"
              value={formData.class}
              onChange={(e) =>
                setFormData({ ...formData, class: e.target.value })
              }
              className="input-field"
              placeholder="Ex: Terminale S - Filtrer par classe specifique"
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              <div className="flex items-center gap-1.5">
                <Camera className="w-4 h-4" />
                Photo de Groupe <span className="text-red-500">*</span>
              </div>
            </label>
            <FileUpload
              multiple={false}
              onChange={setGroupPhoto}
              label="Cliquez ou glissez pour telecharger la photo de groupe"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Assurez-vous que tous les visages sont clairement visibles
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyse en cours...</span>
                </>
              ) : (
                <>
                  <Scan className="w-4 h-4" />
                  Verifier la Presence
                </>
              )}
            </button>
          </div>
        </form>

        {/* Loading State */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-6 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-brand-600 dark:text-brand-400 animate-spin" />
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Analyse en cours</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Detection et reconnaissance des visages</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Results */}
      <AnimatePresence>
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <AttendanceResults results={results} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
