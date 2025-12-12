import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";
import logger from "../utils/logger";

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within SocketProvider");
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

/**
 * Obtener URL del servidor de sockets según el entorno
 */
const getServerUrl = (): string => {
  return import.meta.env.MODE === "production"
    ? window.location.origin
    : "http://localhost:5000";
};

export const SocketProvider = ({ children }: SocketProviderProps) => {
  // Usar useRef para evitar re-renders innecesarios y loops infinitos
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    // Esperar a que AuthContext haya terminado la verificación inicial
    if (loading) {
      return;
    }

    if (isAuthenticated) {
      // Evitar crear múltiples conexiones
      if (socketRef.current) {
        return;
      }

      const newSocket = io(getServerUrl(), {
        withCredentials: true,
      });

      newSocket.on("connect", () => {
        logger.socket("✅ Socket conectado");
        setConnected(true);
      });

      newSocket.on("disconnect", () => {
        logger.socket("❌ Socket desconectado");
        setConnected(false);
      });

      newSocket.on("connect_error", (error) => {
        logger.error("Error de conexión:", error);
        setConnected(false);
      });

      socketRef.current = newSocket;

      return () => {
        newSocket.close();
        socketRef.current = null;
        setConnected(false);
      };
    } else {
      // No autenticado: cerrar socket si existe
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
        setConnected(false);
      }
    }
  }, [isAuthenticated, loading]);

  const value: SocketContextType = {
    socket: socketRef.current,
    connected,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

