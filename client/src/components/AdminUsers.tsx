import { useState, useEffect } from "react";
import api from "../utils/axios";
import { getApiErrorMessage } from "../utils/errors";
import logger from "../utils/logger";
import {
  Loader,
  Trash2,
  ShieldCheck,
  ShieldOff,
  User as UserIcon,
  Mail,
  Calendar,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { MotionDiv } from "../lib/motion";
import { User, UsersResponse } from "../types";
import { useAuth } from "../context/AuthContext";

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get<UsersResponse>("/users");
      if (data.success) {
        setUsers(data.users);
      }
    } catch (err: unknown) {
      logger.error("Error al cargar usuarios:", err);
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const userToDelete = users.find((u) => u._id === userId);
    if (
      !window.confirm(
        `¿Estás seguro de eliminar al usuario "${userToDelete?.name}"?`,
      )
    ) {
      return;
    }

    try {
      setActionLoading(userId);
      await api.delete(`/users/${userId}`);
      setUsers(users.filter((u) => u._id !== userId));
    } catch (err: unknown) {
      logger.error("Error al eliminar usuario:", err);
      setError(getApiErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "user" : "admin";

    try {
      setActionLoading(userId);
      const { data } = await api.put<{ success: boolean; user: User }>(
        `/users/${userId}/role`,
        { role: newRole },
      );
      if (data.success) {
        setUsers(
          users.map((u) => (u._id === userId ? { ...u, role: newRole } : u)),
        );
      }
    } catch (err: unknown) {
      logger.error("Error al cambiar rol:", err);
      setError(getApiErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
        {error}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">
          No hay usuarios registrados
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {users.length} usuario{users.length !== 1 ? "s" : ""} registrado
          {users.length !== 1 ? "s" : ""}
        </p>
      </div>

      <AnimatePresence mode="popLayout">
        {users.map((user) => {
          const isCurrentUser =
            user._id === currentUser?._id || user._id === currentUser?.id;

          return (
            <MotionDiv
              key={user._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Info del usuario */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {user.name}
                      </h3>
                      {user.role === "admin" && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          Admin
                        </span>
                      )}
                      {isCurrentUser && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                          Tú
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                      <Mail className="w-3 h-3" />
                      {user.email}
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2 ml-auto sm:ml-0">
                  {/* Botón cambiar rol */}
                  <button
                    onClick={() => handleToggleRole(user._id, user.role)}
                    disabled={isCurrentUser || actionLoading === user._id}
                    className={`p-2 rounded-lg transition-colors ${
                      isCurrentUser
                        ? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-700"
                        : user.role === "admin"
                          ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/50"
                          : "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/50"
                    }`}
                    title={
                      isCurrentUser
                        ? "No puedes cambiar tu propio rol"
                        : user.role === "admin"
                          ? "Quitar admin"
                          : "Hacer admin"
                    }
                  >
                    {actionLoading === user._id ? (
                      <Loader className="w-5 h-5 animate-spin" />
                    ) : user.role === "admin" ? (
                      <ShieldOff className="w-5 h-5" />
                    ) : (
                      <ShieldCheck className="w-5 h-5" />
                    )}
                  </button>

                  {/* Botón eliminar */}
                  <button
                    onClick={() => handleDeleteUser(user._id)}
                    disabled={isCurrentUser || actionLoading === user._id}
                    className={`p-2 rounded-lg transition-colors ${
                      isCurrentUser
                        ? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-700"
                        : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50"
                    }`}
                    title={
                      isCurrentUser
                        ? "No puedes eliminar tu propia cuenta"
                        : "Eliminar usuario"
                    }
                  >
                    {actionLoading === user._id ? (
                      <Loader className="w-5 h-5 animate-spin" />
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </MotionDiv>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default AdminUsers;
