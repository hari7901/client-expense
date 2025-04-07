"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { expenseService } from "../services/expenseService";
import { AlertCircle, Calendar } from "lucide-react";

const CATEGORY_COLORS: { [key: string]: string } = {
  Rental: "#8884d8",
  Groceries: "#82ca9d",
  Entertainment: "#ffc658",
  Travel: "#ff7300",
  Others: "#413ea0",
};

// Define interface for analytics data
interface AnalyticsData {
  year: number;
  month: number;
  category: string;
  totalAmount: number;
}

// Define interface for chart data
interface ChartDataItem {
  month: string;
  year: number;
  monthNum: number;
  label: string;
  [category: string]: string | number;
}

const ExpenseAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<
    "all" | "last6Months" | "last3Months"
  >("last6Months");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        const fetchedAnalytics = await expenseService.getExpenseAnalytics();
        setAnalytics(fetchedAnalytics);
      } catch (error) {
        console.error("Failed to fetch analytics", error);
        setMessage("Failed to load analytics");
        setTimeout(() => setMessage(null), 3000);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Group analytics by month and year
  const groupedAnalytics = analytics.reduce(
    (acc: { [key: string]: ChartDataItem }, item) => {
      const key = `${item.year}-${item.month}`;
      if (!acc[key]) {
        acc[key] = {
          month: `${item.year}-${item.month.toString().padStart(2, "0")}`,
          year: item.year,
          monthNum: item.month,
          label: new Date(item.year, item.month - 1).toLocaleDateString(
            undefined,
            { month: "short", year: "numeric" }
          ),
        };
      }
      acc[key][item.category] =
        ((acc[key][item.category] as number) || 0) + item.totalAmount;
      return acc;
    },
    {}
  );

  // Sort and filter analytics data
  const sortedChartData: ChartDataItem[] = Object.values(groupedAnalytics).sort(
    (a, b) => new Date(a.month).getTime() - new Date(b.month).getTime()
  );

  // Filter data based on selected timeframe
  let filteredChartData: ChartDataItem[] = [];
  switch (selectedTimeframe) {
    case "last3Months":
      filteredChartData = sortedChartData.slice(-3);
      break;
    case "last6Months":
      filteredChartData = sortedChartData.slice(-6);
      break;
    default:
      filteredChartData = sortedChartData;
  }

  // Calculate total expenses
  const totalExpenses = filteredChartData.reduce((total: number, month) => {
    const monthTotal = Object.keys(CATEGORY_COLORS).reduce(
      (sum: number, category) => {
        return sum + ((month[category] as number) || 0);
      },
      0
    );
    return total + monthTotal;
  }, 0);

  // Calculate category-wise total expenses
  const categoryTotals = Object.keys(CATEGORY_COLORS)
    .map((category) => {
      const total = filteredChartData.reduce((sum: number, month) => {
        return sum + ((month[category] as number) || 0);
      }, 0);
      return { category, total, color: CATEGORY_COLORS[category] };
    })
    .sort((a, b) => b.total - a.total);

  // Prepare data for pie chart
  const pieChartData = categoryTotals.map(({ category, total }) => ({
    name: category,
    value: total,
  }));

  // Custom tooltip for bar chart
  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 shadow-lg">
          <p className="text-gray-300 font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div
              key={`item-${index}`}
              className="flex items-center space-x-2 text-sm"
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.fill }}
              ></div>
              <span className="text-gray-300">{entry.name}:</span>
              <span className="text-white font-medium">
                ₹{entry.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for pie chart
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 shadow-lg">
          <div className="flex items-center space-x-2 mb-1">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: payload[0].color }}
            ></div>
            <span className="text-gray-300 font-medium">{data.name}</span>
          </div>
          <div className="text-white font-medium text-sm">
            ₹{data.value.toLocaleString()}
          </div>
          <div className="text-gray-400 text-xs">
            {((data.value / totalExpenses) * 100).toFixed(1)}% of total
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="container mx-auto">
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
          <AlertCircle className="w-5 h-5" />
          <span>{message}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Expense Analytics</h2>
          <p className="text-sm text-gray-400">
            Visualize your spending patterns
          </p>
        </div>

        <div>
          {/* Timeframe selector */}
          <select
            value={selectedTimeframe}
            onChange={(e) =>
              setSelectedTimeframe(
                e.target.value as "all" | "last6Months" | "last3Months"
              )
            }
            className="p-2 bg-slate-700/70 text-white border border-slate-600/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="last3Months">Last 3 Months</option>
            <option value="last6Months">Last 6 Months</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      ) : filteredChartData.length === 0 ? (
        <div className="bg-slate-700/40 border border-slate-600/30 rounded-xl p-8 text-center text-gray-400">
          <div className="flex flex-col items-center justify-center">
            <AlertCircle className="w-12 h-12 mb-4 text-gray-500" />
            <h3 className="text-xl font-medium text-gray-300 mb-2">
              No data available
            </h3>
            <p>Start adding some expenses to see your analytics.</p>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-slate-700/50">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-emerald-400" />
              Monthly Expenses
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={filteredChartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#374151"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "white" }}
                  axisLine={{ stroke: "#4B5563" }}
                  tickLine={{ stroke: "#4B5563" }}
                />
                <YAxis
                  tick={{ fill: "white" }}
                  axisLine={{ stroke: "#4B5563" }}
                  tickLine={{ stroke: "#4B5563" }}
                  tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip content={<CustomBarTooltip />} />
                <Legend
                  wrapperStyle={{ color: "white", paddingTop: "10px" }}
                  formatter={(value) => (
                    <span className="text-gray-300">{value}</span>
                  )}
                />
                {Object.keys(CATEGORY_COLORS).map((category) => (
                  <Bar
                    key={category}
                    dataKey={category}
                    stackId="a"
                    fill={CATEGORY_COLORS[category]}
                    radius={[4, 4, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Category Breakdown */}
          <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-slate-700/50">
            <h3 className="text-lg font-semibold text-white mb-4">
              Category Breakdown
            </h3>

            <div className="flex flex-col md:flex-row items-center">
              <div className="w-full md:w-1/2 h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CATEGORY_COLORS[entry.name]}
                          stroke="rgba(0,0,0,0.1)"
                          strokeWidth={1}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="w-full md:w-1/2 space-y-3">
                <div className="flex justify-between font-bold text-white pb-2 border-b border-slate-700">
                  <span>Total</span>
                  <span>₹{totalExpenses.toLocaleString()}</span>
                </div>

                {categoryTotals.map(({ category, total, color }) => (
                  <div
                    key={category}
                    className="flex justify-between items-center"
                  >
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 mr-2 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-gray-300">{category}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-medium">
                        ₹{total.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400">
                        {((total / totalExpenses) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      {!isLoading && filteredChartData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {/* Average Monthly Spend */}
          <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
            <h4 className="text-gray-400 text-sm mb-1">Average Monthly</h4>
            <p className="text-2xl font-bold text-white">
              ₹
              {(totalExpenses / filteredChartData.length).toLocaleString(
                undefined,
                { maximumFractionDigits: 0 }
              )}
            </p>
          </div>

          {/* Highest Category */}
          <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
            <h4 className="text-gray-400 text-sm mb-1">Highest Category</h4>
            <div className="flex items-center">
              <div
                className="w-3 h-3 mr-2 rounded-full"
                style={{ backgroundColor: categoryTotals[0]?.color || "#ccc" }}
              />
              <p className="text-2xl font-bold text-white">
                {categoryTotals[0]?.category || "None"}
              </p>
            </div>
          </div>

          {/* Total Expenses */}
          <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
            <h4 className="text-gray-400 text-sm mb-1">Total Expenses</h4>
            <p className="text-2xl font-bold text-white">
              ₹{totalExpenses.toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseAnalytics;
