import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
      min: [0, "Amount must be positive"],
    },
    category: {
      type: String,
      enum: ["Rental", "Groceries", "Entertainment", "Travel", "Others"],
      required: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    paymentMode: {
      type: String,
      enum: ["UPI", "Credit Card", "Net Banking", "Cash"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Expense", ExpenseSchema);
