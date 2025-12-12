import { Link, useLocation } from "react-router";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
}

/**
 * Componente Breadcrumbs para navegación jerárquica
 */
const Breadcrumbs = ({
  items,
  className = "",
  showHome = true,
}: BreadcrumbsProps) => {
  const location = useLocation();

  // Si no hay items o solo uno sin href, no mostrar
  if (items.length === 0) return null;

  const allItems = showHome
    ? [{ label: "Inicio", href: "/" }, ...items]
    : items;

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center gap-1 text-sm ${className}`}
    >
      <ol className="flex items-center gap-1 flex-wrap">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;
          const isActive = item.href === location.pathname;

          return (
            <li key={index} className="flex items-center gap-1">
              {index > 0 && (
                <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              )}

              {item.href && !isLast ? (
                <Link
                  to={item.href}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors
                    ${
                      isActive
                        ? "text-primary-600 dark:text-primary-400 font-medium"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                >
                  {index === 0 && showHome && <Home className="w-4 h-4" />}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span className="px-2 py-1 text-gray-900 dark:text-white font-medium truncate max-w-[200px]">
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
