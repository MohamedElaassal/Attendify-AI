import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, CheckCircle, UserPlus, Calendar, ArrowRight, TrendingUp, Activity } from 'lucide-react';
import { api } from '../services/api';

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

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    isLoading: true,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await api.getAllStudents();
      if (response.success) {
        setStats({
          totalStudents: response.students.length,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      setStats((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const cards = [
    {
      title: 'Total Etudiants',
      value: stats.totalStudents,
      icon: Users,
      description: 'Etudiants enregistres',
    },
    {
      title: 'Sessions',
      value: 12,
      icon: Calendar,
      description: 'Ce mois-ci',
    },
    {
      title: 'Taux de Presence',
      value: 94,
      suffix: '%',
      icon: TrendingUp,
      description: 'Moyenne generale',
    },
    {
      title: 'Detections',
      value: 1247,
      icon: Activity,
      description: 'Visages analyses',
    },
  ];

  const actions = [
    {
      title: 'Enregistrer',
      description: 'Ajouter un nouvel etudiant avec reconnaissance faciale',
      icon: UserPlus,
      link: '/register',
    },
    {
      title: 'Verifier Presence',
      description: 'Scanner une photo de groupe pour verification automatique',
      icon: CheckCircle,
      link: '/verify',
    },
    {
      title: 'Voir Etudiants',
      description: 'Consulter et gerer tous les etudiants enregistres',
      icon: Users,
      link: '/students',
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Vue d'ensemble du systeme de gestion de presence
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="card card-hover p-5"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-brand-50 dark:bg-brand-900/20">
                    <Icon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-semibold text-slate-900 dark:text-white">
                    {stats.isLoading ? (
                      <span className="inline-block w-12 h-7 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                    ) : (
                      <>
                        {card.value}{card.suffix}
                      </>
                    )}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {card.title}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
          Actions rapides
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.div key={index} variants={itemVariants}>
                <Link
                  to={action.link}
                  className="block card card-hover p-5 group"
                >
                  <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-700 w-fit">
                    <Icon className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                  </div>
                  
                  <h3 className="text-base font-medium text-slate-900 dark:text-white mt-4">
                    {action.title}
                  </h3>
                  
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {action.description}
                  </p>
                  
                  <div className="flex items-center text-brand-600 dark:text-brand-400 text-sm font-medium mt-4 group-hover:text-brand-700 dark:group-hover:text-brand-300">
                    <span>Commencer</span>
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* System Status */}
      <motion.div variants={itemVariants} className="card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="status-dot status-online" />
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                Systeme operationnel
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tous les services fonctionnent normalement
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 text-xs text-slate-500 dark:text-slate-400">
            <span>API: <span className="text-emerald-600 dark:text-emerald-400">En ligne</span></span>
            <span>IA: <span className="text-emerald-600 dark:text-emerald-400">Active</span></span>
            <span>Base de donnees: <span className="text-emerald-600 dark:text-emerald-400">Connectee</span></span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}