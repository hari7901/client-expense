import Expense from "../models/Expense.js";
import mongoose from "mongoose";

export const createExpense = async (req, res) => {
  try {
    const { amount, category, notes, date, paymentMode } = req.body;

    const expense = new Expense({
      amount,
      category,
      notes,
      date: date || new Date(),
      paymentMode,
    });

    const savedExpense = await expense.save();

    res.status(201).json(savedExpense);
  } catch (error) {
    console.error("Error creating expense:", error);
    res.status(500).json({
      message: "Error creating expense",
      error: error.message || "Unknown error",
    });
  }
};

export const getExpenses = async (req, res) => {
  try {
    const { dateRange, categories, paymentModes } = req.query;

    const filterConditions = {};

    // Date Range Filter
    if (dateRange) {
      const now = new Date();
      switch (dateRange) {
        case "This Month":
          filterConditions.date = {
            $gte: new Date(now.getFullYear(), now.getMonth(), 1),
            $lte: new Date(now.getFullYear(), now.getMonth() + 1, 0),
          };
          break;
        case "Last 30 Days":
          filterConditions.date = {
            $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
          };
          break;
        case "Last 90 Days":
          filterConditions.date = {
            $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
          };
          break;
      }
    }

    // Category Filter
    if (categories) {
      filterConditions.category = {
        $in: categories.split(","),
      };
    }

    // Payment Mode Filter
    if (paymentModes) {
      filterConditions.paymentMode = {
        $in: paymentModes.split(","),
      };
    }

    const expenses = await Expense.find(filterConditions).sort({ date: -1 });

    res.json(expenses);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).json({
      message: "Error fetching expenses",
      error: error.message || "Unknown error",
    });
  }
};

export const getExpenseAnalytics = async (req, res) => {
  try {
    // Aggregate expenses by month and category
    const monthlyExpenses = await Expense.aggregate([
      {
        $group: {
          _id: {
            month: { $month: "$date" },
            year: { $year: "$date" },
            category: "$category",
          },
          totalAmount: { $sum: "$amount" },
        },
      },
      {
        $project: {
          _id: 0,
          month: "$_id.month",
          year: "$_id.year",
          category: "$_id.category",
          totalAmount: 1,
        },
      },
      {
        $sort: {
          year: -1,
          month: -1,
        },
      },
    ]);

    res.json(monthlyExpenses);
  } catch (error) {
    console.error("Error fetching expense analytics:", error);
    res.status(500).json({
      message: "Error fetching expense analytics",
      error: error.message || "Unknown error",
    });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid expense ID" });
    }

    const deletedExpense = await Expense.findByIdAndDelete(id);

    if (!deletedExpense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json({ message: "Expense deleted successfully", deletedExpense });
  } catch (error) {
    console.error("Error deleting expense:", error);
    res.status(500).json({
      message: "Error deleting expense",
      error: error.message || "Unknown error",
    });
  }
};
