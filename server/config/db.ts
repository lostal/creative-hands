import mongoose from "mongoose";
import logger from "../utils/logger";
import { getErrorMessage } from "../utils/errors";

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI as string);
    logger.db(`MongoDB conectado: ${conn.connection.host}`);
  } catch (error: unknown) {
    logger.error(`❌ Error al conectar MongoDB: ${getErrorMessage(error)}`);
    process.exit(1);
  }
};

export default connectDB;
