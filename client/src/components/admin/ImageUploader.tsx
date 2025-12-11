import React, { useRef, useCallback } from "react";
import { Upload, GripVertical, X, Star } from "lucide-react";
import { ImageItem } from "../../hooks/useProductForm";

interface ImageUploaderProps {
  imageList: ImageItem[];
  dragActive: boolean;
  fileErrors: string[];
  onFilesSelected: (e: React.ChangeEvent<HTMLInputElement> | { target: { files: FileList | File[] } }) => void;
  removeImage: (id: string) => Promise<void>;
  setDragActive: React.Dispatch<React.SetStateAction<boolean>>;
  setImageList: React.Dispatch<React.SetStateAction<ImageItem[]>>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  triggerFileInput: () => void;
}

/**
 * Componente para subir y gestionar imágenes de productos
 * Soporta drag-and-drop, reordenación y eliminación
 */
const ImageUploader: React.FC<ImageUploaderProps> = ({
  imageList,
  dragActive,
  fileErrors,
  onFilesSelected,
  removeImage,
  setDragActive,
  setImageList,
  fileInputRef,
  triggerFileInput,
}) => {
  const draggedIdRef = useRef<string | null>(null);

  // Handlers para drag-and-drop de archivos
  const onDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, [setDragActive]);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, [setDragActive]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, [setDragActive]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length === 0) return;
    onFilesSelected({ target: { files } });
  }, [setDragActive, onFilesSelected]);

  // Handlers para reordenación de thumbnails
  const onThumbDragStart = useCallback((e: React.DragEvent, id: string) => {
    draggedIdRef.current = id;
    try {
      e.dataTransfer.setData("text/plain", id);
      e.dataTransfer.effectAllowed = "move";
    } catch {
      // Ignore browser compatibility issues
    }
  }, []);

  const onThumbDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onThumbDrop = useCallback((e: React.DragEvent, targetId: string) => {
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
  }, [setImageList]);

  const onThumbDragEnd = useCallback(() => {
    draggedIdRef.current = null;
  }, []);

  return (
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

      {/* Zona de drop */}
      <div
        onClick={triggerFileInput}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`w-full cursor-pointer rounded-xl border-2 border-dashed p-4 flex items-center gap-4 ${
          dragActive
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

      {/* Errores de archivos */}
      {fileErrors.length > 0 && (
        <div className="mt-2 text-sm text-red-500">
          {fileErrors.map((err, i) => (
            <div key={i}>{err}</div>
          ))}
        </div>
      )}

      {/* Grid de thumbnails */}
      {imageList.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-3">
          {imageList.map((it) => (
            <div
              key={it.id}
              draggable
              onDragStart={(e) => onThumbDragStart(e, it.id)}
              onDragOver={onThumbDragOver}
              onDrop={(e) => onThumbDrop(e, it.id)}
              onDragEnd={onThumbDragEnd}
              className="relative rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900 cursor-move shadow-sm hover:scale-[1.03] active:scale-[0.98] transition-transform"
            >
              {/* Icono de grip */}
              <div className="absolute left-2 top-2 text-white/90 dark:text-white/90">
                <GripVertical className="w-4 h-4 opacity-90" />
              </div>

              {/* Imagen */}
              <img
                src={it.url}
                alt={it.type === "new" ? it.file?.name || "preview" : "img"}
                className="w-full h-24 object-cover"
              />

              {/* Botón eliminar */}
              <button
                type="button"
                onClick={() => removeImage(it.id)}
                className="absolute top-2 right-2 bg-black/40 dark:bg-white/10 text-white dark:text-white p-1 rounded-full hover:bg-red-500"
                aria-label="Eliminar imagen"
              >
                <X className="w-3 h-3" />
              </button>

              {/* Etiqueta de estado */}
              <div className="absolute left-2 bottom-2 bg-black/40 text-white text-xs px-2 py-0.5 rounded">
                {it.type === "existing" ? "Subida" : it.file?.name || "Nuevo"}
              </div>

              {/* Badge de imagen principal */}
              {imageList[0]?.id === it.id && (
                <div className="absolute right-2 bottom-2 flex items-center gap-1 bg-yellow-400 text-black text-xs px-2 py-0.5 rounded">
                  <Star className="w-3 h-3" />
                  <span>Principal</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
