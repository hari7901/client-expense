import axios from "axios";
import { Expense } from "../types/expense";

// Use environment variable with a fallback
const API_URL =
   "https://expense-app-rust.vercel.app/api/expenses";

// Create an axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15000, // 10 seconds timeout
  headers: {
    'Content-Type': "application/json",
    'Accept': "application/json",
  },
});

// Add request interceptor for logging (optional)
axiosInstance.interceptors.request.use(
  (config) => {
    console.log("Full Request Details:", {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      data: config.data,
    });
    return config;
  },
  (error) => {
    console.error("Request Interceptor Error:", error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    console.log("Response Received:", {
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error("Comprehensive Error Details:", {
      message: error.message,
      code: error.code,
      response: error.response,
      request: error.request,
    });
    return Promise.reject(error);
  }
);
export const expenseService = {
  async createExpense(expense: Omit<Expense, "_id">): Promise<Expense> {
    try {
      const response = await axiosInstance.post<Expense>("/", expense);
      return response.data;
    } catch (error: any) {
      console.error("Detailed error in createExpense:", error);

      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.error("Server responded with error:", error.response.data);
          throw new Error(
            error.response.data.message || "Failed to create expense"
          );
        } else if (error.request) {
          console.error("No response received:", error.request);
          throw new Error(
            "No response from server. Please check your network connection."
          );
        } else {
          console.error("Error setting up request:", error.message);
          throw new Error("Error preparing the request");
        }
      }

      throw error;
    }
  },

  async getExpenses(filters?: {
    dateRange?: string;
    categories?: string[];
    paymentModes?: string[];
  }): Promise<Expense[]> {
    try {
      const response = await axiosInstance.get<Expense[]>("/", {
        params: {
          dateRange: filters?.dateRange,
          categories: filters?.categories?.join(","),
          paymentModes: filters?.paymentModes?.join(","),
        },
      });
      return response.data;
    } catch (error) {
      console.error("Detailed error in getExpenses:", error);
      throw error;
    }
  },

  async getExpenseAnalytics(): Promise<any[]> {
    try {
      const response = await axiosInstance.get<any[]>("/analytics");
      return response.data;
    } catch (error) {
      console.error("Detailed error in getExpenseAnalytics:", error);
      throw error;
    }
  },

  async deleteExpense(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`/${id}`);
    } catch (error) {
      console.error("Detailed error in deleteExpense:", error);
      throw error;
    }
  },
};
