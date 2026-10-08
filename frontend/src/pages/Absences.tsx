import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Calendar, Users, UserCheck, UserX, CalendarCheck, X } from 'lucide-react';
import { api, Student } from '../services/api';
import Notification from '../components/Notification';

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

interface Session {
  session_id: number;
  session_date: string;
  course_name: string;
  class: string;
}

interface AttendanceRecord {
  student_id: number;
  student_name: string;
  email: string;
  status: 'present' | 'absent';
}

interface SessionDetail {
  session: Session;
  total: number;
  present_count: number;
  absent_count: number;
  present_students: AttendanceRecord[];
  absent_students: AttendanceRecord[];
}

export default function Absences() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<number | null>(null);
  const [sessionDetail, setSessionDetail] = useState<SessionDetail | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [classFilter, setClassFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load students for class filter
      const studentsResponse = await api.getAllStudents();
      if (studentsResponse.success) {
        setAllStudents(studentsResponse.students);
      }

      // Load all sessions
      const sessionsResponse = await fetch(`${import.meta.env.VITE_API_BACKEND_URL || 'http://localhost:5000'}/api/attendance/sessions`);
      if (sessionsResponse.ok) {
        const data = await sessionsResponse.json();
        setSessions(data.sessions || []);
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Erreur lors du chargement des données',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadSessionDetail = async (sessionId: number) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BACKEND_URL || 'http://localhost:5000'}/api/attendance/session/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        // Transform the response to match our interface
        setSessionDetail({
          session: {
            session_id: data.session.session_id,
            session_date: data.session.date,
            course_name: data.session.course,
            class: data.session.class,
          },
          total: data.total,
          present_count: data.present_count,
          absent_count: data.absent_count,
          present_students: data.present_students.map((s: any) => ({
            student_id: s.student_id,
            student_name: s.name,
            email: s.email,
            status: 'present' as const,
          })),
          absent_students: data.absent_students.map((s: any) => ({
            student_id: s.student_id,
            student_name: s.name,
            email: s.email,
            status: 'absent' as const,
          })),
        });
        setSelectedSession(sessionId);
        setShowModal(true);
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Erreur lors du chargement des détails',
      });
    }
  };

  const uniqueClasses = Array.from(new Set(allStudents.map((s) => s.class).filter(Boolean)));

  const filteredSessions = sessions.filter((session) => {
    if (classFilter && session.class !== classFilter) return false;
    if (searchTerm) {
      return (
        session.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.class.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return true;
  });

  const filteredAbsentStudents = sessionDetail?.absent_students.filter((student) => {
    if (searchTerm) {
      return (
        student.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return true;
  }) || [];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-lg bg-brand-50 dark:bg-brand-900/20">
            <CalendarCheck className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
              Absences
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Consultez l'historique des absences par session
            </p>
          </div>
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

      {/* Filters */}
      <motion.div variants={itemVariants} className="card p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par cours ou étudiant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-9"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
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

      {/* Sessions Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full card p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-600 border-t-transparent mx-auto"></div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">Chargement...</p>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="col-span-full card p-12 text-center">
            <Calendar className="h-10 w-10 text-slate-400 mx-auto mb-3" />
            <p className="text-sm text-slate-500 dark:text-slate-400">Aucune session trouvée</p>
          </div>
        ) : (
          filteredSessions.map((session) => (
            <button
              key={session.session_id}
              onClick={() => loadSessionDetail(session.session_id)}
              className="card p-4 text-left hover:shadow-md transition-shadow group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition">
                    {session.course_name}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    {session.class}
                  </p>
                </div>
                <Calendar className="w-4 h-4 text-slate-400" />
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>{new Date(session.session_date).toLocaleDateString('fr-FR')}</span>
              </div>
            </button>
          ))
        )}
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && sessionDetail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                    {sessionDetail.session.course_name}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {sessionDetail.session.class} • {new Date(sessionDetail.session.session_date).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-700 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-180px)]">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <Users className="w-5 h-5 text-slate-500 dark:text-slate-400 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {sessionDetail.total}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Total</p>
                  </div>
                  <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                    <UserCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {sessionDetail.present_count}
                    </p>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400">Présents</p>
                  </div>
                  <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <UserX className="w-5 h-5 text-red-600 dark:text-red-400 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {sessionDetail.absent_count}
                    </p>
                    <p className="text-xs text-red-700 dark:text-red-400">Absents</p>
                  </div>
                </div>

                {/* Absent Students List */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <UserX className="w-4 h-4 text-red-600 dark:text-red-400" />
                    Étudiants Absents ({filteredAbsentStudents.length})
                  </h3>
                  
                  {filteredAbsentStudents.length === 0 ? (
                    <div className="text-center py-8">
                      <UserCheck className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Tous les étudiants sont présents!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredAbsentStudents.map((student, index) => (
                        <motion.div
                          key={student.student_id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                                {student.student_name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white">
                                {student.student_name}
                              </p>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                {student.email}
                              </p>
                            </div>
                          </div>
                          <span className="badge-error">Absent</span>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setShowModal(false)}
                  className="btn-secondary w-full"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
