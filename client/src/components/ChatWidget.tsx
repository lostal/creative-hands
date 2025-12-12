import { useState, useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Loader } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import api from "../utils/axios";
import logger from "../utils/logger";
import { getUserId, normalizeId, isSameUser } from "../utils/user";
import { MotionButton, MotionDiv, MotionSpan } from "../lib/motion";

const ChatWidget = () => {
  const { user, isAdmin } = useAuth();
  const { socket, connected } = useSocket();
  const [isOpen, setIsOpen] = useState(false);

  interface Message {
    _id: string;
    sender: { _id: string };
    content: string;
    createdAt: string;
    read?: boolean;
  }

  interface AdminInfo {
    _id: string;
    name: string;
    isOnline?: boolean;
  }

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cleanup timeout on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Obtener info del admin y mensajes
  useEffect(() => {
    if (user && !isAdmin) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const { data: adminData } = await api.get<{ admin: AdminInfo }>(
            "/chat/admin",
          );
          setAdminInfo(adminData.admin);

          const { data: messagesData } = await api.get<{ messages: Message[] }>(
            `/chat/messages/${adminData.admin._id}`,
          );
          setMessages(messagesData.messages);

          // Calcular mensajes no leídos iniciales
          const userId = user?.id || user?._id;
          const unread = messagesData.messages.filter((m) => {
            const senderId = m.sender._id?.toString?.() || m.sender._id;
            // Contar si NO es mi mensaje y NO está leído
            return senderId !== userId && !m.read;
          }).length;
          setUnreadCount(unread);
        } catch (error) {
          logger.error("Error al cargar datos:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [user, isAdmin]);

  // Socket listeners
  useEffect(() => {
    if (!socket || !user) return;

    socket.on("message:new", (message: Message) => {
      setMessages((prev) => [...prev, message]);
      if (!isOpen) {
        const currentUserId = getUserId(user);
        const senderId = normalizeId(message.sender._id);
        // Solo incrementar si el mensaje NO es mío
        if (!isSameUser(senderId, currentUserId)) {
          setUnreadCount((prev) => prev + 1);
        }
      }
    });

    socket.on(
      "typing:status",
      ({
        userId,
        isTyping: typingStatus,
      }: {
        userId: string;
        isTyping: boolean;
      }) => {
        if (isAdmin || userId === adminInfo?._id) {
          setTyping(typingStatus);
        }
      },
    );

    return () => {
      socket.off("message:new");
      socket.off("typing:status");
    };
  }, [socket, user, isOpen, isAdmin, adminInfo]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !adminInfo) return;

    const messageData = {
      receiverId: adminInfo._id,
      content: newMessage.trim(),
    };

    socket.emit("message:send", messageData);
    setNewMessage("");

    // Stop typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    socket.emit("typing:stop", { receiverId: adminInfo._id });
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    if (!socket || !adminInfo) return;

    // Emit typing start
    socket.emit("typing:start", { receiverId: adminInfo._id });

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing:stop", { receiverId: adminInfo._id });
    }, 1000);
  };

  const handleOpen = () => {
    setIsOpen(true);
    setUnreadCount(0);

    // Marcar mensajes como leídos en el servidor
    if (socket && adminInfo && user) {
      const userId = user.id || user._id;
      // ID de conversación estándar: IDs ordenados alfabéticamente
      const conversationId = [userId, adminInfo._id].sort().join("_");
      socket.emit("messages:read", { conversationId });
    }
  };

  if (!user || isAdmin) return null;

  return (
    <>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <MotionButton
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleOpen}
            aria-label={`Abrir chat de soporte${unreadCount > 0 ? `. ${unreadCount} mensajes sin leer` : ""}`}
            className="fixed bottom-6 right-6 w-14 h-14 bg-linear-to-br from-primary-500 to-primary-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:shadow-primary-500/50 transition-shadow duration-200 z-popover"
            style={{ willChange: "transform" }}
          >
            <MessageCircle className="w-6 h-6" />
            {unreadCount > 0 && (
              <MotionSpan
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold"
              >
                {unreadCount}
              </MotionSpan>
            )}
          </MotionButton>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <MotionDiv
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            /* Mobile: full width with small side margins. On sm+ use fixed size on the right. */
            className="fixed bottom-3 left-3 right-3 sm:right-6 sm:bottom-6 sm:left-auto sm:w-96 h-[60vh] sm:h-500px glass rounded-2xl shadow-2xl flex flex-col overflow-hidden z-popover"
          >
            {/* Header */}
            <div className="bg-linear-to-r from-primary-500 to-primary-600 p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  {adminInfo?.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-primary-600"></div>
                  )}
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">
                    {adminInfo?.name || "Soporte"}
                  </h3>
                  <p className="text-white/70 text-xs">
                    {connected ? "En línea" : "Desconectado"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Cerrar chat"
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader className="w-8 h-8 text-primary-500 animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <MessageCircle className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    No hay mensajes aún
                  </p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                    Envía un mensaje para comenzar
                  </p>
                </div>
              ) : (
                <>
                  {messages.map((message) => {
                    const currentUserId = getUserId(user);
                    const senderId = normalizeId(message.sender._id);
                    const isOwn = isSameUser(senderId, currentUserId);
                    return (
                      <MotionDiv
                        key={message._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${
                          isOwn ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                            isOwn
                              ? "bg-linear-to-br from-primary-500 to-primary-600 text-white"
                              : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              isOwn
                                ? "text-white/70"
                                : "text-gray-500 dark:text-gray-400"
                            }`}
                          >
                            {new Date(message.createdAt).toLocaleTimeString(
                              "es-ES",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </p>
                        </div>
                      </MotionDiv>
                    );
                  })}
                  {typing && (
                    <MotionDiv
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-3">
                        <div className="flex space-x-1">
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.4s" }}
                          ></div>
                        </div>
                      </div>
                    </MotionDiv>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleTyping}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm focus:outline-hidden focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                  disabled={!connected}
                />
                <MotionButton
                  whileTap={{ scale: 0.9 }}
                  type="submit"
                  disabled={!newMessage.trim() || !connected}
                  className="w-10 h-10 bg-linear-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-shadow duration-200"
                  style={{ willChange: "transform" }}
                >
                  <Send className="w-4 h-4" />
                </MotionButton>
              </div>
            </form>
          </MotionDiv>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;
