import mongoose from "mongoose";
import logger from "../utils/logger";

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI as string);
    logger.db(`MongoDB conectado: ${conn.connection.host}`);
  } catch (error: any) {
    logger.error(`❌ Error al conectar MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
