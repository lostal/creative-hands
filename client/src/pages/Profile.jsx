/**
 * Profile Page - User profile management
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
    const { user, updateProfile } = useAuth();

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setMessage({ type: '', text: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            await updateProfile(formData);
            setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
        } catch (err) {
            setMessage({
                type: 'error',
                text: err.response?.data?.message || 'Error al actualizar el perfil'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="py-8 md:py-12">
            <div className="container max-w-2xl">
                <h1 className="font-brand text-3xl md:text-4xl text-foreground mb-8">Mi Perfil</h1>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card p-6 md:p-8"
                >
                    {/* Avatar section */}
                    <div className="flex items-center gap-4 mb-8 pb-8 border-b border-border">
                        <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                            <span className="text-2xl font-medium text-primary">
                                {user?.name?.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <h2 className="font-medium text-foreground">{user?.name}</h2>
                            <p className="text-sm text-foreground-secondary">{user?.email}</p>
                            {user?.role === 'admin' && (
                                <span className="inline-block mt-1 px-2 py-0.5 text-xs font-mono bg-primary-muted text-primary rounded-full">
                                    Admin
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Profile form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {message.text && (
                            <div className={`p-3 rounded-md ${message.type === 'success'
                                    ? 'bg-success-muted border border-success/20'
                                    : 'bg-error-muted border border-error/20'
                                }`}>
                                <p className={`text-sm ${message.type === 'success' ? 'text-success' : 'text-error'}`}>
                                    {message.text}
                                </p>
                            </div>
                        )}

                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                                Nombre
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="input"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="input"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary"
                        >
                            {loading ? 'Guardando...' : 'Guardar cambios'}
                        </button>
                    </form>

                    {/* Account info */}
                    <div className="mt-8 pt-8 border-t border-border">
                        <h3 className="text-xs font-mono uppercase tracking-widest text-foreground-tertiary mb-4">
                            Información de cuenta
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-foreground-secondary">Miembro desde</span>
                                <span className="font-mono text-foreground">
                                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('es-ES', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    }) : '-'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-foreground-secondary">Tipo de cuenta</span>
                                <span className="font-mono text-foreground capitalize">{user?.role}</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Profile;
