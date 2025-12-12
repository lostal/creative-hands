import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { AnimatePresence } from "framer-motion";
import { MotionDiv } from "../lib/motion";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (type: ToastType, message: string, duration?: number) => void;
  removeToast: (id: string) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

const toastIcons: Record<ToastType, typeof CheckCircle> = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const toastStyles: Record<ToastType, string> = {
  success:
    "bg-green-50 dark:bg-green-900/30 border-green-400 dark:border-green-600 text-green-800 dark:text-green-200",
  error:
    "bg-red-50 dark:bg-red-900/30 border-red-400 dark:border-red-600 text-red-800 dark:text-red-200",
  warning:
    "bg-yellow-50 dark:bg-yellow-900/30 border-yellow-400 dark:border-yellow-600 text-yellow-800 dark:text-yellow-200",
  info: "bg-blue-50 dark:bg-blue-900/30 border-blue-400 dark:border-blue-600 text-blue-800 dark:text-blue-200",
};

const iconStyles: Record<ToastType, string> = {
  success: "text-green-500",
  error: "text-red-500",
  warning: "text-yellow-500",
  info: "text-blue-500",
};

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const ToastItem = ({ toast, onRemove }: ToastItemProps) => {
  const Icon = toastIcons[toast.type];

  return (
    <MotionDiv
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-sm ${toastStyles[toast.type]}`}
    >
      <Icon className={`w-5 h-5 shrink-0 ${iconStyles[toast.type]}`} />
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        aria-label="Cerrar notificación"
      >
        <X className="w-4 h-4" />
      </button>
    </MotionDiv>
  );
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, message: string, duration = 4000) => {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newToast: Toast = { id, type, message, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast],
  );

  const success = useCallback(
    (message: string, duration?: number) => {
      addToast("success", message, duration);
    },
    [addToast],
  );

  const error = useCallback(
    (message: string, duration?: number) => {
      addToast("error", message, duration);
    },
    [addToast],
  );

  const warning = useCallback(
    (message: string, duration?: number) => {
      addToast("warning", message, duration);
    },
    [addToast],
  );

  const info = useCallback(
    (message: string, duration?: number) => {
      addToast("info", message, duration);
    },
    [addToast],
  );

  return (
    <ToastContext.Provider
      value={{ toasts, addToast, removeToast, success, error, warning, info }}
    >
      {children}

      {/* Toast Container - Fixed position */}
      <div className="fixed bottom-6 right-6 z-toast flex flex-col gap-2 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <div key={toast.id} className="pointer-events-auto">
              <ToastItem toast={toast} onRemove={removeToast} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;
