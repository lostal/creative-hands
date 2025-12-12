import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import type { Request } from "express";
import type { StorageEngine } from "multer";

/**
 * Interfaz extendida para archivos con metadatos de Cloudinary
 */
export interface CloudinaryFile extends Omit<Express.Multer.File, 'stream'> {
  path: string;
  filename: string;
  public_id?: string;
  secure_url?: string;
  stream?: Express.Multer.File['stream'];
}

/**
 * Storage engine personalizado para Multer + Cloudinary
 * Compatible con Cloudinary 2.x y Multer 2.x
 */
class CloudinaryStorageEngine implements StorageEngine {
  private folder: string;
  private allowedFormats: string[];
  private transformation: Array<{
    width: number;
    height: number;
    crop: string;
  }>;

  constructor(options: {
    folder: string;
    allowedFormats: string[];
    transformation?: Array<{ width: number; height: number; crop: string }>;
  }) {
    this.folder = options.folder;
    this.allowedFormats = options.allowedFormats;
    this.transformation = options.transformation || [];
  }

  _handleFile(
    _req: Request,
    file: Express.Multer.File,
    callback: (error?: Error | null, info?: Partial<CloudinaryFile>) => void,
  ): void {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: this.folder,
        allowed_formats: this.allowedFormats,
        transformation: this.transformation,
        resource_type: "image",
      },
      (error, result: UploadApiResponse | undefined) => {
        if (error) {
          return callback(error);
        }
        if (!result) {
          return callback(new Error("Error al subir imagen a Cloudinary"));
        }
        callback(null, {
          path: result.secure_url,
          filename: result.public_id,
          public_id: result.public_id,
          secure_url: result.secure_url,
          size: result.bytes,
        });
      },
    );

    // Pipe el stream del archivo directamente a Cloudinary
    file.stream.pipe(uploadStream);
  }

  _removeFile(
    _req: Request,
    file: CloudinaryFile,
    callback: (error: Error | null) => void,
  ): void {
    if (file.public_id) {
      cloudinary.uploader.destroy(file.public_id, (error) => {
        callback(error || null);
      });
    } else {
      callback(null);
    }
  }
}

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configurar almacenamiento de Multer con Cloudinary
const storage = new CloudinaryStorageEngine({
  folder: "creative-hands/products",
  allowedFormats: ["jpg", "jpeg", "png", "webp", "gif"],
  transformation: [{ width: 1000, height: 1000, crop: "limit" }],
});

export { cloudinary, storage };
