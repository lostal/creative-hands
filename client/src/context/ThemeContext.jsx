import { createContext, useContext, useEffect, useState, useCallback } from 'react';

/**
 * ThemeContext - v2 Design System
 * Respects system preference by default, persists user choice
 */

const ThemeContext = createContext();

const THEME_KEY = 'creative-hands-theme';

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

// Get initial theme based on system preference or saved preference
const getInitialTheme = () => {
  // Check if user has a saved preference
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'light' || saved === 'dark') {
    return saved;
  }

  // Fall back to system preference
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  return 'light';
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme);
  const [systemTheme, setSystemTheme] = useState(
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  );

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e) => {
      setSystemTheme(e.matches ? 'dark' : 'light');

      // Only update theme if user hasn't set a preference
      if (!localStorage.getItem(THEME_KEY)) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Legacy browsers
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;

    // Add transitioning class for smooth theme change
    root.classList.add('transitioning');

    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Remove transitioning class after animation
    const timeout = setTimeout(() => {
      root.classList.remove('transitioning');
    }, 300);

    return () => clearTimeout(timeout);
  }, [theme]);

  // Toggle between light and dark
  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem(THEME_KEY, newTheme);
      return newTheme;
    });
  }, []);

  // Set specific theme
  const setThemeMode = useCallback((mode) => {
    if (mode === 'light' || mode === 'dark') {
      setTheme(mode);
      localStorage.setItem(THEME_KEY, mode);
    } else if (mode === 'system') {
      // Reset to system preference
      localStorage.removeItem(THEME_KEY);
      setTheme(systemTheme);
    }
  }, [systemTheme]);

  // Reset to system preference
  const resetToSystem = useCallback(() => {
    localStorage.removeItem(THEME_KEY);
    setTheme(systemTheme);
  }, [systemTheme]);

  const value = {
    theme,
    systemTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
    toggleTheme,
    setTheme: setThemeMode,
    resetToSystem,
    hasUserPreference: Boolean(localStorage.getItem(THEME_KEY)),
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
