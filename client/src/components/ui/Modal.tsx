import { AnimatePresence } from "framer-motion";
import { MotionDiv } from "../../lib/motion";
import { X } from "lucide-react";

/**
 * Componente Modal reutilizable
 * Base para todos los modales de la aplicación
 */
interface ModalProps {
  show: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
}

const Modal = ({
  show,
  onClose,
  title,
  children,
  size = "md",
  className = "",
}: ModalProps) => {
  const sizes = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
    full: "max-w-full mx-4",
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <MotionDiv
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <MotionDiv
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
          className={`glass rounded-3xl p-6 sm:p-8 w-full max-h-[90vh] overflow-y-auto ${sizes[size]} ${className}`}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Content */}
          {children}
        </MotionDiv>
      </MotionDiv>
    </AnimatePresence>
  );
};

export default Modal;

