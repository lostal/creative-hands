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
}

/**
 * Interfaz del documento de Mongoose
 * Incluye _id tipado correctamente y métodos de instancia
 */
export interface IUser extends IUserBase, Document {
  _id: Types.ObjectId;
  comparePassword(candidatePassword: string): Promise<boolean>;
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
  },
  {
    timestamps: true,
  },
);

// Encriptar contraseña antes de guardar
userSchema.pre("save", async function (this: IUser, next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password!, salt);
  next();
});

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function (
  this: IUser,
  candidatePassword: string,
) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>("User", userSchema);
