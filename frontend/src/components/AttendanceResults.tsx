import { CheckCircle, XCircle, TrendingUp, Users, UserCheck, UserX } from 'lucide-react';
import { AttendanceResult } from '../services/api';

interface AttendanceResultsProps {
  results: AttendanceResult;
}

export default function AttendanceResults({ results }: AttendanceResultsProps) {
  if (!results || !results.present_students || !results.absent_students) {
    return (
      <div className="card p-5">
        <p className="text-slate-500 dark:text-slate-400">Aucun résultat disponible</p>
      </div>
    );
  }

  const attendanceRate = results.total_students > 0 
    ? Math.round((results.present / results.total_students) * 100) 
    : 0;

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Resultats</h2>
          <div className="flex items-center gap-1.5 bg-brand-50 dark:bg-brand-900/20 px-3 py-1.5 rounded-lg">
            <TrendingUp className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            <span className="text-sm font-semibold text-brand-700 dark:text-brand-300">
              {attendanceRate}%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              <p className="text-xs text-slate-500 dark:text-slate-400">Total</p>
            </div>
            <p className="text-xl font-semibold text-slate-900 dark:text-white">
              {results.total_students}
            </p>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-2 mb-1">
              <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <p className="text-xs text-emerald-700 dark:text-emerald-400">Presents</p>
            </div>
            <p className="text-xl font-semibold text-emerald-600 dark:text-emerald-400">
              {results.present}
            </p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2 mb-1">
              <UserX className="h-4 w-4 text-red-600 dark:text-red-400" />
              <p className="text-xs text-red-700 dark:text-red-400">Absents</p>
            </div>
            <p className="text-xl font-semibold text-red-600 dark:text-red-400">
              {results.absent}
            </p>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Present Students */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-medium text-slate-900 dark:text-white">
              Presents ({results.present})
            </h3>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {results.present_students.map((student) => (
              <div
                key={student.student_id}
                className="flex items-center justify-between p-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-100 dark:border-emerald-800"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{student.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    ID: {student.student_id}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                    {Math.round(student.confidence * 100)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Absent Students */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <h3 className="text-sm font-medium text-slate-900 dark:text-white">
              Absents ({results.absent})
            </h3>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {results.absent_students.map((student) => (
              <div
                key={student.student_id}
                className="flex items-center justify-between p-2.5 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{student.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    ID: {student.student_id}
                  </p>
                </div>
                <span className="badge-error">
                  Absent
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
