import { motion } from "framer-motion";
import React from "react";

type ButtonProps = React.ComponentProps<typeof motion.button> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ElementType;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  children?: React.ReactNode;
};

const Button = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  loading = false,
  icon: Icon,
  onClick,
  type = "button",
  ...props
}: ButtonProps) => {
  const baseClasses =
    "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg hover:shadow-xl",
    secondary: "glass text-gray-700 dark:text-gray-300 hover:shadow-md",
    danger: "bg-red-500 text-white shadow-lg hover:shadow-xl hover:bg-red-600",
    ghost:
      "bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
  };

  const sizes = {
    sm: "px-3 py-2 text-sm min-h-[36px] space-x-1.5",
    md: "px-4 sm:px-6 py-3 text-base min-h-[48px] space-x-2",
    lg: "px-6 sm:px-8 py-4 text-lg min-h-[56px] space-x-3",
  };

  // Cast motion.button to any to avoid strict type checking on props like className
  const MotionButton = motion.button as any;

  return (
    <MotionButton
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      style={{ willChange: "transform" }}
      {...props}
    >
      {loading ? (
        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : (
        <>
          {Icon && <Icon className="w-5 h-5" />}
          {children && <span>{children}</span>}
        </>
      )}
    </MotionButton>
  );
};

export default Button;
