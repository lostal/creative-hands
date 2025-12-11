import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

/**
 * Modal Component - v2 Design System
 * Precision Craft: Vercel/Apple + Teenage Engineering
 */

const Modal = ({
    isOpen,
    onClose,
    title,
    description,
    children,
    size = 'md',
    showCloseButton = true,
    closeOnBackdrop = true,
    closeOnEscape = true,
    className = '',
}) => {
    // Handle escape key
    const handleEscape = useCallback(
        (e) => {
            if (e.key === 'Escape' && closeOnEscape) {
                onClose();
            }
        },
        [onClose, closeOnEscape]
    );

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, handleEscape]);

    const sizes = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]',
    };

    const backdropVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
    };

    const modalVariants = {
        hidden: {
            opacity: 0,
            scale: 0.95,
            y: 10,
        },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                type: 'spring',
                damping: 25,
                stiffness: 300,
            },
        },
        exit: {
            opacity: 0,
            scale: 0.95,
            y: 10,
            transition: {
                duration: 0.15,
            },
        },
    };

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        className="absolute inset-0 bg-neutral-950/60 backdrop-blur-sm"
                        variants={backdropVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        onClick={closeOnBackdrop ? onClose : undefined}
                    />

                    {/* Modal */}
                    <motion.div
                        className={`
              relative w-full ${sizes[size]} 
              bg-surface border border-border-subtle rounded-xl
              shadow-xl overflow-hidden
              ${className}
            `}
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        {(title || showCloseButton) && (
                            <div className="flex items-start justify-between p-6 border-b border-border-subtle">
                                <div className="flex-1 pr-4">
                                    {title && (
                                        <h2 className="text-xl font-semibold text-foreground">
                                            {title}
                                        </h2>
                                    )}
                                    {description && (
                                        <p className="mt-1 text-sm text-foreground-secondary">
                                            {description}
                                        </p>
                                    )}
                                </div>

                                {showCloseButton && (
                                    <motion.button
                                        onClick={onClose}
                                        className="flex items-center justify-center w-10 h-10 rounded-lg
                               text-foreground-tertiary hover:text-foreground
                               hover:bg-surface-hover transition-colors"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        aria-label="Cerrar modal"
                                    >
                                        <X className="w-5 h-5" />
                                    </motion.button>
                                )}
                            </div>
                        )}

                        {/* Content */}
                        <div className="p-6 overflow-y-auto max-h-[calc(100vh-12rem)]">
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    // Portal to body
    return createPortal(modalContent, document.body);
};

export default Modal;
