import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, Eye, EyeOff, Shield, GraduationCap } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login, loginAsAdmin } = useAuth();
  const [loginType, setLoginType] = useState<'professor' | 'admin'>('professor');
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleProfessorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await api.loginProfessor(formData.email, formData.password);
      
      if (response.success && response.professor) {
        login(response.professor);
        navigate('/professor');
      } else {
        setError(response.message || 'Invalid credentials');
      }
    } catch {
      setError('Connection error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple admin access (in production, add proper authentication)
    if (formData.password === 'admin123') {
      loginAsAdmin();
      navigate('/admin');
    } else {
      setError('Invalid admin password');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-600 mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            AttendifyAI
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Sign in to continue
          </p>
        </div>

        {/* Login Type Toggle */}
        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg mb-6">
          <button
            type="button"
            onClick={() => setLoginType('professor')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${
              loginType === 'professor'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            Professor
          </button>
          <button
            type="button"
            onClick={() => setLoginType('admin')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${
              loginType === 'admin'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Shield className="w-4 h-4" />
            Admin
          </button>
        </div>

        {/* Login Form */}
        <div className="card p-6">
          <form onSubmit={loginType === 'professor' ? handleProfessorLogin : handleAdminLogin}>
            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            {loginType === 'professor' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Email
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
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-field pl-10 pr-10"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In as {loginType === 'professor' ? 'Professor' : 'Admin'}
                </>
              )}
            </button>
          </form>

          {loginType === 'admin' && (
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-4">
              Demo password: admin123
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
