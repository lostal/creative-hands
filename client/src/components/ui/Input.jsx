import { forwardRef } from 'react';

/**
 * Input Component - v2 Design System
 * Precision Craft: Vercel/Apple + Teenage Engineering
 */

const Input = forwardRef(
    (
        {
            label,
            error,
            hint,
            icon: Icon,
            iconPosition = 'left',
            className = '',
            containerClassName = '',
            ...props
        },
        ref
    ) => {
        const hasIcon = Boolean(Icon);
        const hasError = Boolean(error);

        const inputClasses = `
      input
      ${hasIcon && iconPosition === 'left' ? 'pl-11' : ''}
      ${hasIcon && iconPosition === 'right' ? 'pr-11' : ''}
      ${hasError ? 'input-error' : ''}
      ${className}
    `.trim().replace(/\s+/g, ' ');

        return (
            <div className={`space-y-2 ${containerClassName}`}>
                {label && (
                    <label className="block text-sm font-medium text-foreground">
                        {label}
                    </label>
                )}

                <div className="relative">
                    {Icon && iconPosition === 'left' && (
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            <Icon className="w-5 h-5 text-foreground-tertiary" />
                        </div>
                    )}

                    <input
                        ref={ref}
                        className={inputClasses}
                        {...props}
                    />

                    {Icon && iconPosition === 'right' && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            <Icon className="w-5 h-5 text-foreground-tertiary" />
                        </div>
                    )}
                </div>

                {(error || hint) && (
                    <p className={`text-sm ${hasError ? 'text-error' : 'text-foreground-tertiary'}`}>
                        {error || hint}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;
