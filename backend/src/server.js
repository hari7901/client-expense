import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import expenseRoutes from "./routes/expenseRoutes.js";

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:3000", // React development server
      "http://127.0.0.1:3000", // Alternative localhost
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

app.use((req, res, next) => {
  console.log(`Received ${req.method} request to ${req.path}`);
  next();
});
// Connect to MongoDB
connectDB();

// Routes
app.use("/api/expenses", expenseRoutes);

// Root route for health check
app.get("/", (req, res) => {
  res.json({
    message: "Expense Tracker Backend is running",
    status: "healthy",
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: err.message,
  });
});

// Start server
const PORT = process.env.PORT || 8000;
const startServer = () => {
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  // Graceful shutdown
  process.on("SIGTERM", () => {
    console.log("SIGTERM received. Shutting down gracefully");
    server.close(() => {
      console.log("Process terminated");
      process.exit(0);
    });
  });
};

startServer();

export default app;
