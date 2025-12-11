import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

/**
 * Parámetros extendidos para CloudinaryStorage
 * Los tipos de multer-storage-cloudinary no incluyen todas las opciones válidas
 */
interface CloudinaryParams {
  folder: string;
  allowed_formats: string[];
  transformation: Array<{ width: number; height: number; crop: string }>;
}

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configurar almacenamiento de Multer con Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "creative-hands/products",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
    transformation: [{ width: 1000, height: 1000, crop: "limit" }],
  } as CloudinaryParams,
});

export { cloudinary, storage };
