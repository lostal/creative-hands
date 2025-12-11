import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { token, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    // Esperar a que AuthContext haya terminado la verificación inicial (loading=false)
    // para evitar conectar un socket con un token que luego el servidor invalide y
    // provoque una desconexión inmediata.
    if (!loading && isAuthenticated && token) {
      // Determinar URL del servidor de sockets:
      // En producción, usar el mismo dominio (sin puerto específico)
      // En desarrollo, usar localhost:5000
      const serverUrl =
        import.meta.env.MODE === "production"
          ? window.location.origin
          : "http://localhost:5000";

      const newSocket = io(serverUrl, {
        auth: { token },
      });

      newSocket.on("connect", () => {
        if (import.meta.env.DEV) console.log("✅ Socket conectado");
        setConnected(true);
      });

      newSocket.on("disconnect", () => {
        if (import.meta.env.DEV) console.log("❌ Socket desconectado");
        setConnected(false);
      });

      newSocket.on("connect_error", (error) => {
        console.error("Error de conexión:", error);
        setConnected(false);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      // Si aún está cargando o no hay token, asegurar que no haya sockets abiertos
      if (socket) {
        socket.close();
        setSocket(null);
        setConnected(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // Nota: 'socket' omitido intencionalmente para evitar ciclo de reconexión infinito
  }, [isAuthenticated, token, loading]);

  const value = {
    socket,
    connected,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
