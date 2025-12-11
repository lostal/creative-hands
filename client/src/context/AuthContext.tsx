import {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
} from "react";
import { useNavigate } from "react-router";
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
  loading: boolean;
  register: (
    userData: RegisterData,
  ) => Promise<{ success: boolean; message?: string }>;
  login: (
    credentials: LoginCredentials,
  ) => Promise<{ success: boolean; message?: string }>;
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

/**
 * AuthProvider - Maneja autenticación usando httpOnly cookies
 *
 * SEGURIDAD: El token JWT se almacena en una cookie httpOnly configurada por el servidor.
 * Esto previene ataques XSS ya que JavaScript no puede acceder a la cookie.
 * El navegador envía automáticamente la cookie en cada petición (withCredentials: true).
 */
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Hook de navegación para redirecciones sin recargar la página
  let navigate: ReturnType<typeof useNavigate> | null = null;
  try {
    navigate = useNavigate();
  } catch {
    // En tests o fuera de Router, navigate no está disponible
  }

  // Función para limpiar auth y redirigir (usada por interceptor y logout)
  const clearAuthAndRedirect = useCallback(() => {
    setUser(null);

    // Usar navegación de React en lugar de window.location.replace
    // Esto evita recargar la app y perder estado (ej. carrito)
    if (navigate) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // Interceptor global para capturar 401 (token expirado / inválido)
  useEffect(() => {
    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        const status = error?.response?.status;
        const requestUrl = error?.config?.url || "";

        // No redirigir a login si el 401 viene de /auth/me (verificación inicial de sesión)
        // ya que es normal que falle si no hay sesión activa
        if (status === 401 && !requestUrl.includes("/auth/me")) {
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

  // Verificar usuario al cargar (la cookie se envía automáticamente)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Intentar obtener usuario actual - si hay cookie válida, funcionará
        const { data } = await api.get<{ user: User }>("/auth/me");
        setUser(data.user);
      } catch (error) {
        // Sin cookie válida o expirada - usuario no autenticado
        logger.info("No hay sesión activa");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const register = useCallback(async (userData: RegisterData) => {
    try {
      // El servidor establece la cookie httpOnly automáticamente
      const { data } = await api.post<{ user: User }>(
        "/auth/register",
        userData,
      );
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
      // El servidor establece la cookie httpOnly automáticamente
      const { data } = await api.post<{ user: User }>(
        "/auth/login",
        credentials,
      );
      setUser(data.user);
      return { success: true };
    } catch (error: unknown) {
      return {
        success: false,
        message: getApiErrorMessage(error) || "Error al iniciar sesión",
      };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // El servidor limpia la cookie httpOnly
      await api.post("/auth/logout");
    } catch (error) {
      logger.error("Error al cerrar sesión:", error);
    } finally {
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

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      loading,
      register,
      login,
      refreshUser,
      logout,
      clearAuthAndRedirect,
      isAuthenticated: !!user,
      isAdmin: user?.role === "admin",
    }),
    [user, loading, register, login, refreshUser, logout, clearAuthAndRedirect],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
