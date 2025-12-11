import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import api from "../../utils/axios";

/**
 * Modal para gestionar categorías (listar, crear, eliminar)
 * Extrae la lógica de categorías de Admin.jsx
 */
const CategoryModal = ({
    show,
    onClose,
    categoriesList,
    onCategoriesChange,
    onEditCategory,
}) => {
    const [newCategory, setNewCategory] = useState({
        name: "",
        slug: "",
        description: "",
    });

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        try {
            await api.post("/api/categories", newCategory);
            onCategoriesChange();
            setNewCategory({ name: "", slug: "", description: "" });
        } catch (error) {
            console.error("Error al crear categoría:", error);
            alert(error.response?.data?.message || "Error al crear categoría");
        }
    };

    const handleDeleteCategory = async (id) => {
        if (
            !window.confirm(
                "¿Eliminar esta categoría? Los productos pueden quedarse con category legacy."
            )
        )
            return;
        try {
            await api.delete(`/api/categories/${id}`);
            onCategoriesChange();
        } catch (error) {
            console.error("Error al eliminar categoría:", error);
            alert(error.response?.data?.message || "Error al eliminar categoría");
        }
    };

    if (!show) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="glass rounded-3xl p-6 max-w-lg w-full"
                >
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Gestionar categorías
                        </h3>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {/* Lista de categorías existentes */}
                        <div>
                            <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">
                                Categorías existentes
                            </h4>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {categoriesList.map((cat) => (
                                    <div
                                        key={cat._id || cat.slug || cat.name}
                                        className="p-3 rounded-lg bg-white/60 dark:bg-gray-800/60 flex items-center justify-between gap-4 overflow-hidden"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-gray-900 dark:text-white truncate">
                                                {cat.name}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                {cat.slug}
                                            </div>
                                            {cat.description && (
                                                <div className="text-xs text-gray-600 dark:text-gray-300 mt-1 truncate">
                                                    {cat.description}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-shrink-0 flex items-center gap-2">
                                            <button
                                                onClick={() => onEditCategory(cat)}
                                                className="px-3 py-1 glass rounded-md text-gray-700 dark:text-gray-300"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCategory(cat._id)}
                                                className="px-3 py-1 bg-red-500 text-white rounded-md"
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Formulario para crear nueva categoría */}
                        <form onSubmit={handleCreateCategory} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Nombre
                                </label>
                                <input
                                    value={newCategory.name}
                                    onChange={(e) =>
                                        setNewCategory({ ...newCategory, name: e.target.value })
                                    }
                                    required
                                    className="w-full px-4 py-2 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Slug (opcional)
                                </label>
                                <input
                                    value={newCategory.slug}
                                    onChange={(e) =>
                                        setNewCategory({ ...newCategory, slug: e.target.value })
                                    }
                                    placeholder="auto"
                                    className="w-full px-4 py-2 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Descripción (opcional)
                                </label>
                                <textarea
                                    value={newCategory.description}
                                    onChange={(e) =>
                                        setNewCategory({
                                            ...newCategory,
                                            description: e.target.value,
                                        })
                                    }
                                    className="w-full px-4 py-2 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 rounded-xl glass text-gray-700 dark:text-gray-300"
                                >
                                    Cerrar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-xl bg-primary-500 text-white"
                                >
                                    Crear
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default CategoryModal;
