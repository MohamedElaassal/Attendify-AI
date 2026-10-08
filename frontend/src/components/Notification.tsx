import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

type NotificationType = 'success' | 'error' | 'info';

interface NotificationProps {
  type: NotificationType;
  message: string;
  onClose?: () => void;
}

export default function Notification({ type, message, onClose }: NotificationProps) {
  const config = {
    success: {
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      border: 'border-emerald-200 dark:border-emerald-800',
      text: 'text-emerald-800 dark:text-emerald-300',
      icon: CheckCircle,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-800 dark:text-red-300',
      icon: XCircle,
      iconColor: 'text-red-600 dark:text-red-400',
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-800 dark:text-blue-300',
      icon: AlertCircle,
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
  };

  const { bg, border, text, icon: Icon, iconColor } = config[type];

  return (
    <div className={`${bg} ${border} border rounded-lg p-3 flex items-start`}>
      <Icon className={`h-4 w-4 ${iconColor} mr-2.5 mt-0.5 flex-shrink-0`} />
      <p className={`${text} text-sm flex-1`}>{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className={`${text} hover:opacity-70 ml-2 p-0.5`}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
