import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, CheckCircle, Calendar, Upload, Camera } from 'lucide-react';
import { api, AttendanceResult } from '../services/api';
import { useAuth } from '../context/AuthContext';
import FileUpload from '../components/FileUpload';
import AttendanceResults from '../components/AttendanceResults';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export default function ProfessorDashboard() {
  const { user } = useAuth();
  const [photo, setPhoto] = useState<File[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [courseName, setCourseName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AttendanceResult | null>(null);
  const [classes, setClasses] = useState<string[]>([]);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const response = await api.getAllStudents();
      if (response.success) {
        const uniqueClasses = [...new Set(response.students.map(s => s.class).filter(Boolean))];
        setClasses(uniqueClasses);
      }
    } catch (error) {
      console.error('Error loading classes:', error);
    }
  };

  const handleVerify = async () => {
    if (!photo.length || !selectedClass || !courseName) return;

    setIsLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      // Use the correct field names expected by the backend
      formData.append('session_date', new Date().toISOString().split('T')[0]); // Today's date in YYYY-MM-DD format
      formData.append('course_name', courseName); // Course name is required
      formData.append('class', selectedClass);
      formData.append('group_photo', photo[0]);

      const response = await api.verifyAttendance(formData);
      setResult(response);
    } catch (error) {
      console.error('Verification error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setPhoto([]);
    setResult(null);
    setCourseName('');
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Welcome, {user?.professor_name}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          {user?.department && `${user.department} - `}{user?.subject || 'Attendance Verification'}
        </p>
      </motion.div>

      {/* Quick Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-brand-50 dark:bg-brand-900/20">
              <Calendar className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Today</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">
                {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' })}
              </p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
              <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Sessions Today</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">0</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-50 dark:bg-violet-900/20">
              <Users className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Classes</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">{classes.length}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Attendance Verification Section */}
      {!result ? (
        <motion.div variants={itemVariants} className="card p-6">
          <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Verify Attendance
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Select Class *
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="input-field"
                required
              >
                <option value="">Choose a class</option>
                {classes.map((cls) => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Course Name *
              </label>
              <input
                type="text"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className="input-field"
                placeholder="e.g., Mathematics"
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Upload Group Photo *
            </label>
            <FileUpload
              multiple={false}
              maxFiles={1}
              onChange={setPhoto}
              label="Click or drag to upload the classroom photo"
            />
          </div>

          <button
            onClick={handleVerify}
            disabled={isLoading || !photo.length || !selectedClass || !courseName}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Verify Attendance
              </>
            )}
          </button>
        </motion.div>
      ) : (
        <motion.div variants={itemVariants}>
          <AttendanceResults results={result} />
          <button onClick={resetForm} className="btn-secondary mt-4 w-full">
            New Verification
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
