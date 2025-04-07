import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const connectDB = async () => {
  try {
    // Log all environment variables
    console.log("ALL ENVIRONMENT VARIABLES:");
    console.log(process.env);

    // Specifically log the MongoDB URI
    console.log("MONGODB_URI FROM ENV:", process.env.MONGODB_URI);

    const mongoURI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/expense-tracker";

    console.log("MONGO URI BEING USED:", mongoURI);

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    // Exit process with failure
    process.exit(1);
  }
};

export default connectDB;
