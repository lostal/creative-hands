import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, LogIn, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GridBackground, IndicatorDot } from '../components/ui';

/**
 * Login Page - v2 Design System
 * Precision Craft: Vercel/Apple + Teenage Engineering
 */

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData);

    if (result.success) {
      navigate('/products');
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background */}
      <GridBackground
        dotSize={1}
        dotSpacing={32}
        parallaxStrength={0.1}
        overlay
        className="absolute inset-0"
      />

      {/* Back Link */}
      <Link
        to="/"
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-sm font-medium
                 text-foreground-secondary hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al inicio
      </Link>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring', damping: 25 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="bg-surface border border-border-subtle rounded-2xl shadow-xl
                      overflow-hidden">
          {/* Header */}
          <div className="p-8 pb-6 text-center border-b border-border-subtle">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 
                        bg-gradient-to-br from-primary-500 to-primary-600 
                        rounded-2xl mb-4 shadow-glow"
            >
              <LogIn className="w-8 h-8 text-white" />
            </motion.div>

            <h1 className="text-2xl font-bold text-foreground mb-1">
              Iniciar sesión
            </h1>
            <p className="text-foreground-secondary text-sm">
              Bienvenido de nuevo a Creative Hands
            </p>
          </div>

          {/* Form */}
          <div className="p-8">
            {/* Error Alert */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-error-muted border border-error/20 
                         text-error rounded-lg text-sm flex items-start gap-3"
              >
                <IndicatorDot status="error" className="mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-tertiary" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="input pl-12"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-tertiary" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="input pl-12 pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 
                             text-foreground-tertiary hover:text-foreground 
                             transition-colors"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full justify-center py-3.5"
                whileHover={{ scale: loading ? 1 : 1.01 }}
                whileTap={{ scale: loading ? 1 : 0.99 }}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Iniciar sesión</span>
                    <LogIn className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </form>
          </div>

          {/* Footer */}
          <div className="px-8 py-6 bg-surface-hover border-t border-border-subtle text-center">
            <p className="text-sm text-foreground-secondary">
              ¿No tienes cuenta?{' '}
              <Link
                to="/register"
                className="text-primary-500 hover:text-primary-600 font-semibold transition-colors"
              >
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="mt-6 flex items-center justify-center gap-2 
                      text-xs font-mono text-foreground-tertiary">
          <IndicatorDot status="on" size="sm" />
          <span>Conexión segura</span>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
