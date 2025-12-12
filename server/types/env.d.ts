/**
 * Tipado de variables de entorno
 * Proporciona autocompletado y validación en tiempo de compilación
 */

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // === REQUERIDAS ===
      /** Secreto para firmar tokens JWT - debe ser una cadena larga y aleatoria */
      JWT_SECRET: string;
      /** URI de conexión a MongoDB */
      MONGODB_URI: string;

      // === OPCIONALES ===
      /** Entorno de ejecución */
      NODE_ENV?: "development" | "production" | "test";
      /** Puerto del servidor (default: 5000) */
      PORT?: string;
      /** Tiempo de expiración del JWT (default: "7d") */
      JWT_EXPIRE?: string;
      /** URL del cliente en producción */
      CLIENT_URL?: string;

      // === ADMIN POR DEFECTO ===
      /** Si es "true", crea un admin por defecto al iniciar */
      CREATE_DEFAULT_ADMIN?: string;
      /** Email del admin por defecto */
      ADMIN_EMAIL?: string;
      /** Contraseña del admin por defecto (min 8 caracteres) */
      ADMIN_PASSWORD?: string;
      /** Nombre del admin por defecto */
      ADMIN_NAME?: string;

      // === CLOUDINARY (Requeridas - se validan en validateEnvironment) ===
      /** Nombre del cloud de Cloudinary */
      CLOUDINARY_CLOUD_NAME: string;
      /** API Key de Cloudinary */
      CLOUDINARY_API_KEY: string;
      /** API Secret de Cloudinary */
      CLOUDINARY_API_SECRET: string;
    }
  }
}

// Necesario para que TypeScript lo trate como un módulo
export { };
