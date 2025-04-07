"use client";

import React from "react";
import { motion } from "framer-motion";
import { Home, PlusCircle, BarChart2, Settings, LogOut } from "lucide-react";

interface NavbarProps {
  activeTab: "add" | "list" | "analytics";
  setActiveTab: (tab: "add" | "list" | "analytics") => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="bg-slate-900 border-b border-slate-800"
    >
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo and Title */}
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">ET</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Expense Tracker</h1>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-4">
          {[
            {
              icon: Home,
              label: "Add Expense",
              tab: "add",
            },
            {
              icon: BarChart2,
              label: "Analytics",
              tab: "analytics",
            },
            {
              icon: PlusCircle,
              label: "Expenses",
              tab: "list",
            },
          ].map(({ icon: Icon, label, tab }) => (
            <motion.button
              key={tab}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab as "add" | "list" | "analytics")}
              className={`
                flex items-center space-x-2 px-3 py-2 rounded-lg transition-all
                ${
                  activeTab === tab
                    ? "bg-emerald-500 text-white"
                    : "text-gray-400 hover:bg-slate-800 hover:text-white"
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="hidden md:inline text-sm">{label}</span>
            </motion.button>
          ))}
        </nav>

        {/* User Actions */}
        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <Settings className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="text-red-500 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
};

export default Navbar;
