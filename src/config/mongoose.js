import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const baseUrl = process.env.MONGODB_URL;

export async function connectToMongoDBfromMongoose() {
  try {
    await mongoose.connect(baseUrl); // No need for options
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error.message);
    throw new Error("Database connection failed");
  }
}
