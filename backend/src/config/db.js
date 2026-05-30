import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully.");
  } catch (error) {
    console.error("Could not connect to the database.", error.message);
    throw new ApiError(
      `Could not connect to the database. ${error.message}`,
      500,
    );
  }
};
