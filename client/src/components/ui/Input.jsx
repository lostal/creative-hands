/**
 * Componente Input reutilizable
 * Abstrae estilos comunes de inputs de formulario
 */
const Input = ({
    label,
    name,
    type = "text",
    value,
    onChange,
    placeholder = "",
    required = false,
    error = "",
    className = "",
    ...props
}) => {
    const baseInputClasses =
        "w-full px-4 py-3 bg-white dark:bg-gray-800 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none text-gray-900 dark:text-white transition-colors";

    const borderClasses = error
        ? "border-red-500 dark:border-red-400"
        : "border-gray-300 dark:border-gray-700";

    return (
        <div className={className}>
            {label && (
                <label
                    htmlFor={name}
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <input
                id={name}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className={`${baseInputClasses} ${borderClasses}`}
                {...props}
            />
            {error && (
                <p className="mt-1 text-sm text-red-500 dark:text-red-400">{error}</p>
            )}
        </div>
    );
};

export default Input;
