/**
 * AdminChat - Chat management for admin
 * 
 * Uses SocketContext for real-time messaging
 */

import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/axios';

const AdminChat = () => {
    const { socket, isConnected } = useSocket();
    const { user } = useAuth();

    const [conversations, setConversations] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);

    const messagesEndRef = useRef(null);

    // Fetch conversations
    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const { data } = await api.get('/chat/conversations');
                setConversations(data.conversations || []);
            } catch (err) {
                console.error('Error fetching conversations:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchConversations();
    }, []);

    // Fetch messages when user is selected
    useEffect(() => {
        if (!selectedUser) return;

        const fetchMessages = async () => {
            try {
                const { data } = await api.get(`/chat/messages/${selectedUser._id}`);
                setMessages(data.messages || []);
            } catch (err) {
                console.error('Error fetching messages:', err);
            }
        };

        fetchMessages();
    }, [selectedUser]);

    // Listen for new messages
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (message) => {
            if (selectedUser && (message.sender === selectedUser._id || message.receiver === selectedUser._id)) {
                setMessages(prev => [...prev, message]);
            }
            // Update conversation list
            setConversations(prev => {
                const userId = message.sender === user?._id ? message.receiver : message.sender;
                const existing = prev.find(c => c.user._id === userId);
                if (existing) {
                    return prev.map(c =>
                        c.user._id === userId
                            ? { ...c, lastMessage: message, unreadCount: c.user._id === selectedUser?._id ? 0 : (c.unreadCount || 0) + 1 }
                            : c
                    );
                }
                return prev;
            });
        };

        socket.on('message:new', handleNewMessage);
        return () => socket.off('message:new', handleNewMessage);
    }, [socket, selectedUser, user]);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUser) return;

        try {
            socket?.emit('message:send', {
                receiverId: selectedUser._id,
                content: newMessage,
            });
            setNewMessage('');
        } catch (err) {
            console.error('Error sending message:', err);
        }
    };

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="font-brand text-2xl md:text-3xl text-foreground">Chat</h1>
                <div className="flex items-center gap-2">
                    <span className={`led ${isConnected ? 'led-on' : 'led-off'}`} />
                    <span className="text-xs text-foreground-tertiary">
                        {isConnected ? 'Conectado' : 'Desconectado'}
                    </span>
                </div>
            </div>

            <div className="card overflow-hidden h-[600px] flex">
                {/* Conversations list */}
                <div className="w-64 border-r border-border flex-shrink-0 overflow-y-auto">
                    <div className="p-3 border-b border-border">
                        <p className="text-xs font-mono uppercase tracking-widest text-foreground-tertiary">
                            Conversaciones
                        </p>
                    </div>

                    {loading ? (
                        <div className="p-4 space-y-3">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-12 bg-surface-hover rounded animate-pulse" />
                            ))}
                        </div>
                    ) : conversations.length > 0 ? (
                        <div className="divide-y divide-border-subtle">
                            {conversations.map((conv) => (
                                <button
                                    key={conv.user._id}
                                    onClick={() => setSelectedUser(conv.user)}
                                    className={`w-full p-3 text-left hover:bg-surface-hover transition-colors ${selectedUser?._id === conv.user._id ? 'bg-surface-hover' : ''
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                <span className="text-xs font-medium text-primary">
                                                    {conv.user.name?.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            {conv.user.isOnline && (
                                                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-success rounded-full border-2 border-surface" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-foreground truncate">
                                                {conv.user.name}
                                            </p>
                                            {conv.lastMessage && (
                                                <p className="text-xs text-foreground-tertiary truncate">
                                                    {conv.lastMessage.content}
                                                </p>
                                            )}
                                        </div>
                                        {conv.unreadCount > 0 && (
                                            <span className="min-w-[20px] h-5 px-1.5 flex items-center justify-center bg-primary text-white text-xs font-medium rounded-full">
                                                {conv.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="p-4 text-center text-sm text-foreground-secondary">
                            No hay conversaciones
                        </div>
                    )}
                </div>

                {/* Chat area */}
                <div className="flex-1 flex flex-col">
                    {selectedUser ? (
                        <>
                            {/* Chat header */}
                            <div className="p-4 border-b border-border flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <span className="text-sm font-medium text-primary">
                                            {selectedUser.name?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    {selectedUser.isOnline && (
                                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-surface" />
                                    )}
                                </div>
                                <div>
                                    <p className="font-medium text-foreground">{selectedUser.name}</p>
                                    <p className="text-xs text-foreground-tertiary">
                                        {selectedUser.isOnline ? 'En línea' : 'Desconectado'}
                                    </p>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {messages.map((msg, index) => {
                                    const isOwn = msg.sender === user?._id;
                                    return (
                                        <div
                                            key={index}
                                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-[70%] px-3 py-2 rounded-lg ${isOwn
                                                        ? 'bg-primary text-white'
                                                        : 'bg-surface-hover text-foreground'
                                                    }`}
                                            >
                                                <p className="text-sm">{msg.content}</p>
                                                <p className={`text-xs mt-1 ${isOwn ? 'text-white/60' : 'text-foreground-tertiary'}`}>
                                                    {formatTime(msg.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message input */}
                            <form onSubmit={handleSendMessage} className="p-4 border-t border-border">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Escribe un mensaje..."
                                        className="input flex-1"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim()}
                                        className="btn btn-primary"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                                        </svg>
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-foreground-secondary">
                            Selecciona una conversación
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminChat;
