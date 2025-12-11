import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Loader, Upload, GripVertical, Star } from "lucide-react";
import api from "../../utils/axios";
import { Category, Product } from "../../types";
import { getApiErrorMessage } from "../../utils/errors";

interface ProductFormModalProps {
  show: boolean;
  onClose: () => void;
  editingProduct: Product | null;
  categoriesList: Category[];
  onProductSaved: (product: Product, mode: "create" | "update") => void;
}

interface ImageItem {
  id: string;
  type: "existing" | "new";
  url: string;
  file?: File;
}

/**
 * Modal para crear/editar productos
 * Extrae la lógica del formulario de producto de Admin.jsx
 */
const ProductFormModal = ({
  show,
  onClose,
  editingProduct,
  categoriesList,
  onProductSaved,
}: ProductFormModalProps) => {
  // Helper to extract category ID from various possible shapes
  const getCategoryId = (product: Product | null): string => {
    if (!product) return "";
    // categoryId can be an object (populated) or string (ID)
    if (product.categoryId) {
      if (typeof product.categoryId === "string") return product.categoryId;
      if (typeof product.categoryId === "object" && "_id" in product.categoryId) {
        return product.categoryId._id;
      }
    }
    return "";
  };

  const [formData, setFormData] = useState(() =>
    editingProduct
      ? {
        name: editingProduct.name,
        description: editingProduct.description,
        price: editingProduct.price,
        categoryId: getCategoryId(editingProduct),
        stock: editingProduct.stock ?? editingProduct.countInStock ?? 0,
        materials: editingProduct.materials?.join(", ") || "",
      }
      : {
        name: "",
        description: "",
        price: "",
        categoryId: "",
        stock: "",
        materials: "",
      },
  );

  const [imageList, setImageList] = useState<ImageItem[]>(() =>
    (editingProduct?.images && editingProduct.images.length > 0)
      ? editingProduct.images.map((url: string, idx: number) => ({
        id: `e-${idx}-${Date.now()}`,
        type: "existing" as const,
        url,
      }))
      : [],
  );

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const draggedIdRef = useRef<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Aliases for framer-motion components
  const MotionDiv = motion.div as any;
  const MotionButton = motion.button as any;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    // Checkbox case normally handled by 'checked' but not used here explicitly in initial state, 
    // kept for robustness if needed or removed if unused.
    // For standard inputs:
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const fd = new FormData();
      fd.append("name", formData.name);
      fd.append("description", formData.description);
      fd.append("price", String(formData.price));
      fd.append("categoryId", formData.categoryId);
      fd.append("stock", String(formData.stock));
      fd.append("materials", formData.materials);

      if (editingProduct) {
        const keepImages = imageList
          .filter((it) => it.type === "existing")
          .map((it) => it.url);
        fd.append("keepImages", JSON.stringify(keepImages));

        const order = imageList.map((it) =>
          it.type === "existing" ? it.url : "__new__",
        );
        fd.append("order", JSON.stringify(order));

        for (const it of imageList) {
          if (it.type === "new" && it.file) fd.append("images", it.file);
        }

        const response = await api.put(
          `/api/products/${editingProduct._id}`,
          fd,
          { headers: { "Content-Type": "multipart/form-data" } },
        );
        onProductSaved(response.data.product, "update");
      } else {
        for (const it of imageList) {
          if (it.type === "new" && it.file) fd.append("images", it.file);
        }

        const response = await api.post("/api/products", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        onProductSaved(response.data.product, "create");
      }

      // Limpiar previews locales
      imageList.forEach((it) => {
        if (it.type === "new" && it.url) URL.revokeObjectURL(it.url);
      });
      handleClose();
    } catch (error) {
      console.error("Error al guardar producto:", error);
      alert("Error al guardar el producto");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    imageList.forEach((it) => {
      if (it.type === "new" && it.url) URL.revokeObjectURL(it.url);
    });
    onClose();
  };

  const onFilesSelected = (e: React.ChangeEvent<HTMLInputElement> | any) => {
    const files = Array.from((e.target.files as FileList) || []);
    if (files.length === 0) return;

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    const maxSize = 2 * 1024 * 1024;
    const errors: string[] = [];
    const validFiles: File[] = [];

    files.forEach((file) => {
      if (!allowed.includes(file.type)) {
        errors.push(`${file.name}: tipo no permitido`);
        return;
      }
      if (file.size > maxSize) {
        errors.push(`${file.name}: excede 2MB`);
        return;
      }
      validFiles.push(file);
    });

    if (errors.length > 0) setFileErrors((prev) => [...prev, ...errors]);
    if (validFiles.length === 0) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const previews: ImageItem[] = validFiles.map((file, idx) => ({
      id: `n-${Date.now()}-${idx}`,
      type: "new",
      url: URL.createObjectURL(file),
      file,
    }));

    setImageList((prev) => [...prev, ...previews]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length === 0) return;
    onFilesSelected({ target: { files } });
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const removeImage = async (id: string) => {
    const item = imageList.find((it) => it.id === id);
    if (!item) return;

    if (item.type === "existing") {
      if (!editingProduct) {
        setImageList((prev) => prev.filter((it) => it.id !== id));
        return;
      }

      if (
        !window.confirm(
          "¿Eliminar esta imagen? Esta acción borrará el archivo del servidor.",
        )
      )
        return;

      try {
        const { data } = await api.delete(
          `/api/products/${editingProduct._id}/images`,
          { data: { image: item.url } },
        );
        if (data?.success) {
          setImageList((prev) => prev.filter((it) => it.id !== id));
        } else {
          alert(data.message || "No se pudo eliminar la imagen");
        }
      } catch (error: unknown) {
        console.error("Error al eliminar imagen:", error);
        alert(getApiErrorMessage(error) || "Error al eliminar imagen");
      }
    } else {
      if (item.url) URL.revokeObjectURL(item.url);
      setImageList((prev) => prev.filter((it) => it.id !== id));
    }
  };

  const onThumbDragStart = (e: React.DragEvent, id: string) => {
    draggedIdRef.current = id;
    try {
      e.dataTransfer.setData("text/plain", id);
      e.dataTransfer.effectAllowed = "move";
    } catch {
      // Ignore browser compatibility issues
    }
  };

  const onThumbDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const onThumbDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const fromId = draggedIdRef.current || e.dataTransfer.getData("text/plain");
    if (!fromId || fromId === targetId) return;
    setImageList((prev) => {
      const arr = [...prev];
      const fromIndex = arr.findIndex((it) => it.id === fromId);
      const toIndex = arr.findIndex((it) => it.id === targetId);
      if (fromIndex === -1 || toIndex === -1) return prev;
      const [moved] = arr.splice(fromIndex, 1);
      arr.splice(toIndex, 0, moved);
      return arr;
    });
    draggedIdRef.current = null;
  };

  const onThumbDragEnd = () => {
    draggedIdRef.current = null;
  };

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
          onClick={(e: any) => e.stopPropagation()}
          className="glass rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
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

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Imágenes del producto
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={onFilesSelected}
                className="hidden"
              />

              <div
                onClick={triggerFileInput}
                onDragEnter={onDragEnter}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={`w-full cursor-pointer rounded-xl border-2 border-dashed p-4 flex items-center gap-4 ${dragActive
                  ? "border-primary-500 bg-primary-50/40 dark:bg-primary-900/20"
                  : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                  }`}
              >
                <div className="p-3 rounded-lg bg-primary-50 dark:bg-gray-700 text-primary-600 dark:text-white">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    Añadir imágenes
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">
                    {dragActive
                      ? "Suelta para subir"
                      : "Haz click para seleccionar o arrastra los archivos aquí"}
                  </div>
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {imageList.length > 0
                      ? `${imageList.length} imagen(es) seleccionadas — arrastra las miniaturas para reordenar`
                      : "Puedes seleccionar varias imágenes (máx. 5)"}
                  </div>
                </div>
                <div className="ml-2 hidden sm:flex items-center text-xs text-gray-500 dark:text-gray-300">
                  <span className="px-2 py-1 bg-white/60 dark:bg-gray-800/60 rounded-full">
                    Arrastra para reordenar
                  </span>
                </div>
              </div>

              {fileErrors.length > 0 && (
                <div className="mt-2 text-sm text-red-500">
                  {fileErrors.map((err, i) => (
                    <div key={i}>{err}</div>
                  ))}
                </div>
              )}

              {imageList?.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-3">
                  {imageList.map((it) => (
                    <MotionDiv
                      key={it.id}
                      layout
                      draggable
                      onDragStart={(e: React.DragEvent) =>
                        onThumbDragStart(e, it.id)
                      }
                      onDragOver={onThumbDragOver}
                      onDrop={(e: React.DragEvent) => onThumbDrop(e, it.id)}
                      onDragEnd={onThumbDragEnd}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      className="relative rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900 cursor-move shadow-sm"
                    >
                      <div className="absolute left-2 top-2 text-white/90 dark:text-white/90">
                        <GripVertical className="w-4 h-4 opacity-90" />
                      </div>

                      <img
                        src={it.url}
                        alt={
                          it.type === "new" ? it.file?.name || "preview" : "img"
                        }
                        className="w-full h-24 object-cover"
                      />

                      <button
                        type="button"
                        onClick={() => removeImage(it.id)}
                        className="absolute top-2 right-2 bg-black/40 dark:bg-white/10 text-white dark:text-white p-1 rounded-full hover:bg-red-500"
                        aria-label="Eliminar imagen"
                      >
                        <X className="w-3 h-3" />
                      </button>

                      <div className="absolute left-2 bottom-2 bg-black/40 text-white text-xs px-2 py-0.5 rounded">
                        {it.type === "existing"
                          ? "Subida"
                          : it.file?.name || "Nuevo"}
                      </div>

                      {imageList[0]?.id === it.id && (
                        <div className="absolute right-2 bottom-2 flex items-center gap-1 bg-yellow-400 text-black text-xs px-2 py-0.5 rounded">
                          <Star className="w-3 h-3" />
                          <span>Principal</span>
                        </div>
                      )}
                    </MotionDiv>
                  ))}
                </div>
              )}
            </div>

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