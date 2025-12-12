/**
 * Componente Select reutilizable
 * Abstrae estilos comunes de selects
 */
interface SelectOption {
  value?: string | number;
  id?: string | number;
  label?: string;
  name?: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  placeholder?: string;
}

const Select: React.FC<SelectProps> = ({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = "-- Seleccionar --",
  required = false,
  error = "",
  className = "",
  ...props
}) => {
  const baseClasses =
    "w-full px-4 py-3 bg-white dark:bg-gray-800 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-hidden text-gray-900 dark:text-white transition-colors";

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
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className={`${baseClasses} ${borderClasses}`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option
            key={option.value || option.id}
            value={option.value || option.id}
          >
            {option.label || option.name}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-500 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

export default Select;
