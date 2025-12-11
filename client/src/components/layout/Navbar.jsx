/**
 * Navbar - Main navigation with analog precision aesthetic
 * 
 * Features:
 * - Logo in Copernicus font
 * - Navigation links with LED-style hover indicators
 * - Cart icon with item count badge
 * - User menu (login/profile)
 * - Theme toggle with LED indicator
 * - Sticky with backdrop blur on scroll
 * - Mobile hamburger menu
 */

import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { totalItems, openCart } = useCart();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    // Handle scroll for sticky effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
        setIsUserMenuOpen(false);
    }, [navigate]);

    const handleLogout = () => {
        logout();
        setIsUserMenuOpen(false);
        navigate('/');
    };

    const navLinks = [
        { to: '/products', label: 'Productos' },
        { to: '/about', label: 'Nosotros' },
    ];

    return (
        <header
            className={`
        sticky top-0 z-[100]
        transition-all duration-normal
        ${isScrolled
                    ? 'bg-surface-overlay backdrop-blur-nav border-b border-border shadow-sm'
                    : 'bg-transparent'
                }
      `}
        >
            <nav className="container">
                <div className="flex items-center justify-between h-16 md:h-20">

                    {/* Logo */}
                    <Link
                        to="/"
                        className="font-brand text-xl md:text-2xl tracking-wide text-foreground hover:text-primary transition-colors"
                    >
                        CREATIVE HANDS
                    </Link>

                    {/* Desktop Navigation - Centered */}
                    <div className="hidden md:flex items-center justify-center absolute left-1/2 -translate-x-1/2 gap-8">
                        {navLinks.map(({ to, label }) => (
                            <NavLink
                                key={to}
                                to={to}
                                className={({ isActive }) => `
                                    relative py-2 text-sm font-medium
                                    transition-colors duration-fast
                                    ${isActive ? 'text-foreground' : 'text-foreground-secondary hover:text-foreground'}
                                `}
                            >
                                {({ isActive }) => (
                                    <>
                                        {label}
                                        {/* LED indicator */}
                                        <span
                                            className={`
                                                absolute -bottom-0.5 left-1/2 -translate-x-1/2
                                                w-1 h-1 rounded-full
                                                transition-all duration-fast
                                                ${isActive ? 'bg-primary opacity-100' : 'bg-transparent opacity-0'}
                                            `}
                                        />
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </div>

                    {/* Right side actions */}
                    <div className="flex items-center gap-2 md:gap-4">

                        {/* Theme toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-md text-foreground-secondary hover:text-foreground hover:bg-surface-hover transition-all"
                            aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                        >
                            <div className="relative w-5 h-5">
                                {/* Sun icon */}
                                <svg
                                    className={`absolute inset-0 w-5 h-5 transition-all duration-normal ${theme === 'dark' ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
                                        }`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={1.5}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                                </svg>
                                {/* Moon icon */}
                                <svg
                                    className={`absolute inset-0 w-5 h-5 transition-all duration-normal ${theme === 'dark' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
                                        }`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={1.5}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                                </svg>
                            </div>
                        </button>

                        {/* Cart button */}
                        <button
                            onClick={openCart}
                            className="relative p-2 rounded-md text-foreground-secondary hover:text-foreground hover:bg-surface-hover transition-all"
                            aria-label={`Carrito (${totalItems} artículos)`}
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                            </svg>

                            {/* Cart count badge */}
                            {totalItems > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-mono font-medium bg-primary text-white rounded-full">
                                    {totalItems > 99 ? '99+' : totalItems}
                                </span>
                            )}
                        </button>

                        {/* User menu */}
                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className="flex items-center gap-2 p-2 rounded-md text-foreground-secondary hover:text-foreground hover:bg-surface-hover transition-all"
                                >
                                    <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                                        <span className="text-xs font-medium text-primary">
                                            {user.name?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <span className="hidden md:block text-sm font-medium">{user.name}</span>
                                </button>

                                {/* Dropdown menu */}
                                <AnimatePresence>
                                    {isUserMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 8, scale: 0.96 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute right-0 mt-2 w-48 py-1 bg-surface border border-border rounded-lg shadow-lg"
                                        >
                                            <Link
                                                to="/profile"
                                                onClick={() => setIsUserMenuOpen(false)}
                                                className="block px-4 py-2 text-sm text-foreground-secondary hover:text-foreground hover:bg-surface-hover transition-colors"
                                            >
                                                Mi Perfil
                                            </Link>
                                            <Link
                                                to="/orders"
                                                onClick={() => setIsUserMenuOpen(false)}
                                                className="block px-4 py-2 text-sm text-foreground-secondary hover:text-foreground hover:bg-surface-hover transition-colors"
                                            >
                                                Mis Pedidos
                                            </Link>
                                            {user.role === 'admin' && (
                                                <Link
                                                    to="/admin"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                    className="block px-4 py-2 text-sm text-foreground-secondary hover:text-foreground hover:bg-surface-hover transition-colors"
                                                >
                                                    Panel Admin
                                                </Link>
                                            )}
                                            <hr className="my-1 border-border" />
                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left px-4 py-2 text-sm text-error hover:bg-error-muted transition-colors"
                                            >
                                                Cerrar Sesión
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-surface border border-border rounded-md hover:border-border-strong hover:bg-surface-hover transition-all"
                            >
                                Iniciar Sesión
                            </Link>
                        )}

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 rounded-md text-foreground-secondary hover:text-foreground hover:bg-surface-hover transition-all"
                            aria-label="Menú"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                {isMobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="md:hidden overflow-hidden border-t border-border"
                        >
                            <div className="py-4 space-y-1">
                                {navLinks.map(({ to, label }) => (
                                    <NavLink
                                        key={to}
                                        to={to}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={({ isActive }) => `
                      block px-4 py-3 text-base font-medium rounded-md transition-colors
                      ${isActive
                                                ? 'text-foreground bg-surface-hover'
                                                : 'text-foreground-secondary hover:text-foreground hover:bg-surface-hover'
                                            }
                    `}
                                    >
                                        {label}
                                    </NavLink>
                                ))}
                                {!user && (
                                    <Link
                                        to="/login"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="block px-4 py-3 text-base font-medium text-primary hover:bg-primary-muted rounded-md transition-colors"
                                    >
                                        Iniciar Sesión
                                    </Link>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>
        </header>
    );
};

export default Navbar;
