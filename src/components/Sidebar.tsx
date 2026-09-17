"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import BademciogluLogo from "@/components/brand/BademciogluLogo";
import { useNav } from "@/context/NavContext";
import { useAuth } from "@/context/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";
import {
  Layers,
  Milk,
  ClipboardList,
  PlusCircle,
  FileSpreadsheet,
  Package,
  TrendingDown,
  BarChart3,
  ChevronDown,
  X,
  LogOut,
  UserCheck,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const { isMobileOpen, closeMobileMenu } = useNav();
  const { user, logout } = useAuth();
  const [sutAlimOpen, setSutAlimOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isSutAlimActive =
    pathname === "/sut-girisi" ||
    pathname === "/mustahsil-ekle" ||
    pathname === "/rapor";

  // SSR Hydration koruyucu ikon sarıcı
  const SafeIcon = ({ icon: Icon, className }: { icon: any; className?: string }) => {
    if (!mounted) {
      return <span className={cn("inline-block shrink-0", className)} aria-hidden="true" />;
    }
    return <Icon className={className} />;
  };

  return (
    <>
      {/* Mobil Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={closeMobileMenu}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Paneli */}
      <aside
        className={cn(
          "w-72 md:w-64 bg-white dark:bg-[#0B101B] text-slate-800 dark:text-slate-200 flex flex-col h-screen fixed left-0 top-0 border-r border-slate-200 dark:border-slate-800/80 shadow-xl z-50 no-print select-none transition-transform duration-300 ease-in-out",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Bademcioğlu Kurumsal Logo Bölümü */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col items-center relative bg-gradient-to-b from-slate-50 to-white dark:from-[#0E1524] dark:to-[#0B101B] w-full">
          {/* Mobilde Kapatma Butonu */}
          <button
            onClick={closeMobileMenu}
            className="md:hidden absolute right-3 top-3 p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-10"
            aria-label="Menüyü Kapat"
          >
            <SafeIcon icon={X} className="w-5 h-5" />
          </button>

          <Link href="/" onClick={closeMobileMenu} className="focus:outline-none w-full flex justify-center">
            <BademciogluLogo size="sidebar" showSubtitle={false} className="w-full" />
          </Link>

          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-2.5 flex items-center gap-1.5 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Bademcioğlu Süt ve Süt Ürünleri
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin">
          {/* Ana Panel */}
          <Link
            href="/"
            onClick={closeMobileMenu}
            className={cn(
              "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all tactile-btn",
              pathname === "/"
                ? "bg-amber-500/15 text-amber-900 dark:text-amber-300 border border-amber-500/30 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            <SafeIcon icon={Layers} className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Genel Bakış</span>
          </Link>

          {/* Süt Alım Grubu */}
          <div className="pt-2">
            <button
              onClick={() => setSutAlimOpen(!sutAlimOpen)}
              className={cn(
                "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors tactile-btn",
                isSutAlimActive
                  ? "text-emerald-900 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <SafeIcon icon={Milk} className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Süt Alım</span>
              </div>
              <SafeIcon
                icon={ChevronDown}
                className={cn(
                  "w-4 h-4 text-slate-400 transition-transform duration-200",
                  sutAlimOpen ? "transform rotate-180 text-emerald-600 dark:text-emerald-400" : ""
                )}
              />
            </button>

            {/* Süt Alım Alt Menü */}
            {sutAlimOpen && (
              <div className="mt-1 ml-4 pl-3 border-l-2 border-slate-200 dark:border-slate-800 space-y-1">
                <Link
                  href="/sut-girisi"
                  onClick={closeMobileMenu}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all tactile-btn",
                    pathname === "/sut-girisi"
                      ? "bg-emerald-600 text-white shadow-sm font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  <SafeIcon icon={ClipboardList} className="w-4 h-4" />
                  <span>Süt Girişi</span>
                </Link>
                <Link
                  href="/mustahsil-ekle"
                  onClick={closeMobileMenu}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all tactile-btn",
                    pathname === "/mustahsil-ekle"
                      ? "bg-emerald-600 text-white shadow-sm font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  <SafeIcon icon={PlusCircle} className="w-4 h-4" />
                  <span>Müstahsil Ekle</span>
                </Link>
                <Link
                  href="/rapor"
                  onClick={closeMobileMenu}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all tactile-btn",
                    pathname === "/rapor"
                      ? "bg-emerald-600 text-white shadow-sm font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  <SafeIcon icon={FileSpreadsheet} className="w-4 h-4" />
                  <span>Rapor Çıkar</span>
                </Link>
              </div>
            )}
          </div>

          {/* Yoğurt & Gider Modülleri */}
          <div className="pt-2 space-y-1">
            <Link
              href="/yogurt-dagilim"
              onClick={closeMobileMenu}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all tactile-btn",
                pathname === "/yogurt-dagilim"
                  ? "bg-amber-50 dark:bg-amber-500/15 text-amber-900 dark:text-amber-300 border border-amber-300/80 dark:border-amber-500/30 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <SafeIcon icon={Package} className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Yoğurt Dağılım</span>
            </Link>

            <Link
              href="/giderler"
              onClick={closeMobileMenu}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all tactile-btn",
                pathname === "/giderler"
                  ? "bg-rose-50 dark:bg-rose-500/15 text-rose-900 dark:text-rose-300 border border-rose-300/80 dark:border-rose-500/30 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <SafeIcon icon={TrendingDown} className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span>Giderler</span>
            </Link>

            <Link
              href="/istatistik"
              onClick={closeMobileMenu}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all tactile-btn",
                pathname === "/istatistik"
                  ? "bg-sky-50 dark:bg-sky-500/15 text-sky-900 dark:text-sky-300 border border-sky-300/80 dark:border-sky-500/30 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <SafeIcon icon={BarChart3} className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>İstatistik & Yedek</span>
            </Link>
          </div>
        </nav>

        {/* Tema Değiştirici & Kullanıcı Profili */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0E1524]/60 space-y-2">
          {/* Hızlı Tema Değiştirici */}
          <ThemeToggle variant="full" />

          <div className="p-2.5 rounded-xl bg-white dark:bg-[#101726] border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-500/20 border border-amber-300 dark:border-amber-500/30 flex items-center justify-center text-amber-800 dark:text-amber-300">
                <SafeIcon icon={UserCheck} className="w-4 h-4" />
              </div>
              <div className="leading-tight">
                <span className="text-xs font-bold text-slate-800 dark:text-white block">
                  {user?.name || "Yönetici"}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Bademcioğlu Süt ve Süt Ürünleri</span>
              </div>
            </div>

            <button
              onClick={logout}
              title="Oturumu Kapat"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            >
              <SafeIcon icon={LogOut} className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
