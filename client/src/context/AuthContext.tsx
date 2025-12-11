import { createContext, useState, useContext, useEffect, ReactNode } from "react";
import api from "../utils/axios";
import { User } from "../types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  register: (userData: any) => Promise<{ success: boolean; message?: string }>;
  login: (credentials: any) => Promise<{ success: boolean; message?: string }>;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
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
  // Usar sessionStorage para que cada pestaña/ventana tenga su propia sesión.
  // sessionStorage persiste al refrescar la misma pestaña, pero no se comparte
  // entre pestañas diferentes (comportamiento deseado para sesiones independientes).
  const [token, setToken] = useState<string | null>(sessionStorage.getItem("token"));

  // Configurar axios con el token
  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      sessionStorage.setItem("token", token);
    } else {
      delete api.defaults.headers.common["Authorization"];
      sessionStorage.removeItem("token");
    }
  }, [token]);

  // Interceptor global para capturar 401 (token expirado / inválido)
  useEffect(() => {
    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        const status = error?.response?.status;
        if (status === 401) {
          // Token inválido o expirado: limpiar estado local y redirigir al login
          setToken(null);
          setUser(null);
          try {
            // Redirigimos a la página de login para que el usuario vuelva a autenticarse
            window.location.replace("/login");
          } catch (e) {
            // en entornos sin window (tests) lo ignoramos
          }
        }
        return Promise.reject(error);
      },
    );

    return () => {
      api.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // Verificar usuario al cargar
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const { data } = await api.get<{ user: User }>("/auth/me");
          setUser(data.user);
        } catch (error) {
          console.error("Error al verificar autenticación:", error);
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const register = async (userData: any) => {
    try {
      const { data } = await api.post<{ token: string; user: User }>("/auth/register", userData);
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al registrarse",
      };
    }
  };

  const login = async (credentials: any) => {
    try {
      const { data } = await api.post<{ token: string }>("/auth/login", credentials);
      // Guardar token y establecer header de la instancia api inmediatamente
      api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
      // Guardar en sessionStorage para que la autenticación sea independiente por pestaña
      sessionStorage.setItem("token", data.token);
      setToken(data.token);

      try {
        const { data: me } = await api.get<{ user: User }>("/auth/me");
        setUser(me.user);
        return { success: true };
      } catch (err: any) {
        // Si /me falla, limpiar estado y devolver error
        delete api.defaults.headers.common["Authorization"];
        sessionStorage.removeItem("token");
        setToken(null);
        setUser(null);
        return {
          success: false,
          message:
            err.response?.data?.message ||
            "Error al verificar usuario después del login",
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al iniciar sesión",
      };
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      setToken(null);
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    register,
    login,
    // Permite a componentes refrescar el usuario actual después de cambios
    refreshUser: async () => {
      try {
        const { data } = await api.get<{ user: User }>("/auth/me");
        setUser(data.user);
      } catch (err) {
        console.error("Error refrescando usuario:", err);
      }
    },
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
