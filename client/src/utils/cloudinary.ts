/**
 * Utilidades para optimización de imágenes de Cloudinary
 * Aplica transformaciones automáticas para mejor rendimiento
 */

/**
 * Opciones de transformación de Cloudinary
 */
interface CloudinaryTransformOptions {
    width?: number;
    height?: number;
    quality?: "auto" | number;
    format?: "auto" | "webp" | "avif" | "jpg" | "png";
    crop?: "fill" | "fit" | "scale" | "thumb";
}

/**
 * Optimiza una URL de Cloudinary añadiendo transformaciones
 * @param url - URL original de la imagen
 * @param options - Opciones de transformación
 * @returns URL optimizada o la original si no es de Cloudinary
 */
export const optimizeCloudinaryUrl = (
    url: string,
    options: CloudinaryTransformOptions = {}
): string => {
    // Si no es URL de Cloudinary, devolver sin cambios
    if (!url || !url.includes("cloudinary.com")) {
        return url;
    }

    const {
        width,
        height,
        quality = "auto",
        format = "auto",
        crop = "fill",
    } = options;

    // Construir string de transformaciones
    const transforms: string[] = [];

    if (width) transforms.push(`w_${width}`);
    if (height) transforms.push(`h_${height}`);
    if (width || height) transforms.push(`c_${crop}`);

    // Siempre aplicar optimizaciones automáticas
    transforms.push(`f_${format}`);
    transforms.push(`q_${quality}`);

    if (transforms.length === 0) {
        return url;
    }

    const transformString = transforms.join(",");

    // Insertar transformaciones después de /upload/
    return url.replace("/upload/", `/upload/${transformString}/`);
};

/**
 * Presets de tamaño comunes para reutilizar
 */
export const imagePresets = {
    thumbnail: { width: 150, height: 150, crop: "thumb" as const },
    card: { width: 400, height: 400, crop: "fill" as const },
    productDetail: { width: 800, crop: "fit" as const },
    fullWidth: { width: 1200, crop: "scale" as const },
};

/**
 * Obtiene una URL optimizada para thumbnail
 */
export const getThumbnailUrl = (url: string): string =>
    optimizeCloudinaryUrl(url, imagePresets.thumbnail);

/**
 * Obtiene una URL optimizada para cards de producto
 */
export const getCardImageUrl = (url: string): string =>
    optimizeCloudinaryUrl(url, imagePresets.card);

/**
 * Obtiene una URL optimizada para detalle de producto
 */
export const getProductDetailUrl = (url: string): string =>
    optimizeCloudinaryUrl(url, imagePresets.productDetail);
