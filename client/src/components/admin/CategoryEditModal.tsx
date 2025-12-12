import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { MotionDiv } from "../../lib/motion";
import { X } from "lucide-react";
import api from "../../utils/axios";
import { Category } from "../../types";
import { getApiErrorMessage } from "../../utils/errors";
import logger from "../../utils/logger";

interface CategoryEditModalProps {
  show: boolean;
  onClose: () => void;
  category: Category | null;
  onCategorySaved: () => void;
}

/**
 * Modal para editar una categoría existente
 */
const CategoryEditModal = ({
  show,
  onClose,
  category,
  onCategorySaved,
}: CategoryEditModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || "",
        slug: category.slug || "",
        description: category.description || "",
      });
    }
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`/categories/${category?._id}`, formData);
      onCategorySaved();
    } catch (error: unknown) {
      logger.error("Error al actualizar categoría:", error);
      alert(getApiErrorMessage(error) || "Error al actualizar categoría");
    }
  };

  if (!show || !category) return null;

  return (
    <AnimatePresence>
      <MotionDiv
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-60 p-4"
        onClick={onClose}
      >
        <MotionDiv
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
          className="glass rounded-3xl p-6 max-w-md w-full"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Editar categoría
            </h3>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre
              </label>
              <input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                className="w-full px-4 py-2 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Slug
              </label>
              <input
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                className="w-full px-4 py-2 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-2 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl glass text-gray-700 dark:text-gray-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-primary-500 text-white"
              >
                Guardar
              </button>
            </div>
          </form>
        </MotionDiv>
      </MotionDiv>
    </AnimatePresence>
  );
};

export default CategoryEditModal;
