"use client";

import React, { useState, ChangeEvent } from "react";
import { Expense } from "../types/expense";
import { expenseService } from "../services/expenseService";
import {
  PlusCircle,
  CheckCircle2,
  XCircle,
  Banknote,
  Receipt,
  Calendar,
  CreditCard,
  FileText,
  AlertCircle,
} from "lucide-react";

const CATEGORIES: Expense["category"][] = [
  "Rental",
  "Groceries",
  "Entertainment",
  "Education",
  "Travel",
  "Others",
];
const PAYMENT_MODES: Expense["paymentMode"][] = [
  "UPI",
  "Credit Card",
  "Net Banking",
  "Cash",
];

// Constants for validation
const MAX_AMOUNT = 100000; // Maximum amount limit ₹100,000

// Create a modified expense type to handle string amount
interface ExpenseFormData extends Omit<Expense, "_id" | "amount"> {
  amount: string | number;
}

// Define field types to handle appropriate onChange events
type FieldConfig = {
  label: string;
  type: string;
  value: string | number;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  maxLength?: number;
  min?: number;
  max?: string | number;
  step?: string;
  icon: React.FC<{ className?: string }>;
  error?: string;
};

// Define validation errors interface
interface ValidationErrors {
  amount?: string;
  category?: string;
  notes?: string;
  date?: string;
  paymentMode?: string;
}

