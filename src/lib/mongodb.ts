import mongoose, { Connection } from "mongoose";
import process from "process";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;


console.log(MONGO_URI);
if (!MONGO_URI) {
    throw new Error("❌ Please define the MONGO_URI environment variable in your .env or .env.local file.");
}

// Global cache to prevent multiple connections in development mode
const globalWithMongoose = global as typeof global & { mongoose?: { conn: Connection | null; promise: Promise<Connection> | null } };

if (!globalWithMongoose.mongoose) {
    globalWithMongoose.mongoose = { conn: null, promise: null };
}

const cached = globalWithMongoose.mongoose;

/**
 * Connect to MongoDB using Mongoose
 * @returns {Promise<Connection>} - Established database connection
 */
export const dbConnect = async (): Promise<Connection> => {
    if (cached.conn) return cached.conn; // Return existing connection if available

    if (!cached.promise) {
        console.log("⏳ Connecting to MongoDB...");
        cached.promise = mongoose.connect(MONGO_URI, {
            dbName: "soulveil",
        }).then((mongoose) => {
            console.log("✅ MongoDB Connected Successfully!");
            return mongoose.connection;
        }).catch((error) => {
            console.error("❌ MongoDB Connection Error:", error);
            throw new Error("Failed to connect to MongoDB");
        });
    }

    cached.conn = await cached.promise;
    return cached.conn;
};

