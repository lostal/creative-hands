import { motion } from 'framer-motion';

/**
 * Badge Component - v2 Design System
 * Technical, mono-spaced badges
 */

const Badge = ({
    children,
    variant = 'default',
    size = 'md',
    dot = false,
    dotStatus = 'active',
    className = '',
}) => {
    const variants = {
        default: 'bg-surface-hover text-foreground-secondary',
        primary: 'bg-primary-100 text-primary-700 dark:bg-primary-500/15 dark:text-primary-400',
        success: 'bg-success-muted text-success',
        warning: 'bg-warning-muted text-warning',
        error: 'bg-error-muted text-error',
        accent: 'bg-accent-muted text-accent',
        outline: 'bg-transparent border border-border text-foreground-secondary',
    };

    const sizes = {
        sm: 'px-1.5 py-0.5 text-2xs',
        md: 'px-2 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm',
    };

    const dotColors = {
        active: 'bg-primary-500',
        on: 'bg-success',
        warning: 'bg-warning',
        error: 'bg-error',
        off: 'bg-foreground-tertiary',
    };

    const badgeClasses = `
    inline-flex items-center gap-1.5
    font-mono font-medium uppercase tracking-wide
    rounded-sm
    ${variants[variant]}
    ${sizes[size]}
    ${className}
  `.trim().replace(/\s+/g, ' ');

    return (
        <span className={badgeClasses}>
            {dot && (
                <span className={`w-1.5 h-1.5 rounded-full ${dotColors[dotStatus]}`} />
            )}
            {children}
        </span>
    );
};

export default Badge;