const ExpenseForm: React.FC = () => {
  const [expense, setExpense] = useState<ExpenseFormData>({
    amount: "",
    category: "Others",
    notes: "",
    date: new Date().toISOString().split("T")[0],
    paymentMode: "UPI",
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Validate all fields
  const validateField = (name: string, value: any): string => {
    switch (name) {
      case "amount":
        if (value === "" || value === null) return "Amount is required";
        if (Number(value) <= 0) return "Amount must be greater than 0";
        if (Number(value) > MAX_AMOUNT)
          return `Amount cannot exceed ₹${MAX_AMOUNT.toLocaleString()}`;
        return "";
      case "category":
        if (!CATEGORIES.includes(value))
          return "Please select a valid category";
        return "";
      case "date":
        if (!value) return "Date is required";
        const selectedDate = new Date(value);
        const today = new Date();
        // Set today to end of day for comparison
        today.setHours(23, 59, 59, 999);
        if (selectedDate > today) return "Date cannot be in the future";
        return "";
      case "paymentMode":
        if (!PAYMENT_MODES.includes(value))
          return "Please select a valid payment mode";
        return "";
      case "notes":
        if (value.length > 500) return "Notes cannot exceed 500 characters";
        return "";
      default:
        return "";
    }
  };

  // Validate all fields on form submission
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    Object.entries(expense).forEach(([key, value]) => {
      const error = validateField(key, value);
      if (error) {
        newErrors[key as keyof ValidationErrors] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  // Handle field blur for validation
  const handleBlur = (fieldName: string) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    const error = validateField(
      fieldName,
      expense[fieldName as keyof ExpenseFormData]
    );
    setErrors((prev) => ({ ...prev, [fieldName]: error }));
  };

  // Handle amount input change with limit enforcement
  const handleAmountChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (e.target instanceof HTMLInputElement) {
      const value = e.target.value;

      // Only allow valid input: empty string or positive numbers
      if (value === "" || /^\d*\.?\d*$/.test(value)) {
        // If value is more than MAX_AMOUNT, cap it
        if (value !== "" && Number(value) > MAX_AMOUNT) {
          setExpense((prev) => ({ ...prev, amount: MAX_AMOUNT.toString() }));
          setErrors((prev) => ({
            ...prev,
            amount: `Amount cannot exceed ₹${MAX_AMOUNT.toLocaleString()}`,
          }));
        } else {
          setExpense((prev) => ({ ...prev, amount: value }));

          // Clear error if input becomes valid
          if (value && Number(value) > 0 && Number(value) <= MAX_AMOUNT) {
            setErrors((prev) => ({ ...prev, amount: "" }));
          }
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Set all fields as touched
    const allTouched = Object.keys(expense).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setTouched(allTouched);

    if (!validateForm()) {
      setMessage("Please fix the errors in the form");
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert amount to number before submitting
      const expenseToSubmit = {
        ...expense,
        amount: Number(expense.amount),
      };

      await expenseService.createExpense(expenseToSubmit as Expense);

      // Reset form
      setExpense({
        amount: "",
        category: "Others",
        notes: "",
        date: new Date().toISOString().split("T")[0],
        paymentMode: "UPI",
      });
      setTouched({});
      setErrors({});

      // Show success message
      setMessage("Expense added successfully!");

      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Failed to add expense", error);
      setMessage("Failed to add expense. Please try again.");
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create field configurations
  const fields: FieldConfig[] = [
    {
      label: "Amount (₹)",
      type: "text", // Changed from "number" to "text" to avoid browser validation issues
      value: expense.amount,
      onChange: handleAmountChange,
      placeholder: "Enter amount (max ₹100,000)",
      required: true,
      icon: Banknote,
      error: touched.amount ? errors.amount : undefined,
    },
    {
      label: "Category",
      type: "select",
      value: expense.category,
      onChange: (e: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        if (e.target instanceof HTMLSelectElement) {
          setExpense((prev) => ({
            ...prev,
            category: e.target.value as Expense["category"],
          }));
          setErrors((prev) => ({ ...prev, category: "" }));
        }
      },
      options: CATEGORIES,
      icon: Receipt,
      error: touched.category ? errors.category : undefined,
    },
    {
      label: "Notes",
      type: "text",
      value: expense.notes,
      onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (e.target instanceof HTMLInputElement) {
          setExpense((prev) => ({ ...prev, notes: e.target.value }));
          if (e.target.value.length <= 500) {
            setErrors((prev) => ({ ...prev, notes: "" }));
          }
        }
      },
      placeholder: "Optional notes",
      maxLength: 500,
      icon: FileText,
      error: touched.notes ? errors.notes : undefined,
    },
    {
      label: "Date",
      type: "date",
      value: expense.date,
      onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (e.target instanceof HTMLInputElement) {
          setExpense((prev) => ({ ...prev, date: e.target.value }));
          setErrors((prev) => ({ ...prev, date: "" }));
        }
      },
      required: true,
      max: new Date().toISOString().split("T")[0], // Type will be handled in the input element
      icon: Calendar,
      error: touched.date ? errors.date : undefined,
    },
    {
      label: "Payment Mode",
      type: "select",
      value: expense.paymentMode,
      onChange: (e: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        if (e.target instanceof HTMLSelectElement) {
          setExpense((prev) => ({
            ...prev,
            paymentMode: e.target.value as Expense["paymentMode"],
          }));
          setErrors((prev) => ({ ...prev, paymentMode: "" }));
        }
      },
      options: PAYMENT_MODES,
      icon: CreditCard,
      error: touched.paymentMode ? errors.paymentMode : undefined,
    },
  ];

  return (
    <div className="max-w-md mx-auto">
      {message && (
        <div
          className={`
            ${
              message.includes("successfully")
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-red-500/20 text-red-400 border border-red-500/30"
            } 
            p-4 rounded-lg mb-6 text-center flex items-center justify-center space-x-2
          `}
        >
          {message.includes("successfully") ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <XCircle className="w-5 h-5 text-red-400" />
          )}
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {fields.map((field, index) => (
          <div key={field.label} className="transition-all duration-200">
            <label className="block text-gray-300 text-sm font-medium mb-2">
              {field.label}
              {field.required && <span className="text-red-400 ml-1">*</span>}
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <field.icon className="w-5 h-5" />
              </div>

              {field.type === "select" ? (
                <select
                  value={field.value as string}
                  onChange={
                    field.onChange as (
                      e: ChangeEvent<HTMLSelectElement>
                    ) => void
                  }
                  onBlur={() =>
                    handleBlur(field.label.toLowerCase().split(" ")[0])
                  }
                  className={`w-full pl-10 pr-4 py-3 bg-slate-700/70 text-white border ${
                    field.error
                      ? "border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50"
                      : "border-slate-600/50 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                  } rounded-xl focus:outline-none focus:ring-2 transition-all duration-200`}
                >
                  {(field.options as string[]).map((option) => (
                    <option
                      key={option}
                      value={option}
                      className="bg-slate-800"
                    >
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  inputMode={
                    field.type === "text" && field.label.includes("Amount")
                      ? "decimal"
                      : undefined
                  }
                  value={field.value}
                  onChange={
                    field.onChange as (e: ChangeEvent<HTMLInputElement>) => void
                  }
                  onBlur={() =>
                    handleBlur(field.label.toLowerCase().split(" ")[0])
                  }
                  required={field.required}
                  maxLength={field.maxLength}
                  step={field.step}
                  placeholder={field.placeholder}
                  className={`w-full pl-10 pr-4 py-3 bg-slate-700/70 text-white border ${
                    field.error
                      ? "border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50"
                      : "border-slate-600/50 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                  } rounded-xl focus:outline-none focus:ring-2 transition-all duration-200`}
                />
              )}

              {field.error && (
                <div className="flex items-center mt-1 text-red-400 text-xs">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  <span>{field.error}</span>
                </div>
              )}
            </div>
          </div>
        ))}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 rounded-xl flex items-center justify-center space-x-2 transition-all duration-300
            ${
              isSubmitting
                ? "bg-slate-600 cursor-not-allowed"
                : "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:shadow-lg hover:shadow-emerald-500/20"
            }
            text-white font-medium`}
        >
          <PlusCircle className="w-5 h-5" />
          <span>{isSubmitting ? "Adding..." : "Add Expense"}</span>
        </button>
      </form>
    </div>
  );
};

export default ExpenseForm;
