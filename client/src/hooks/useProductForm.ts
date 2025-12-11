import { useState, useRef, useCallback } from "react";
import api from "../utils/axios";
import { Product } from "../types";
import { getApiErrorMessage } from "../utils/errors";
import logger from "../utils/logger";

/**
 * Datos del formulario de producto
 */
export interface ProductFormData {
  name: string;
  description: string;
  price: string | number;
  categoryId: string;
  stock: string | number;
  materials: string;
}

/**
 * Representa una imagen en el formulario (existente o nueva)
 */
export interface ImageItem {
  id: string;
  type: "existing" | "new";
  url: string;
  file?: File;
}

/**
 * Configuración de validación de archivos
 */
const FILE_CONFIG = {
  allowedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  maxSize: 2 * 1024 * 1024, // 2MB
  maxImages: 5,
};

/**
 * Helper para extraer el ID de categoría de un producto
 */
const getCategoryId = (product: Product | null): string => {
  if (!product) return "";
  if (product.category) {
    if (typeof product.category === "string") return product.category;
    if (typeof product.category === "object" && "_id" in product.category) {
      return product.category._id;
    }
  }
  return "";
};

/**
 * Genera el estado inicial del formulario
 */
const getInitialFormData = (product: Product | null): ProductFormData => {
  if (product) {
    return {
      name: product.name,
      description: product.description,
      price: product.price,
      categoryId: getCategoryId(product),
      stock: product.stock ?? 0,
      materials: product.materials?.join(", ") || "",
    };
  }
  return {
    name: "",
    description: "",
    price: "",
    categoryId: "",
    stock: "",
    materials: "",
  };
};

/**
 * Genera la lista inicial de imágenes desde un producto existente
 */
const getInitialImageList = (product: Product | null): ImageItem[] => {
  if (product?.images && product.images.length > 0) {
    return product.images.map((url: string, idx: number) => ({
      id: `e-${idx}-${Date.now()}`,
      type: "existing" as const,
      url,
    }));
  }
  return [];
};

interface UseProductFormProps {
  editingProduct: Product | null;
  onProductSaved: (product: Product, mode: "create" | "update") => void;
  onClose: () => void;
}

interface UseProductFormReturn {
  formData: ProductFormData;
  imageList: ImageItem[];
  saving: boolean;
  fileErrors: string[];
  dragActive: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleClose: () => void;
  onFilesSelected: (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | { target: { files: FileList | File[] } },
  ) => void;
  removeImage: (id: string) => Promise<void>;
  triggerFileInput: () => void;
  setDragActive: React.Dispatch<React.SetStateAction<boolean>>;
  setImageList: React.Dispatch<React.SetStateAction<ImageItem[]>>;
}

/**
 * Hook personalizado para manejar la lógica del formulario de producto
 * Extrae toda la lógica de estado del componente ProductFormModal
 */
export const useProductForm = ({
  editingProduct,
  onProductSaved,
  onClose,
}: UseProductFormProps): UseProductFormReturn => {
  const [formData, setFormData] = useState<ProductFormData>(() =>
    getInitialFormData(editingProduct),
  );

  const [imageList, setImageList] = useState<ImageItem[]>(() =>
    getInitialImageList(editingProduct),
  );

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  /**
   * Maneja cambios en los campos del formulario
   */
  const handleChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    [],
  );

  /**
   * Limpia recursos y cierra el modal
   */
  const handleClose = useCallback(() => {
    imageList.forEach((it) => {
      if (it.type === "new" && it.url) URL.revokeObjectURL(it.url);
    });
    onClose();
  }, [imageList, onClose]);

  /**
   * Valida y procesa archivos seleccionados
   */
  const onFilesSelected = useCallback(
    (
      e:
        | React.ChangeEvent<HTMLInputElement>
        | { target: { files: FileList | File[] } },
    ) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      const errors: string[] = [];
      const validFiles: File[] = [];

      files.forEach((file) => {
        if (!FILE_CONFIG.allowedTypes.includes(file.type)) {
          errors.push(`${file.name}: tipo no permitido`);
          return;
        }
        if (file.size > FILE_CONFIG.maxSize) {
          errors.push(`${file.name}: excede 2MB`);
          return;
        }
        validFiles.push(file);
      });

      if (errors.length > 0) {
        setFileErrors((prev) => [...prev, ...errors]);
      }

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
    },
    [],
  );

  /**
   * Abre el selector de archivos
   */
  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  /**
   * Elimina una imagen de la lista
   */
  const removeImage = useCallback(
    async (id: string) => {
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
        ) {
          return;
        }

        try {
          const { data } = await api.delete(
            `/products/${editingProduct._id}/images`,
            { data: { image: item.url } },
          );
          if (data?.success) {
            setImageList((prev) => prev.filter((it) => it.id !== id));
          } else {
            alert(data.message || "No se pudo eliminar la imagen");
          }
        } catch (error: unknown) {
          const errorMsg =
            getApiErrorMessage(error) || "Error al eliminar imagen";
          logger.error("Error al eliminar imagen:", errorMsg);
          alert(errorMsg);
        }
      } else {
        if (item.url) URL.revokeObjectURL(item.url);
        setImageList((prev) => prev.filter((it) => it.id !== id));
      }
    },
    [imageList, editingProduct],
  );

  /**
   * Envía el formulario al servidor
   */
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
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
          // Modo edición: mantener imágenes existentes y agregar nuevas
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
            `/products/${editingProduct._id}`,
            fd,
            { headers: { "Content-Type": "multipart/form-data" } },
          );
          onProductSaved(response.data.product, "update");
        } else {
          // Modo creación
          for (const it of imageList) {
            if (it.type === "new" && it.file) fd.append("images", it.file);
          }

          const response = await api.post("/products", fd, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          onProductSaved(response.data.product, "create");
        }

        // Limpiar previews locales
        imageList.forEach((it) => {
          if (it.type === "new" && it.url) URL.revokeObjectURL(it.url);
        });
        handleClose();
      } catch (error: unknown) {
        const errorMsg =
          getApiErrorMessage(error) || "Error al guardar el producto";
        logger.error("Error al guardar producto:", errorMsg);
        alert(errorMsg);
      } finally {
        setSaving(false);
      }
    },
    [formData, imageList, editingProduct, onProductSaved, handleClose],
  );

  return {
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
  };
};

export default useProductForm;
