import express from "express";
import {
  createExpense,
  getExpenses,
  getExpenseAnalytics,
  deleteExpense,
} from "../controllers/expenseController.js";

const router = express.Router();

// Expense creation route
router.post("/", createExpense);

// Expense retrieval route with filtering
router.get("/", getExpenses);

// Expense analytics route
router.get("/analytics", getExpenseAnalytics);

// Expense deletion route
router.delete("/:id", deleteExpense);

export default router;
