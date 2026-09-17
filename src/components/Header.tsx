"use client";

import React, { useEffect, useState } from "react";
import { Calendar, Menu } from "lucide-react";
import { useNav } from "@/context/NavContext";
import ThemeToggle from "@/components/ThemeToggle";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export default function Header({
  title = "Bademcioğlu Yoğurtları",
  subtitle = "Anamur'un Yerli Markası — Mandıra & Yoğurt Takip Sistemi",
}: HeaderProps) {
  const { toggleMobileMenu } = useNav();
  const [currentDate, setCurrentDate] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const now = new Date();
    setCurrentDate(
      new Intl.DateTimeFormat("tr-TR", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(now)
    );
  }, []);

  return (
    <header className="bg-white/90 dark:bg-[#0B101B]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 px-3.5 sm:px-6 py-3 flex items-center justify-between gap-3 no-print transition-colors">
      {/* Sol: Hamburger Butonu (Mobil) & Başlık */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleMobileMenu}
          className="md:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 text-slate-700 dark:text-slate-200 transition-all border border-slate-200 dark:border-slate-700"
          aria-label="Menüyü Aç"
        >
          {mounted ? <Menu className="w-5 h-5" /> : <span className="w-5 h-5 inline-block" />}
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-tight flex items-center gap-2">
            <span>{title}</span>
            <span className="hidden sm:inline-flex text-[9px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/10 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30">
              Anamur
            </span>
          </h1>
          {subtitle && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block mt-0.5 font-medium">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Sağ: Tema Değiştirici & Tarih */}
      <div className="flex items-center gap-2.5">
        <ThemeToggle variant="icon" />

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm">
          {mounted ? (
            <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          ) : (
            <span className="w-3.5 h-3.5 inline-block" />
          )}
          <span className="num-mono">{currentDate || "..."}</span>
        </div>
      </div>
    </header>
  );
}
