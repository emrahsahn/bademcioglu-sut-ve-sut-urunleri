"use client";

import React from "react";
import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon } from "lucide-react";

interface ThemeToggleProps {
  variant?: "icon" | "full";
  className?: string;
}

export default function ThemeToggle({
  variant = "icon",
  className = "",
}: ThemeToggleProps) {
  const { theme, isDark, toggleTheme } = useTheme();

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        id="theme-toggle-full-btn"
        className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all text-xs font-semibold select-none active:scale-[0.98] ${
          isDark
            ? "bg-[#101726]/90 border-slate-800 text-amber-400 hover:bg-slate-800/80 hover:border-slate-700"
            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300"
        } ${className}`}
        aria-label="Temayı Değiştir"
      >
        <div className="flex items-center gap-2">
          {isDark ? (
            <Moon className="w-4 h-4 text-amber-400 transition-transform duration-300 rotate-0" />
          ) : (
            <Sun className="w-4 h-4 text-amber-600 transition-transform duration-300 rotate-0" />
          )}
          <span>{isDark ? "Koyu Tema Aktif" : "Aydınlık Tema Aktif"}</span>
        </div>
        <span
          className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
            isDark
              ? "bg-amber-500/10 text-amber-300 border border-amber-500/20"
              : "bg-amber-100 text-amber-800 border border-amber-200"
          }`}
        >
          {isDark ? "Gece" : "Gündüz"}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      id="theme-toggle-btn"
      className={`relative p-2 rounded-xl border transition-all active:scale-90 flex items-center justify-center ${
        isDark
          ? "bg-[#101726] border-slate-800 text-amber-400 hover:bg-slate-800 hover:border-slate-700 shadow-lg shadow-black/20"
          : "bg-white border-slate-200 text-amber-600 hover:bg-amber-50 hover:border-amber-300 shadow-sm"
      } ${className}`}
      title={isDark ? "Aydınlık Temaya Geç" : "Koyu Temaya Geç"}
      aria-label={isDark ? "Aydınlık Temaya Geç" : "Koyu Temaya Geç"}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 transition-all duration-300 transform hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-amber-600 transition-all duration-300 transform hover:-rotate-12" />
      )}
    </button>
  );
}
