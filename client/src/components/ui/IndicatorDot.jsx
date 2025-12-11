import { motion } from 'framer-motion';

/**
 * IndicatorDot Component - v2 Design System
 * LED-style indicator dots (Teenage Engineering inspired)
 */

const IndicatorDot = ({
    status = 'off', // 'off' | 'on' | 'active' | 'warning' | 'error'
    size = 'md',
    pulse = false,
    label,
    className = '',
}) => {
    const sizes = {
        sm: 'w-1.5 h-1.5',
        md: 'w-2 h-2',
        lg: 'w-3 h-3',
    };

    const colors = {
        off: 'bg-foreground-tertiary',
        on: 'bg-success',
        active: 'bg-primary-500',
        warning: 'bg-warning',
        error: 'bg-error',
    };

    const glows = {
        off: '',
        on: 'shadow-[0_0_8px_var(--success)]',
        active: 'shadow-[0_0_8px_var(--primary-500)]',
        warning: 'shadow-[0_0_8px_var(--warning)]',
        error: 'shadow-[0_0_8px_var(--error)]',
    };

    const dotClasses = `
    ${sizes[size]}
    ${colors[status]}
    ${status !== 'off' ? glows[status] : ''}
    rounded-full
    transition-all duration-fast
    ${className}
  `.trim().replace(/\s+/g, ' ');

    const dot = pulse && status !== 'off' ? (
        <motion.span
            className={dotClasses}
            animate={{
                scale: [1, 1.2, 1],
                opacity: [1, 0.8, 1],
            }}
            transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
            }}
        />
    ) : (
        <span className={dotClasses} />
    );

    if (label) {
        return (
            <div className="inline-flex items-center gap-2">
                {dot}
                <span className="text-sm text-foreground-secondary font-mono">
                    {label}
                </span>
            </div>
        );
    }

    return dot;
};

export default IndicatorDot;
