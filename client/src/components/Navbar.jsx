import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun,
  Moon,
  User,
  LogOut,
  ShoppingBag,
  Package,
  Menu,
  X,
  LayoutDashboard,
  ChevronDown,
} from 'lucide-react';
import { IndicatorDot } from './ui';

/**
 * Navbar Component - v2 Design System
 * Precision Craft: Vercel/Apple + Teenage Engineering
 */

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { totalItems, openCart } = useCart();
  const { theme, toggleTheme, isDark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
  };

  const handleLogoClick = (e) => {
    e.preventDefault();
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  const navLinks = [
    { path: '/products', label: 'Productos' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 30 }}
      className={`
        fixed top-0 left-0 right-0 z-fixed
        transition-all duration-normal
        ${scrolled
          ? 'navbar-glass shadow-sm'
          : 'bg-transparent'
        }
      `}
    >
      <div className="container-page">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link
            to="/"
            onClick={handleLogoClick}
            className="flex items-center gap-3 group"
          >
            {/* LED Indicator */}
            <IndicatorDot status="active" pulse className="hidden sm:block" />

            <span className="text-xl md:text-2xl font-brand uppercase text-primary-500 tracking-wide
                           transition-all duration-fast group-hover:text-primary-400">
              Creative Hands
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {/* Nav Links */}
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`
                  relative text-sm font-medium transition-colors duration-fast
                  ${isActive(link.path)
                    ? 'text-foreground'
                    : 'text-foreground-secondary hover:text-foreground'
                  }
                `}
              >
                {link.label}
                {isActive(link.path) && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-500 rounded-full"
                  />
                )}
              </Link>
            ))}

            {/* Admin Link */}
            {isAdmin && (
              <Link
                to="/admin"
                className={`
                  flex items-center gap-2 text-sm font-medium transition-colors duration-fast
                  ${isActive('/admin')
                    ? 'text-foreground'
                    : 'text-foreground-secondary hover:text-foreground'
                  }
                `}
              >
                <LayoutDashboard className="w-4 h-4" />
                Admin
              </Link>
            )}

            {/* Divider */}
            <div className="w-px h-6 bg-border" />

            {/* Cart Button (non-admin users only) */}
            {user && !isAdmin && (
              <button
                onClick={openCart}
                className="relative p-2 rounded-lg text-foreground-secondary 
                         hover:text-foreground hover:bg-surface-hover
                         transition-colors duration-fast"
                aria-label="Abrir carrito"
              >
                <ShoppingBag className="w-5 h-5" />
                {totalItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 flex items-center justify-center
                             w-5 h-5 bg-accent text-white text-xs font-mono font-bold
                             rounded-full"
                  >
                    {totalItems > 9 ? '9+' : totalItems}
                  </motion.span>
                )}
              </button>
            )}

            {/* Theme Toggle */}
            <motion.button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-foreground-secondary 
                       hover:text-foreground hover:bg-surface-hover
                       transition-colors duration-fast"
              whileTap={{ scale: 0.95 }}
              aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={theme}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {isDark ? (
                    <Sun className="w-5 h-5" />
                  ) : (
                    <Moon className="w-5 h-5" />
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.button>

            {/* User Menu / Auth */}
            {user ? (
              <div className="relative">
                <motion.button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                           bg-surface border border-border-subtle
                           hover:border-border hover:shadow-sm
                           transition-all duration-fast"
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-center w-6 h-6 rounded-full
                                bg-gradient-to-br from-primary-500 to-primary-600">
                    <span className="text-white text-xs font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-foreground max-w-[100px] truncate">
                    {user.name}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-foreground-tertiary transition-transform
                                         ${userMenuOpen ? 'rotate-180' : ''}`} />
                </motion.button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      className="absolute right-0 mt-2 w-56 bg-surface border border-border-subtle
                               rounded-lg shadow-lg overflow-hidden z-dropdown"
                    >
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-border-subtle">
                        <p className="text-xs text-foreground-tertiary font-mono truncate">
                          {user.email}
                        </p>
                        <p className="mt-1 text-xs text-primary-500 font-medium">
                          {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                        </p>
                      </div>

                      {/* Menu Items */}
                      <div className="py-1">
                        <Link
                          to="/perfil"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground-secondary
                                   hover:text-foreground hover:bg-surface-hover transition-colors"
                        >
                          <User className="w-4 h-4" />
                          Perfil
                        </Link>

                        {!isAdmin && (
                          <Link
                            to="/my-orders"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground-secondary
                                     hover:text-foreground hover:bg-surface-hover transition-colors"
                          >
                            <Package className="w-4 h-4" />
                            Mis Pedidos
                          </Link>
                        )}

                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-foreground-secondary
                                   hover:text-error hover:bg-error-muted transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Cerrar sesión
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-foreground-secondary hover:text-foreground
                           transition-colors duration-fast"
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary btn-sm"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-foreground-secondary
                     hover:text-foreground hover:bg-surface-hover
                     transition-colors duration-fast"
            aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-surface border-t border-border-subtle overflow-hidden"
          >
            <div className="container-page py-4 space-y-2">
              {/* Nav Links */}
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`
                    flex items-center px-4 py-3 rounded-lg text-base font-medium
                    transition-colors duration-fast
                    ${isActive(link.path)
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-500/15 dark:text-primary-400'
                      : 'text-foreground-secondary hover:bg-surface-hover hover:text-foreground'
                    }
                  `}
                >
                  {link.label}
                </Link>
              ))}

              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium
                           text-foreground-secondary hover:bg-surface-hover hover:text-foreground
                           transition-colors duration-fast"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  Panel Admin
                </Link>
              )}

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-base font-medium
                         text-foreground-secondary hover:bg-surface-hover hover:text-foreground
                         transition-colors duration-fast"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                Cambiar tema
              </button>

              <div className="divider my-2" />

              {/* User Section */}
              {user ? (
                <>
                  <div className="px-4 py-3">
                    <p className="font-medium text-foreground">{user.name}</p>
                    <p className="text-sm text-foreground-tertiary font-mono">{user.email}</p>
                  </div>

                  <Link
                    to="/perfil"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium
                             text-foreground-secondary hover:bg-surface-hover hover:text-foreground
                             transition-colors duration-fast"
                  >
                    <User className="w-5 h-5" />
                    Perfil
                  </Link>

                  {!isAdmin && (
                    <>
                      <Link
                        to="/my-orders"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium
                                 text-foreground-secondary hover:bg-surface-hover hover:text-foreground
                                 transition-colors duration-fast"
                      >
                        <Package className="w-5 h-5" />
                        Mis Pedidos
                      </Link>

                      <button
                        onClick={() => {
                          openCart();
                          setMobileMenuOpen(false);
                        }}
                        className="flex items-center justify-between w-full px-4 py-3 rounded-lg text-base font-medium
                                 text-foreground-secondary hover:bg-surface-hover hover:text-foreground
                                 transition-colors duration-fast"
                      >
                        <div className="flex items-center gap-3">
                          <ShoppingBag className="w-5 h-5" />
                          Carrito
                        </div>
                        {totalItems > 0 && (
                          <span className="flex items-center justify-center w-6 h-6 
                                         bg-accent text-white text-xs font-mono font-bold rounded-full">
                            {totalItems}
                          </span>
                        )}
                      </button>
                    </>
                  )}

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-base font-medium
                             text-error hover:bg-error-muted transition-colors duration-fast"
                  >
                    <LogOut className="w-5 h-5" />
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <div className="space-y-2 pt-2">
                  <Link
                    to="/login"
                    className="flex items-center justify-center w-full px-4 py-3 rounded-lg
                             text-base font-medium border border-border
                             text-foreground-secondary hover:bg-surface-hover hover:text-foreground
                             transition-colors duration-fast"
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    to="/register"
                    className="btn btn-primary w-full justify-center"
                  >
                    Registrarse
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
