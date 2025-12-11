import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

/**
 * Button Component - v2 Design System
 * Precision Craft: Vercel/Apple + Teenage Engineering
 */

const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    accent: 'btn-accent',
    danger: 'bg-error text-white hover:bg-error/90',
};

const sizes = {
    sm: 'btn-sm',
    md: '', // default
    lg: 'btn-lg',
};

const Button = forwardRef(
    (
        {
            children,
            variant = 'primary',
            size = 'md',
            loading = false,
            disabled = false,
            icon: Icon,
            iconPosition = 'left',
            className = '',
            as: Component = 'button',
            animate = true,
            ...props
        },
        ref
    ) => {
        const isDisabled = disabled || loading;

        const baseClasses = `
      btn
      ${variants[variant] || variants.primary}
      ${sizes[size] || ''}
      ${className}
    `.trim().replace(/\s+/g, ' ');

        const content = (
            <>
                {loading && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                )}
                {!loading && Icon && iconPosition === 'left' && (
                    <Icon className="w-4 h-4" />
                )}
                {children && <span>{children}</span>}
                {!loading && Icon && iconPosition === 'right' && (
                    <Icon className="w-4 h-4" />
                )}
            </>
        );

        // Use motion.button for animated version
        if (animate && Component === 'button') {
            return (
                <motion.button
                    ref={ref}
                    className={baseClasses}
                    disabled={isDisabled}
                    whileHover={!isDisabled ? { scale: 1.02 } : undefined}
                    whileTap={!isDisabled ? { scale: 0.98 } : undefined}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                    {...props}
                >
                    {content}
                </motion.button>
            );
        }

        // Non-animated or custom component
        return (
            <Component
                ref={ref}
                className={baseClasses}
                disabled={Component === 'button' ? isDisabled : undefined}
                {...props}
            >
                {content}
            </Component>
        );
    }
);

Button.displayName = 'Button';

export default Button;
