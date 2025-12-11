import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/axios";
import { getApiErrorMessage } from "../utils/errors";

const Perfil = () => {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const payload: {
        name?: string;
        password?: string;
        currentPassword?: string;
      } = {};
      if (name && name !== user?.name) payload.name = name;
      if (newPassword) {
        payload.password = newPassword;
        payload.currentPassword = currentPassword;
      }

      if (Object.keys(payload).length === 0) {
        setMessage("No hay cambios para guardar.");
        setLoading(false);
        return;
      }

      const { data } = await api.patch("/auth/me", payload);
      if (data?.success) {
        setMessage("Perfil actualizado correctamente.");
        // refrescar usuario en contexto
        await refreshUser();
        setCurrentPassword("");
        setNewPassword("");
      } else {
        setError(data?.message || "No se pudo actualizar el perfil");
      }
    } catch (err: unknown) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] pt-24 flex flex-col">
      <div className="max-w-3xl mx-auto px-4 py-8 w-full">
        <div className="glass p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-semibold dark:text-white">
                Mi perfil
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Actualiza tu nombre o cambia tu contraseña desde aquí.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nombre
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-gray-200 bg-white/60 dark:bg-black/30 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Contraseña actual (necesaria si vas a cambiar)
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-gray-200 bg-white/60 dark:bg-black/30 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                placeholder="Contraseña actual"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nueva contraseña
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-gray-200 bg-white/60 dark:bg-black/30 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                placeholder="Dejar vacío para mantener la misma contraseña"
                minLength={6}
              />
            </div>

            <div className="flex items-center space-x-3">
              <button
                disabled={loading}
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full hover:shadow-md disabled:opacity-60"
              >
                {loading ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>

            {message && <p className="text-sm text-green-600">{message}</p>}
            {error && <p className="text-sm text-red-600">{error}</p>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Perfil;
