import mongoose, { Schema, Document, Types } from "mongoose";
import bcrypt from "bcryptjs";

/**
 * Interfaz base de usuario (sin métodos de Document)
 * Útil para crear usuarios o tipar datos de entrada
 */
export interface IUserBase {
  name: string;
  email: string;
  password?: string;
  role: "user" | "admin";
  avatar?: string;
  isOnline: boolean;
  lastSeen: Date;
  /** Número de intentos de login fallidos */
  loginAttempts: number;
  /** Fecha hasta la cual la cuenta está bloqueada */
  lockUntil?: Date;
}

/**
 * Interfaz del documento de Mongoose
 * Incluye _id tipado correctamente y métodos de instancia
 */
export interface IUser extends IUserBase, Document {
  _id: Types.ObjectId;
  comparePassword(candidatePassword: string): Promise<boolean>;
  /** Verifica si la cuenta está actualmente bloqueada */
  isLocked(): boolean;
  /** Incrementa intentos fallidos y bloquea si excede límite */
  incrementLoginAttempts(): Promise<void>;
  /** Resetea intentos fallidos tras login exitoso */
  resetLoginAttempts(): Promise<void>;
}

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "El email es obligatorio"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Email no válido"],
    },
    password: {
      type: String,
      required: [true, "La contraseña es obligatoria"],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    avatar: {
      type: String,
      default: null,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Encriptar contraseña antes de guardar
userSchema.pre("save", async function (this: IUser) {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password!, salt);
});

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function (
  this: IUser,
  candidatePassword: string,
) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Constantes para bloqueo de cuenta
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME_MS = 15 * 60 * 1000; // 15 minutos

// Método para verificar si la cuenta está bloqueada
userSchema.methods.isLocked = function (this: IUser): boolean {
  return !!(this.lockUntil && this.lockUntil > new Date());
};

// Método para incrementar intentos fallidos
userSchema.methods.incrementLoginAttempts = async function (
  this: IUser,
): Promise<void> {
  // Si el bloqueo ha expirado, reiniciar contador
  if (this.lockUntil && this.lockUntil < new Date()) {
    this.loginAttempts = 1;
    this.lockUntil = undefined;
  } else {
    this.loginAttempts += 1;
    // Bloquear si excede el límite
    if (this.loginAttempts >= MAX_LOGIN_ATTEMPTS && !this.isLocked()) {
      this.lockUntil = new Date(Date.now() + LOCK_TIME_MS);
    }
  }
  await this.save();
};

// Método para resetear intentos fallidos
userSchema.methods.resetLoginAttempts = async function (
  this: IUser,
): Promise<void> {
  if (this.loginAttempts > 0 || this.lockUntil) {
    this.loginAttempts = 0;
    this.lockUntil = undefined;
    await this.save();
  }
};

export default mongoose.model<IUser>("User", userSchema);
