// Componentes del panel de administración
export { default as ProductFormModal } from "./ProductFormModal";
export { default as CategoryModal } from "./CategoryModal";
export { default as CategoryEditModal } from "./CategoryEditModal";
export { default as ImageUploader } from "./ImageUploader";

// Re-exportar tipos del hook de formulario de producto
export type { ProductFormData, ImageItem } from "../../hooks/useProductForm";
