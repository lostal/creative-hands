import { AnimatePresence } from "framer-motion";
import { MotionDiv, MotionButton } from "../../lib/motion";
import { X, Save, Loader } from "lucide-react";
import { Category, Product } from "../../types";
import { useProductForm } from "../../hooks/useProductForm";
import ImageUploader from "./ImageUploader";

interface ProductFormModalProps {
  show: boolean;
  onClose: () => void;
  editingProduct: Product | null;
  categoriesList: Category[];
  onProductSaved: (product: Product, mode: "create" | "update") => void;
}

/**
 * Modal para crear/editar productos
 * Refactorizado para usar hook personalizado y componentes separados
 */
const ProductFormModal = ({
  show,
  onClose,
  editingProduct,
  categoriesList,
  onProductSaved,
}: ProductFormModalProps) => {
  const {
    formData,
    imageList,
    saving,
    fileErrors,
    dragActive,
    fileInputRef,
    handleChange,
    handleSubmit,
    handleClose,
    onFilesSelected,
    removeImage,
    triggerFileInput,
    setDragActive,
    setImageList,
  } = useProductForm({ editingProduct, onProductSaved, onClose });

  if (!show) return null;

  return (
    <AnimatePresence>
      <MotionDiv
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={handleClose}
      >
        <MotionDiv
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
          className="glass rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {editingProduct ? "Editar Producto" : "Nuevo Producto"}
            </h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre del producto
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descripción
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={3}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white resize-none"
              />
            </div>

            {/* Precio y Stock */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Precio (€)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Stock
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Categoría
              </label>
              <select
                name="categoryId"
                value={formData.categoryId || ""}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
              >
                <option value="">-- Seleccionar categoría --</option>
                {categoriesList.map((cat) => (
                  <option
                    key={cat._id || cat.slug || cat.name}
                    value={cat._id || cat.slug || cat.name}
                  >
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Materiales */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Materiales (separados por coma)
              </label>
              <input
                type="text"
                name="materials"
                value={formData.materials}
                onChange={handleChange}
                placeholder="Ej: Cerámica, Arcilla, Esmalte"
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
              />
            </div>

            {/* Imágenes */}
            <ImageUploader
              imageList={imageList}
              dragActive={dragActive}
              fileErrors={fileErrors}
              onFilesSelected={onFilesSelected}
              removeImage={removeImage}
              setDragActive={setDragActive}
              setImageList={setImageList}
              fileInputRef={fileInputRef}
              triggerFileInput={triggerFileInput}
            />

            {/* Botones de acción */}
            <div className="flex space-x-4 pt-4">
              <MotionButton
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={saving}
                className="flex-1 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-shadow duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                style={{ willChange: "transform" }}
              >
                {saving ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>{editingProduct ? "Actualizar" : "Crear"}</span>
                  </>
                )}
              </MotionButton>
              <MotionButton
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleClose}
                className="px-6 py-3 glass rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:shadow-md transition-shadow duration-200"
              >
                Cancelar
              </MotionButton>
            </div>
          </form>
        </MotionDiv>
      </MotionDiv>
    </AnimatePresence>
  );
};

export default ProductFormModal;