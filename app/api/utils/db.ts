import mongoose from "mongoose";
import { Resolver } from "dns/promises";
import { config } from "@/app/api/utils/env-config";

const mongoDbConnection = config.mongoDb;

if (!mongoDbConnection) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside environment file",
  );
}

async function resolveMongoSrv(srvUri: string): Promise<string> {
  if (!srvUri.startsWith("mongodb+srv://")) {
    return srvUri;
  }

  try {
    const withoutScheme = srvUri.replace("mongodb+srv://", "");
    const atIndex = withoutScheme.lastIndexOf("@");
    const credentials = withoutScheme.substring(0, atIndex);
    const rest = withoutScheme.substring(atIndex + 1);
    const slashIndex = rest.indexOf("/");
    const hostname = slashIndex !== -1 ? rest.substring(0, slashIndex) : rest;
    const pathAndQuery = slashIndex !== -1 ? rest.substring(slashIndex) : "/";

    const resolver = new Resolver();
    resolver.setServers(["8.8.8.8", "8.8.4.4"]);

    const srvRecords = await resolver.resolveSrv(
      `_mongodb._tcp.${hostname}`,
    );

    if (!srvRecords || srvRecords.length === 0) {
      throw new Error("No SRV records found");
    }

    // Build the direct hosts list
    const hosts = srvRecords
      .map((r) => `${r.name}:${r.port}`)
      .join(",");

    // Try to get TXT record for extra options (authSource, replicaSet, etc.)
    let txtOptions = "";
    try {
      const txtRecords = await resolver.resolveTxt(hostname);
      if (txtRecords && txtRecords.length > 0) {
        txtOptions = txtRecords[0].join("");
      }
    } catch {
      // TXT records are optional
    }

    // Parse existing query params from original URI
    const qIndex = pathAndQuery.indexOf("?");
    const path = qIndex !== -1 ? pathAndQuery.substring(0, qIndex) : pathAndQuery;
    const existingParams = qIndex !== -1 ? pathAndQuery.substring(qIndex + 1) : "";

    // Merge TXT options with existing params
    const allParams = [txtOptions, existingParams, "tls=true"]
      .filter(Boolean)
      .join("&");

    const directUri = `mongodb://${credentials}@${hosts}${path}?${allParams}`;
    console.log("Resolved SRV → direct connection to", hosts);
    return directUri;
  } catch (err) {
    console.warn("SRV pre-resolution failed, using original URI:", err);
    return srvUri;
  }
}

let isConnected = false;

export const connectToDatabase = async () => {
  if (isConnected) {
    return;
  }

  try {
    const uri = await resolveMongoSrv(mongoDbConnection);

    await mongoose.connect(uri, {
      dbName: config.dbName,
      bufferCommands: false,
      family: 4, // Force IPv4
    });

    isConnected = true;
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
};
