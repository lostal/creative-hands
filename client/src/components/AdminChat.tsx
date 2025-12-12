import { useState, useEffect, useRef } from "react";
import { Send, Loader, User as UserIcon } from "lucide-react";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";
import api from "../utils/axios";
import { User } from "../types";
import logger from "../utils/logger";
import { MotionDiv, MotionButton } from "../lib/motion";

interface Message {
  _id: string;
  sender: User;
  receiver: User;
  content: string;
  createdAt: string;
}

interface Conversation {
  conversationId: string;
  user: User & { isOnline?: boolean };
  lastMessage: {
    content: string;
    createdAt: string;
  };
  unreadCount: number;
}

const AdminChat = () => {
  const { socket, connected } = useSocket();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("message:new", (message: Message) => {
      // Actualizar mensajes si es la conversación activa
      if (
        selectedConversation &&
        (message.sender._id === selectedConversation.user._id ||
          message.receiver._id === selectedConversation.user._id)
      ) {
        setMessages((prev) => [...prev, message]);
      }

      // Actualizar lista de conversaciones
      fetchConversations();
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
        if (selectedConversation && userId === selectedConversation.user._id) {
          setTyping(typingStatus);
        }
      },
    );

    return () => {
      socket.off("message:new");
      socket.off("typing:status");
    };
  }, [socket, selectedConversation]);

  const fetchConversations = async () => {
    try {
      const { data } = await api.get<{ conversations: Conversation[] }>(
        "/chat/conversations",
      );
      setConversations(data.conversations);
      setLoading(false);
    } catch (error) {
      logger.error("Error al cargar conversaciones:", error);
      setLoading(false);
    }
  };

  const selectConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    try {
      const { data } = await api.get<{ messages: Message[] }>(
        `/chat/messages/${conversation.user._id}`,
      );
      setMessages(data.messages);
    } catch (error) {
      logger.error("Error al cargar mensajes:", error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !selectedConversation) return;

    const messageData = {
      receiverId: selectedConversation.user._id,
      content: newMessage.trim(),
    };

    socket.emit("message:send", messageData);
    setNewMessage("");

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    socket.emit("typing:stop", { receiverId: selectedConversation.user._id });
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    if (!socket || !selectedConversation) return;

    socket.emit("typing:start", { receiverId: selectedConversation.user._id });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing:stop", { receiverId: selectedConversation.user._id });
    }, 1000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-12 h-12 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-300px)]">
      {/* Conversations List */}
      <div className="glass rounded-2xl p-6 overflow-y-auto">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Conversaciones
        </h3>

        {conversations.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No hay conversaciones aún
          </p>
        ) : (
          <div className="space-y-2">
            {conversations.map((conv) => (
              <MotionButton
                key={conv.conversationId}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => selectConversation(conv)}
                className={`w-full p-4 rounded-xl text-left transition-colors duration-200 ${
                  selectedConversation?.conversationId === conv.conversationId
                    ? "bg-linear-to-r from-primary-500 to-primary-600 text-white"
                    : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {conv.user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    {conv.user.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white dark:border-gray-800"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate text-gray-900 dark:text-white">
                      {conv.user.name}
                    </p>
                    <p
                      className={`text-sm truncate ${
                        selectedConversation?.conversationId ===
                        conv.conversationId
                          ? "text-white/80"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {conv.lastMessage.content}
                    </p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {conv.unreadCount}
                      </span>
                    </div>
                  )}
                </div>
              </MotionButton>
            ))}
          </div>
        )}
      </div>

      {/* Chat Window */}
      <div className="md:col-span-2 glass rounded-2xl flex flex-col overflow-hidden">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-linear-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">
                    {selectedConversation.user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                {selectedConversation.user.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white dark:border-gray-800"></div>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {selectedConversation.user.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedConversation.user.email}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50">
              {messages.map((message) => {
                const isOwn = user && message.sender._id === user._id;
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
                  className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-full text-sm focus:outline-hidden focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                  disabled={!connected}
                />
                <MotionButton
                  whileTap={{ scale: 0.9 }}
                  type="submit"
                  disabled={!newMessage.trim() || !connected}
                  className="w-12 h-12 bg-linear-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-shadow duration-200"
                  style={{ willChange: "transform" }}
                >
                  <Send className="w-5 h-5" />
                </MotionButton>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <UserIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                Selecciona una conversación para comenzar
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChat;

