/**
 * Navbar - Main navigation component
 * Refactored to use extracted sub-components for better maintainability
 */
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useTheme } from "../../context/ThemeContext";
import { useNavbarScroll } from "../../hooks/useNavbarScroll";
import { MotionNav, MotionButton } from "../../lib/motion";
import {
    Sun,
    Moon,
    ShoppingBag,
    Menu,
    X,
    LayoutDashboard,
} from "lucide-react";

// Extracted components
import UserDropdown from "./UserDropdown";
import MobileMenu from "./MobileMenu";

const Navbar = () => {
    const { user, logout, isAdmin } = useAuth();
    const { totalItems, openCart } = useCart();
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();
    const scrolled = useNavbarScroll();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const isActive = (path: string) => location.pathname === path;

    const handleLogout = () => {
        logout();
        setUserMenuOpen(false);
        setMobileMenuOpen(false);
    };

    const closeMobileMenu = () => setMobileMenuOpen(false);

    return (
        <MotionNav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={`fixed top-0 left-0 right-0 z-fixed transition-all duration-300 ${scrolled ? "glass-nav shadow-lg" : "bg-transparent"
                }`}
        >
            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16 sm:h-20">
                    {/* Logo */}
                    <Link
                        to="/"
                        onClick={(e) => {
                            e.preventDefault();
                            if (location.pathname === "/") {
                                window.scrollTo({ top: 0, behavior: "smooth" });
                            } else {
                                navigate("/");
                                setTimeout(
                                    () => window.scrollTo({ top: 0, behavior: "smooth" }),
                                    120,
                                );
                            }
                        }}
                        className="flex items-center space-x-2 group ml-3 lg:ml-0"
                    >
                        <span className="text-2xl lg:text-2xl font-bold copernicus copernicus-110 uppercase text-primary-500 transition-colors brand-title">
                            creative hands
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link
                            to="/products"
                            className={`text-sm font-medium transition-colors ${isActive("/products")
                                ? "text-primary-500"
                                : "text-gray-700 dark:text-gray-300 hover:text-primary-500"
                                }`}
                        >
                            Productos
                        </Link>

                        {isAdmin && (
                            <Link
                                to="/admin"
                                className={`text-sm font-medium transition-colors flex items-center space-x-1 ${isActive("/admin")
                                    ? "text-primary-500"
                                    : "text-gray-700 dark:text-gray-300 hover:text-primary-500"
                                    }`}
                            >
                                <LayoutDashboard className="w-4 h-4" />
                                <span>Admin</span>
                            </Link>
                        )}

                        {/* Cart - only for authenticated non-admin users */}
                        {user && !isAdmin && (
                            <button
                                onClick={openCart}
                                className="relative text-sm font-medium transition-colors text-gray-700 dark:text-gray-300 hover:text-primary-500 flex items-center space-x-1 focus-ring rounded-lg p-1"
                                aria-label="Abrir carrito"
                            >
                                <ShoppingBag className="w-5 h-5" />
                                {totalItems > 0 && (
                                    <span
                                        className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse"
                                        key={totalItems}
                                    >
                                        {totalItems}
                                    </span>
                                )}
                            </button>
                        )}

                        {/* Theme Toggle */}
                        <MotionButton
                            whileTap={{ scale: 0.95 }}
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            aria-label="Toggle theme"
                        >
                            {theme === "light" ? (
                                <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                            ) : (
                                <Sun className="w-5 h-5 text-gray-300" />
                            )}
                        </MotionButton>

                        {/* User Menu */}
                        {user ? (
                            <UserDropdown
                                user={user}
                                isAdmin={isAdmin}
                                isOpen={userMenuOpen}
                                onToggle={() => setUserMenuOpen(!userMenuOpen)}
                                onClose={() => setUserMenuOpen(false)}
                                onLogout={handleLogout}
                            />
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link
                                    to="/login"
                                    className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-500 transition-colors"
                                >
                                    Iniciar sesión
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-4 py-2 bg-linear-to-r from-primary-500 to-primary-600 text-white text-sm font-medium rounded-full hover:shadow-lg transition-all"
                                >
                                    Registrarse
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-3.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors min-w-[52px] min-h-[52px] flex items-center justify-center"
                        aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
                    >
                        {mobileMenuOpen ? (
                            <X className="w-8 h-8 text-gray-700 dark:text-gray-300" />
                        ) : (
                            <Menu className="w-8 h-8 text-gray-700 dark:text-gray-300" />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <MobileMenu
                isOpen={mobileMenuOpen}
                user={user}
                isAdmin={isAdmin}
                theme={theme}
                totalItems={totalItems}
                onClose={closeMobileMenu}
                onLogout={handleLogout}
                onToggleTheme={toggleTheme}
                onOpenCart={openCart}
            />
        </MotionNav>
    );
};

export default Navbar;
