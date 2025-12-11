import { motion } from 'framer-motion';

/**
 * Card Component - v2 Design System
 * Clean, minimal cards with subtle interactions
 */

const Card = ({
    children,
    variant = 'default',
    interactive = false,
    padding = 'md',
    className = '',
    onClick,
    ...props
}) => {
    const variants = {
        default: 'bg-surface border-border-subtle',
        elevated: 'bg-background-elevated border-border-subtle shadow-md',
        ghost: 'bg-transparent border-transparent',
        outline: 'bg-transparent border-border',
    };

    const paddings = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
    };

    const baseClasses = `
    border rounded-lg overflow-hidden
    transition-all duration-fast
    ${variants[variant]}
    ${paddings[padding]}
    ${interactive ? 'cursor-pointer' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

    if (interactive) {
        return (
            <motion.div
                className={baseClasses}
                onClick={onClick}
                whileHover={{
                    y: -4,
                    borderColor: 'var(--border-default)',
                    boxShadow: 'var(--shadow-lg)',
                }}
                whileTap={{ y: -2 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                {...props}
            >
                {children}
            </motion.div>
        );
    }

    return (
        <div className={baseClasses} onClick={onClick} {...props}>
            {children}
        </div>
    );
};

// Subcomponents
Card.Header = ({ children, className = '' }) => (
    <div className={`border-b border-border-subtle px-6 py-4 ${className}`}>
        {children}
    </div>
);

Card.Body = ({ children, className = '' }) => (
    <div className={`p-6 ${className}`}>
        {children}
    </div>
);

Card.Footer = ({ children, className = '' }) => (
    <div className={`border-t border-border-subtle px-6 py-4 bg-surface-hover ${className}`}>
        {children}
    </div>
);

export default Card;
