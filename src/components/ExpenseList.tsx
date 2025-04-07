"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  Calendar,
  Tag,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Filter,
  Search,
} from "lucide-react";
import { Expense } from "../types/expense";
import { expenseService } from "../services/expenseService";

const DATE_RANGES = ["This Month", "Last 30 Days", "Last 90 Days", "All time"];
const CATEGORIES: Expense["category"][] = [
  "Rental",
  "Groceries",
  "Entertainment",
  "Travel",
  "Others",
];
const PAYMENT_MODES: Expense["paymentMode"][] = [
  "UPI",
  "Credit Card",
  "Net Banking",
  "Cash",
];

// Category color mapping
const CATEGORY_COLORS: Record<string, string> = {
  Rental: "bg-blue-500",
  Groceries: "bg-green-500",
  Entertainment: "bg-purple-500",
  Travel: "bg-amber-500",
  Others: "bg-gray-500",
};

const ExpensesList: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedDateRange, setSelectedDateRange] = useState<
    string | undefined
  >(undefined);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPaymentModes, setSelectedPaymentModes] = useState<string[]>(
    []
  );
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const fetchExpenses = async () => {
    setIsLoading(true);
    try {
      const fetchedExpenses = await expenseService.getExpenses({
        dateRange: selectedDateRange,
        categories: selectedCategories,
        paymentModes: selectedPaymentModes,
      });

      // Filter by search term if provided
      const filteredExpenses = searchTerm
        ? fetchedExpenses.filter(
            (expense) =>
              expense.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
              expense.category
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
              expense.paymentMode
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
          )
        : fetchedExpenses;

      setExpenses(filteredExpenses);
    } catch (error) {
      console.error("Failed to fetch expenses", error);
      setMessage("Failed to load expenses");
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [selectedDateRange, selectedCategories, selectedPaymentModes]);

  // Implement search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchExpenses();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const togglePaymentMode = (mode: string) => {
    setSelectedPaymentModes((prev) =>
      prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode]
    );
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await expenseService.deleteExpense(id);
      setExpenses((prev) => prev.filter((expense) => expense._id !== id));
      setMessage("Expense deleted successfully");
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Failed to delete expense", error);
      setMessage("Failed to delete expense");
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // Calculate total amount for filtered expenses
  const totalAmount = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="container mx-auto"
    >
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
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
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-6 space-y-4">
        {/* Search and filter controls */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-700/70 text-white border border-slate-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
            />
          </div>

          <motion.button
            onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center space-x-2 px-4 py-3 rounded-xl ${
              isFilterMenuOpen ||
              selectedCategories.length > 0 ||
              selectedPaymentModes.length > 0 ||
              selectedDateRange
                ? "bg-emerald-500 text-white"
                : "bg-slate-700 text-gray-300"
            }`}
          >
            <Filter className="w-5 h-5" />
            <span>Filters</span>
            {(selectedCategories.length > 0 ||
              selectedPaymentModes.length > 0 ||
              selectedDateRange) && (
              <span className="inline-flex items-center justify-center bg-white text-emerald-500 text-xs font-bold rounded-full h-5 w-5 ml-1">
                {selectedCategories.length +
                  selectedPaymentModes.length +
                  (selectedDateRange ? 1 : 0)}
              </span>
            )}
          </motion.button>
        </div>

        {/* Filter panels */}
        <AnimatePresence>
          {isFilterMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-slate-700/50 backdrop-blur-sm rounded-xl p-4 border border-slate-600/30 mb-4 overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <div className="flex items-center space-x-2 mb-3">
                    <Calendar className="w-4 h-4 text-gray-300" />
                    <label className="text-gray-300 text-sm font-semibold">
                      Date Range
                    </label>
                  </div>
                  <select
                    value={selectedDateRange || ""}
                    onChange={(e) =>
                      setSelectedDateRange(e.target.value || undefined)
                    }
                    className="w-full p-2 bg-slate-800 text-white border border-slate-600/50 rounded-lg"
                  >
                    <option value="">All Dates</option>
                    {DATE_RANGES.map((range) => (
                      <option
                        key={range}
                        value={range}
                        className="bg-slate-800"
                      >
                        {range}
                      </option>
                    ))}
                  </select>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <div className="flex items-center space-x-2 mb-3">
                    <Tag className="w-4 h-4 text-gray-300" />
                    <label className="text-gray-300 text-sm font-semibold">
                      Categories
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((category) => (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        key={category}
                        onClick={() => toggleCategory(category)}
                        className={`px-3 py-1 rounded-lg transition-colors flex items-center space-x-1 ${
                          selectedCategories.includes(category)
                            ? "bg-emerald-500 text-white"
                            : "bg-slate-800 text-gray-300 border border-slate-700"
                        }`}
                      >
                        <span
                          className={`inline-block w-2 h-2 rounded-full ${CATEGORY_COLORS[category]}`}
                        ></span>
                        <span>{category}</span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  <div className="flex items-center space-x-2 mb-3">
                    <CreditCard className="w-4 h-4 text-gray-300" />
                    <label className="text-gray-300 text-sm font-semibold">
                      Payment Modes
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {PAYMENT_MODES.map((mode) => (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        key={mode}
                        onClick={() => togglePaymentMode(mode)}
                        className={`px-3 py-1 rounded-lg transition-colors ${
                          selectedPaymentModes.includes(mode)
                            ? "bg-emerald-500 text-white"
                            : "bg-slate-800 text-gray-300 border border-slate-700"
                        }`}
                      >
                        {mode}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Total summary */}
        {expenses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 mb-6 text-emerald-300"
          >
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Expenses</span>
              <span className="text-xl font-bold">
                ₹{totalAmount.toLocaleString()}
              </span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      ) : expenses.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-slate-700/40 border border-slate-600/30 rounded-xl p-8 text-center text-gray-400"
        >
          <div className="flex flex-col items-center justify-center">
            <AlertCircle className="w-12 h-12 mb-4 text-gray-500" />
            <h3 className="text-xl font-medium text-gray-300 mb-2">
              No expenses found
            </h3>
            <p>Try adjusting your filters or add new expenses.</p>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden shadow-xl"
        >
          <div className="overflow-x-auto min-w-full">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-slate-700/70 text-gray-300 border-b border-slate-600/50">
                  {[
                    "Date",
                    "Amount",
                    "Category",
                    "Payment Mode",
                    "Notes",
                    "Actions",
                  ].map((header) => (
                    <th key={header} className="p-4 text-left font-medium">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                <AnimatePresence>
                  {expenses.map((expense) => (
                    <motion.tr
                      layout
                      key={expense._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="p-4 text-gray-300">
                        {new Date(expense.date).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="p-4 font-medium text-emerald-300">
                        ₹{expense.amount.toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span className="flex items-center space-x-2">
                          <span
                            className={`inline-block w-2 h-2 rounded-full ${
                              CATEGORY_COLORS[expense.category]
                            }`}
                          ></span>
                          <span className="text-gray-300">
                            {expense.category}
                          </span>
                        </span>
                      </td>
                      <td className="p-4 text-gray-300">
                        {expense.paymentMode}
                      </td>
                      <td className="p-4 text-gray-400 max-w-xs truncate">
                        {expense.notes || "-"}
                      </td>
                      <td className="p-4">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteExpense(expense._id!)}
                          className="text-red-400 hover:text-red-300 transition-colors p-1 rounded-full hover:bg-red-400/10"
                        >
                          <Trash2 className="w-5 h-5" />
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ExpensesList;
