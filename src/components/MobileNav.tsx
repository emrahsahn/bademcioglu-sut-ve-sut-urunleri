"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers,
  Milk,
  ClipboardList,
  PlusCircle,
  FileSpreadsheet,
  Package,
  TrendingDown,
  Menu,
  X,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNav } from "@/context/NavContext";

export default function MobileNav() {
  const pathname = usePathname();
  const { toggleMobileMenu } = useNav();
  const [mounted, setMounted] = useState(false);
  const [isSutPopupOpen, setIsSutPopupOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sayfa değiştiğinde açılır pencereyi otomatik kapat
  useEffect(() => {
    setIsSutPopupOpen(false);
  }, [pathname]);

  const isSutActive =
    pathname === "/sut-girisi" ||
    pathname === "/mustahsil-ekle" ||
    pathname === "/rapor";

  const SUT_SUB_ITEMS = [
    {
      href: "/sut-girisi",
      title: "1. Süt Girişi",
      badge: "Tartım & Alım",
      badgeColor: "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800/60",
      description: "Günlük üretici süt teslimatı ve kilogram kaydı",
      icon: ClipboardList,
      iconColor: "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60",
    },
    {
      href: "/mustahsil-ekle",
      title: "2. Müstahsil Ekle & Fiyat",
      badge: "Üretici Tanımı",
      badgeColor: "bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800/60",
      description: "Yeni üretici ekleme ve birim kg alış fiyatı",
      icon: PlusCircle,
      iconColor: "text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/60",
    },
    {
      href: "/rapor",
      title: "3. Rapor & Fiş Yazdır",
      badge: "Hesap & Döküm",
      badgeColor: "bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700/60",
      description: "Üretici teslimat dökümü, termal fiş ve cari kapatma",
      icon: FileSpreadsheet,
      iconColor: "text-amber-800 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60",
    },
  ];

  return (
    <>
      {/* Süt Açılır Penceresi (Mobile Bottom Sheet / Popover) */}
      <AnimatePresence>
        {isSutPopupOpen && (
          <>
            {/* Karartma / Kapatma Arka Planı */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setIsSutPopupOpen(false)}
              className="md:hidden fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40"
              aria-label="Açılır Pencereyi Kapat"
            />

            {/* Açılır Pencere Kartı */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 450, damping: 32 }}
              className="md:hidden fixed bottom-16 left-3 right-3 z-50 bg-white dark:bg-[#101726] border border-slate-200 dark:border-[#243049] rounded-3xl shadow-2xl p-4 space-y-3 overflow-hidden"
            >
              {/* Üst Başlık & Kapat Butonu */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
                    <Milk className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif font-black text-slate-900 dark:text-white text-sm">
                      Süt Alım & Müstahsil İşlemleri
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      Yapmak istediğiniz süt işlemini seçiniz
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsSutPopupOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Pencereyi Kapat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Süt Alt Seçenekleri Listesi */}
              <div className="space-y-2">
                {SUT_SUB_ITEMS.map((sub) => {
                  const SubIcon = sub.icon;
                  const isCurrent = pathname === sub.href;

                  return (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      onClick={() => setIsSutPopupOpen(false)}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-2xl border transition-all duration-150 active:scale-98",
                        isCurrent
                          ? "bg-amber-500/10 dark:bg-amber-500/15 border-amber-400 dark:border-amber-500/50 shadow-sm"
                          : "bg-slate-50/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 shadow-sm",
                            sub.iconColor
                          )}
                        >
                          <SubIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 dark:text-white text-xs">
                              {sub.title}
                            </h4>
                            <span
                              className={cn(
                                "text-[9px] font-mono font-black uppercase px-1.5 py-0.5 rounded border",
                                sub.badgeColor
                              )}
                            >
                              {sub.badge}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                            {sub.description}
                          </p>
                        </div>
                      </div>

                      <div className="text-slate-400 dark:text-slate-500 ml-2">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Sabit Alt Bar (Mobile Bottom Navigation Bar) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0B101B]/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-lg shadow-slate-200/50 dark:shadow-black/50 no-print select-none transition-colors">
        {/* 1. Özet (Genel Bakış) */}
        <Link
          href="/"
          className={cn(
            "flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-150 tactile-btn",
            pathname === "/"
              ? "text-amber-900 dark:text-amber-300 font-bold bg-amber-100 dark:bg-amber-500/20 border border-amber-300 dark:border-amber-500/30 shadow-sm"
              : "text-slate-600 dark:text-slate-400 font-semibold hover:text-slate-900 dark:hover:text-white"
          )}
        >
          {mounted ? (
            <Layers className={cn("w-5 h-5", pathname === "/" ? "stroke-[2.5]" : "stroke-[1.8]")} />
          ) : (
            <span className="w-5 h-5 inline-block" aria-hidden="true" />
          )}
          <span className="text-[10px] mt-0.5">Özet</span>
        </Link>

        {/* 2. Süt (Açılır Pencere Tetikleyici) */}
        <button
          type="button"
          onClick={() => setIsSutPopupOpen((prev) => !prev)}
          className={cn(
            "flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-150 tactile-btn relative",
            isSutActive || isSutPopupOpen
              ? "text-amber-900 dark:text-amber-300 font-bold bg-amber-100 dark:bg-amber-500/20 border border-amber-300 dark:border-amber-500/30 shadow-sm"
              : "text-slate-600 dark:text-slate-400 font-semibold hover:text-slate-900 dark:hover:text-white"
          )}
          aria-expanded={isSutPopupOpen}
          aria-haspopup="dialog"
          aria-label="Süt"
        >
          {mounted ? (
            <ClipboardList
              className={cn("w-5 h-5", isSutActive || isSutPopupOpen ? "stroke-[2.5]" : "stroke-[1.8]")}
            />
          ) : (
            <span className="w-5 h-5 inline-block" aria-hidden="true" />
          )}
          <span className="text-[10px] mt-0.5 flex items-center gap-0.5">
            <span>Süt</span>
            <span className="text-[8px] opacity-70">▾</span>
          </span>
          {isSutPopupOpen && (
            <span className="absolute -top-1 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          )}
        </button>

        {/* 3. Yoğurt */}
        <Link
          href="/yogurt-dagilim"
          className={cn(
            "flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-150 tactile-btn",
            pathname === "/yogurt-dagilim"
              ? "text-amber-900 dark:text-amber-300 font-bold bg-amber-100 dark:bg-amber-500/20 border border-amber-300 dark:border-amber-500/30 shadow-sm"
              : "text-slate-600 dark:text-slate-400 font-semibold hover:text-slate-900 dark:hover:text-white"
          )}
        >
          {mounted ? (
            <Package
              className={cn("w-5 h-5", pathname === "/yogurt-dagilim" ? "stroke-[2.5]" : "stroke-[1.8]")}
            />
          ) : (
            <span className="w-5 h-5 inline-block" aria-hidden="true" />
          )}
          <span className="text-[10px] mt-0.5">Yoğurt</span>
        </Link>

        {/* 4. Gider */}
        <Link
          href="/giderler"
          className={cn(
            "flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-150 tactile-btn",
            pathname === "/giderler"
              ? "text-amber-900 dark:text-amber-300 font-bold bg-amber-100 dark:bg-amber-500/20 border border-amber-300 dark:border-amber-500/30 shadow-sm"
              : "text-slate-600 dark:text-slate-400 font-semibold hover:text-slate-900 dark:hover:text-white"
          )}
        >
          {mounted ? (
            <TrendingDown
              className={cn("w-5 h-5", pathname === "/giderler" ? "stroke-[2.5]" : "stroke-[1.8]")}
            />
          ) : (
            <span className="w-5 h-5 inline-block" aria-hidden="true" />
          )}
          <span className="text-[10px] mt-0.5">Gider</span>
        </Link>

        {/* 5. Menü (Tüm menüyü açar) */}
        <button
          onClick={toggleMobileMenu}
          className="flex flex-col items-center justify-center py-1.5 px-3 rounded-xl text-slate-600 dark:text-slate-400 font-semibold hover:text-slate-900 dark:hover:text-white active:scale-95 transition-all tactile-btn"
          aria-label="Menü"
        >
          {mounted ? (
            <Menu className="w-5 h-5 stroke-[1.8]" />
          ) : (
            <span className="w-5 h-5 inline-block" aria-hidden="true" />
          )}
          <span className="text-[10px] mt-0.5">Menü</span>
        </button>
      </div>
    </>
  );
}
