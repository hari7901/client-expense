"use client";

import React from "react";
import { motion } from "framer-motion";
import { Github, Twitter, Linkedin } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="bg-slate-900 border-t border-slate-800 py-6"
    >
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        {/* Copyright */}
        <div className="text-gray-400 text-sm mb-4 md:mb-0">
          © {new Date().getFullYear()} Expense Tracker.
          <span className="hidden md:inline">
            {" "}
            Simplify your financial tracking.
          </span>
        </div>

        {/* Social Links */}
        <div className="flex items-center space-x-4">
          {[
            {
              icon: Github,
              href: "https://github.com/yourusername",
              label: "GitHub",
            },
            {
              icon: Twitter,
              href: "https://twitter.com/yourusername",
              label: "Twitter",
            },
            {
              icon: Linkedin,
              href: "https://linkedin.com/in/yourusername",
              label: "LinkedIn",
            },
          ].map(({ icon: Icon, href, label }) => (
            <motion.a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="text-gray-400 hover:text-white transition-colors"
              aria-label={label}
            >
              <Icon className="w-5 h-5" />
            </motion.a>
          ))}
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
