import mongoose from "mongoose";
import dns from "dns";
import { config } from "@/app/api/utils/env-config";

if (process.env.NODE_ENV !== "production") {
  try {
    dns.setServers(["8.8.8.8", "8.8.4.4"]);
    console.log("Using fallback DNS servers for SRV resolution");
  } catch (err) {
    console.warn("Failed to set DNS servers for SRV resolution:", err);
  }
}

const mongoDbConnection = config.mongoDb;

if (!mongoDbConnection) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside envoirement file",
  );
}

let isConnected = false;

export const connectToDatabase = async () => {
  if (isConnected) {
    return;
  }

  try {
    await mongoose.connect(mongoDbConnection, {
      dbName: config.dbName,
      bufferCommands: false,
    });

    isConnected = true;
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
};
