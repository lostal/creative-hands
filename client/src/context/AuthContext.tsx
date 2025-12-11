import { createContext, useState, useContext, useEffect, ReactNode, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/axios";
import { User } from "../types";
import { getApiErrorMessage } from "../utils/errors";
import logger from "../utils/logger";

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  register: (userData: RegisterData) => Promise<{ success: boolean; message?: string }>;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; message?: string }>;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
  clearAuthAndRedirect: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  // Usar localStorage para persistir la sesión entre pestañas y recargas.
  // Esto mejora la UX ya que el usuario no necesita loguearse en cada pestaña.
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));

  // Hook de navegación para redirecciones sin recargar la página
  let navigate: ReturnType<typeof useNavigate> | null = null;
  try {
    navigate = useNavigate();
  } catch {
    // En tests o fuera de Router, navigate no está disponible
  }

  // Función para limpiar auth y redirigir (usada por interceptor y logout)
  const clearAuthAndRedirect = useCallback(() => {
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common["Authorization"];
    localStorage.removeItem("token");

    // Usar navegación de React en lugar de window.location.replace
    // Esto evita recargar la app y perder estado (ej. carrito)
    if (navigate) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // Configurar axios con el token
  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      localStorage.setItem("token", token);
    } else {
      delete api.defaults.headers.common["Authorization"];
      localStorage.removeItem("token");
    }
  }, [token]);

  // Interceptor global para capturar 401 (token expirado / inválido)
  useEffect(() => {
    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        const status = error?.response?.status;
        if (status === 401) {
          // Token inválido o expirado: limpiar estado y redirigir sin recargar
          clearAuthAndRedirect();
        }
        return Promise.reject(error);
      },
    );

    return () => {
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [clearAuthAndRedirect]);

  // Verificar usuario al cargar
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const { data } = await api.get<{ user: User }>("/auth/me");
          setUser(data.user);
        } catch (error) {
          logger.error("Error al verificar autenticación:", error);
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const register = useCallback(async (userData: RegisterData) => {
    try {
      const { data } = await api.post<{ token: string; user: User }>("/auth/register", userData);
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (error: unknown) {
      return {
        success: false,
        message: getApiErrorMessage(error) || "Error al registrarse",
      };
    }
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      const { data } = await api.post<{ token: string }>("/auth/login", credentials);
      // Guardar token y establecer header de la instancia api inmediatamente
      api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
      // Guardar en localStorage para persistir entre pestañas
      localStorage.setItem("token", data.token);
      setToken(data.token);

      try {
        const { data: me } = await api.get<{ user: User }>("/auth/me");
        setUser(me.user);
        return { success: true };
      } catch (err: unknown) {
        // Si /me falla, limpiar estado y devolver error
        delete api.defaults.headers.common["Authorization"];
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
        return {
          success: false,
          message: getApiErrorMessage(err) || "Error al verificar usuario después del login",
        };
      }
    } catch (error: unknown) {
      return {
        success: false,
        message: getApiErrorMessage(error) || "Error al iniciar sesión",
      };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      logger.error("Error al cerrar sesión:", error);
    } finally {
      setToken(null);
      setUser(null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get<{ user: User }>("/auth/me");
      setUser(data.user);
    } catch (err) {
      logger.error("Error refrescando usuario:", err);
    }
  }, []);

  const value = useMemo<AuthContextType>(() => ({
    user,
    token,
    loading,
    register,
    login,
    refreshUser,
    logout,
    clearAuthAndRedirect,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
  }), [user, token, loading, register, login, refreshUser, logout, clearAuthAndRedirect]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
