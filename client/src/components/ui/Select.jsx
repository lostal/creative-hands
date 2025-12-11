import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Select Component - v2 Design System
 * Precision Craft: Vercel/Apple + Teenage Engineering
 */

const Select = forwardRef(
    (
        {
            label,
            error,
            hint,
            options = [],
            placeholder = 'Seleccionar...',
            className = '',
            containerClassName = '',
            ...props
        },
        ref
    ) => {
        const hasError = Boolean(error);

        const selectClasses = `
      input
      pr-10
      cursor-pointer
      appearance-none
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
                    <select
                        ref={ref}
                        className={selectClasses}
                        {...props}
                    >
                        {placeholder && (
                            <option value="" disabled>
                                {placeholder}
                            </option>
                        )}
                        {options.map((option) => (
                            <option
                                key={option.value}
                                value={option.value}
                                disabled={option.disabled}
                            >
                                {option.label}
                            </option>
                        ))}
                    </select>

                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <ChevronDown className="w-5 h-5 text-foreground-tertiary" />
                    </div>
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

Select.displayName = 'Select';

export default Select;
