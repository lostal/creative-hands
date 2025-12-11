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

/**
 * Navbar Component - v2 Design System
 * Clean, minimal, properly aligned
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

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 30 }}
      className={`
        fixed top-0 left-0 right-0 z-fixed
        transition-all duration-normal
        ${scrolled
          ? 'bg-background/80 backdrop-blur-lg border-b border-border-subtle shadow-sm'
          : 'bg-transparent'
        }
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link
            to="/"
            onClick={handleLogoClick}
            className="flex-shrink-0"
          >
            <span className="text-xl md:text-2xl font-brand uppercase text-primary-500 
                           hover:text-primary-400 transition-colors">
              Creative Hands
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {/* Nav Links */}
            <Link
              to="/products"
              className={`
                text-sm font-medium transition-colors
                ${isActive('/products')
                  ? 'text-foreground'
                  : 'text-foreground-secondary hover:text-foreground'
                }
              `}
            >
              Productos
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                className={`
                  flex items-center gap-1.5 text-sm font-medium transition-colors
                  ${isActive('/admin')
                    ? 'text-foreground'
                    : 'text-foreground-secondary hover:text-foreground'
                  }
                `}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Admin</span>
              </Link>
            )}

            {/* Divider */}
            <div className="w-px h-5 bg-border" />

            {/* Cart (non-admin users only) */}
            {user && !isAdmin && (
              <button
                onClick={openCart}
                className="relative p-2 text-foreground-secondary hover:text-foreground
                         transition-colors rounded-lg hover:bg-surface-hover"
                aria-label="Abrir carrito"
              >
                <ShoppingBag className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 
                                 bg-primary-500 text-white text-[10px] font-bold
                                 rounded-full flex items-center justify-center">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </button>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-foreground-secondary hover:text-foreground
                       transition-colors rounded-lg hover:bg-surface-hover"
              aria-label={isDark ? 'Modo claro' : 'Modo oscuro'}
            >
              {isDark ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {/* User Menu / Auth */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full
                           border border-border-subtle hover:border-border
                           transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-primary-500 
                                flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {user.name}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-foreground-tertiary 
                                         transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-52 bg-surface border border-border-subtle
                               rounded-xl shadow-lg overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-border-subtle">
                        <p className="text-xs text-foreground-tertiary truncate">
                          {user.email}
                        </p>
                        <p className="mt-1 text-xs font-medium text-primary-500">
                          {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                        </p>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/perfil"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-foreground-secondary
                                   hover:text-foreground hover:bg-surface-hover transition-colors"
                        >
                          <User className="w-4 h-4" />
                          Perfil
                        </Link>

                        {!isAdmin && (
                          <Link
                            to="/my-orders"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-foreground-secondary
                                     hover:text-foreground hover:bg-surface-hover transition-colors"
                          >
                            <Package className="w-4 h-4" />
                            Mis Pedidos
                          </Link>
                        )}

                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm 
                                   text-foreground-secondary hover:text-error 
                                   hover:bg-error-muted transition-colors"
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
                  className="text-sm font-medium text-foreground-secondary 
                           hover:text-foreground transition-colors"
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white
                           bg-primary-500 hover:bg-primary-600 
                           rounded-lg transition-colors"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-foreground-secondary hover:text-foreground
                     transition-colors rounded-lg"
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
            <div className="px-4 py-4 space-y-1">
              <Link
                to="/products"
                className="block px-4 py-3 text-base font-medium text-foreground-secondary
                         hover:text-foreground hover:bg-surface-hover rounded-lg transition-colors"
              >
                Productos
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center gap-2 px-4 py-3 text-base font-medium 
                           text-foreground-secondary hover:text-foreground 
                           hover:bg-surface-hover rounded-lg transition-colors"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  Panel Admin
                </Link>
              )}

              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 w-full px-4 py-3 text-base font-medium
                         text-foreground-secondary hover:text-foreground
                         hover:bg-surface-hover rounded-lg transition-colors"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                Cambiar tema
              </button>

              <div className="my-2 h-px bg-border" />

              {user ? (
                <>
                  <div className="px-4 py-3">
                    <p className="font-medium text-foreground">{user.name}</p>
                    <p className="text-sm text-foreground-tertiary">{user.email}</p>
                  </div>

                  <Link
                    to="/perfil"
                    className="flex items-center gap-2 px-4 py-3 text-base font-medium
                             text-foreground-secondary hover:text-foreground
                             hover:bg-surface-hover rounded-lg transition-colors"
                  >
                    <User className="w-5 h-5" />
                    Perfil
                  </Link>

                  {!isAdmin && (
                    <>
                      <Link
                        to="/my-orders"
                        className="flex items-center gap-2 px-4 py-3 text-base font-medium
                                 text-foreground-secondary hover:text-foreground
                                 hover:bg-surface-hover rounded-lg transition-colors"
                      >
                        <Package className="w-5 h-5" />
                        Mis Pedidos
                      </Link>

                      <button
                        onClick={() => {
                          openCart();
                          setMobileMenuOpen(false);
                        }}
                        className="flex items-center justify-between w-full px-4 py-3 text-base font-medium
                                 text-foreground-secondary hover:text-foreground
                                 hover:bg-surface-hover rounded-lg transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="w-5 h-5" />
                          Carrito
                        </div>
                        {totalItems > 0 && (
                          <span className="w-5 h-5 bg-primary-500 text-white text-xs font-bold
                                         rounded-full flex items-center justify-center">
                            {totalItems}
                          </span>
                        )}
                      </button>
                    </>
                  )}

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-3 text-base font-medium
                             text-error hover:bg-error-muted rounded-lg transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <div className="space-y-2 pt-2">
                  <Link
                    to="/login"
                    className="block w-full px-4 py-3 text-center text-base font-medium
                             border border-border text-foreground-secondary
                             hover:text-foreground rounded-lg transition-colors"
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    to="/register"
                    className="block w-full px-4 py-3 text-center text-base font-medium
                             bg-primary-500 text-white hover:bg-primary-600
                             rounded-lg transition-colors"
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
