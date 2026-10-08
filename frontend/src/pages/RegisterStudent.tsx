import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserPlus, ArrowLeft, Camera, 
  CheckCircle2, AlertCircle, Loader2, User, Mail, GraduationCap
} from 'lucide-react';
import { api } from '../services/api';
import FileUpload from '../components/FileUpload';
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

export default function RegisterStudent() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    class: '',
  });
  const [photos, setPhotos] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

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

    setIsLoading(true);
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
        setTimeout(() => {
          navigate('/students');
        }, 2000);
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
      setIsLoading(false);
    }
  };

  const inputFields = [
    {
      id: 'name',
      label: 'Nom Complet',
      type: 'text',
      icon: User,
      placeholder: 'Ex: Jean Dupont',
      required: true,
    },
    {
      id: 'email',
      label: 'Email',
      type: 'email',
      icon: Mail,
      placeholder: 'Ex: jean.dupont@email.com',
      required: true,
    },
    {
      id: 'class',
      label: 'Classe',
      type: 'text',
      icon: GraduationCap,
      placeholder: 'Ex: Terminale S',
      required: false,
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-2xl mx-auto"
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
            <UserPlus className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
              Enregistrer un etudiant
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Ajoutez un nouvel etudiant avec reconnaissance faciale
            </p>
          </div>
        </div>

        {/* Info text */}
        <p className="text-xs text-slate-500 dark:text-slate-400 ml-12">
          1 a 5 photos recommandees pour une meilleure precision
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
      <motion.form
        variants={itemVariants}
        onSubmit={handleSubmit}
        className="card p-6 space-y-6"
      >
        {/* Form Fields */}
        <div className="space-y-4">
          {inputFields.map((field, index) => {
            const Icon = field.icon;
            return (
              <motion.div
                key={field.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                <div className="relative">
                  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={field.type}
                    value={formData[field.id as keyof typeof formData]}
                    onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                    className="input-field pl-10"
                    placeholder={field.placeholder}
                    required={field.required}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Photo Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            <div className="flex items-center gap-1.5">
              <Camera className="w-4 h-4" />
              Photos de l'etudiant <span className="text-red-500">*</span>
            </div>
          </label>
          <FileUpload
            multiple
            maxFiles={5}
            onChange={setPhotos}
            label="Cliquez ou glissez pour telecharger 1 a 5 photos"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            Utilisez des photos claires avec differents angles
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex gap-3 pt-2"
        >
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Enregistrer
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn-secondary"
          >
            Annuler
          </button>
        </motion.div>
      </motion.form>
    </motion.div>
  );
}
