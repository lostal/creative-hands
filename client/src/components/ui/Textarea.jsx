import { forwardRef } from 'react';

/**
 * Textarea Component - v2 Design System
 * Precision Craft: Vercel/Apple + Teenage Engineering
 */

const Textarea = forwardRef(
    (
        {
            label,
            error,
            hint,
            rows = 4,
            resize = 'vertical',
            className = '',
            containerClassName = '',
            ...props
        },
        ref
    ) => {
        const hasError = Boolean(error);

        const resizeClasses = {
            none: 'resize-none',
            vertical: 'resize-y',
            horizontal: 'resize-x',
            both: 'resize',
        };

        const textareaClasses = `
      input
      ${resizeClasses[resize] || resizeClasses.vertical}
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

                <textarea
                    ref={ref}
                    rows={rows}
                    className={textareaClasses}
                    {...props}
                />

                {(error || hint) && (
                    <p className={`text-sm ${hasError ? 'text-error' : 'text-foreground-tertiary'}`}>
                        {error || hint}
                    </p>
                )}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';

export default Textarea;
