"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Home,
  List,
  BarChart2,
  PlusCircle,
  Github,
  Linkedin,
  CircleDollarSign,
} from "lucide-react";

import ExpenseForm from "./components/ExpenseForm";
import ExpensesList from "./components/ExpenseList";
import ExpenseAnalytics from "./components/ExpenseAnalytics";

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"add" | "list" | "analytics">(
    "add"
  );

  const renderActiveContent = () => {
    switch (activeTab) {
      case "add":
        return <ExpenseForm />;
      case "list":
        return <ExpensesList />;
      case "analytics":
        return <ExpenseAnalytics />;
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white flex flex-col overflow-hidden">
      {/* Background with simplified gradients */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent"></div>

        {/* Static blurs instead of animated */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Header with simplified animation */}
      <header className="relative z-10 container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-11 h-11 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <CircleDollarSign className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -inset-1 bg-emerald-500/20 rounded-full blur-sm -z-10"></div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Expense Tracker</h1>
            <p className="text-xs text-emerald-300 font-light">
              Manage your finances easily
            </p>
          </div>
        </div>

        {/* Social Links with simpler hover effects */}
        <div className="flex items-center space-x-4">
          {[
            {
              icon: Github,
              href: "https://github.com/hari7901",
              label: "GitHub",
            },
            {
              icon: Linkedin,
              href: "https://linkedin.com/in/yourusername",
              label: "LinkedIn",
            },
          ].map(({ icon: Icon, href, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors relative group"
              aria-label={label}
            >
              <Icon className="w-5 h-5" />
              <span className="absolute left-1/2 -translate-x-1/2 -bottom-6 px-2 py-1 bg-slate-800 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                {label}
              </span>
            </a>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 relative z-10 py-6">
        {/* Navigation with simplified animation */}
        <div className="mb-8 flex justify-center space-x-4">
          {[
            { tab: "add", icon: PlusCircle, label: "Add Expense" },
            { tab: "list", icon: List, label: "Expenses List" },
            { tab: "analytics", icon: BarChart2, label: "Analytics" },
          ].map(({ tab, icon: Icon, label }) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as "add" | "list" | "analytics")}
              className={`
                px-6 py-3 rounded-xl transition-all duration-300 
                flex items-center space-x-2
                ${
                  activeTab === tab
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                    : "bg-slate-700/50 text-gray-300 hover:bg-slate-700 backdrop-blur-sm border border-slate-600/30"
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="hidden md:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Content Area with simplified animation */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-slate-800/80 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden border border-slate-700/50"
        >
          <div className="p-6">{renderActiveContent()}</div>
        </motion.div>
      </main>

      {/* Footer with simplified animation */}
      <footer className="relative z-10 bg-slate-900/70 backdrop-blur-sm border-t border-slate-800/50 py-6 mt-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} Expense Tracker.
            <span className="hidden md:inline">
              {" "}
              Simplify your financial tracking.
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {[
              {
                icon: Github,
                href: "https://github.com/hari7901",
                label: "GitHub",
              },
              {
                icon: Linkedin,
                href: "https://linkedin.com/in/yourusername",
                label: "LinkedIn",
              },
            ].map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label={label}
              >
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
