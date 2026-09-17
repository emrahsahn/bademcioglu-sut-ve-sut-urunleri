"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import { dataService } from "@/services";
import { YogurtMusteri, YogurtDagitim } from "@/types/database";
import { useToast } from "@/components/ui/Toast";
import DagitilacaklarTab from "@/components/yogurt/DagitilacaklarTab";
import MusteriEkleTab from "@/components/yogurt/MusteriEkleTab";
import VeresiyeSatislarTab from "@/components/yogurt/VeresiyeSatislarTab";
import EskiKayitlarTab from "@/components/yogurt/EskiKayitlarTab";
import ToplamYogurtTab from "@/components/yogurt/ToplamYogurtTab";
import {
  Truck,
  UserPlus,
  Wallet,
  CalendarDays,
  Layers,
} from "lucide-react";

export type YogurtTabType =
  | "dagitilacaklar"
  | "musteri-ekle"
  | "veresiye"
  | "eski-kayitlar"
  | "toplam-yogurt";

export default function YogurtDagilimPage() {
  const { error } = useToast();

  const [activeTab, setActiveTab] = useState<YogurtTabType>("dagitilacaklar");
  const [musteriler, setMusteriler] = useState<YogurtMusteri[]>([]);
  const [dagitimlar, setDagitimlar] = useState<YogurtDagitim[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);

  const loadData = async () => {
    try {
      const [mList, dList] = await Promise.all([
        dataService.getYogurtMusterileri(),
        dataService.getYogurtDagitimlari(),
      ]);
      setMusteriler(mList);
      setDagitimlar(dList);
    } catch (err) {
      error("Yoğurt verileri yüklenirken hata oluştu.");
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const borcluMusteriSayisi = musteriler.filter((m) => (m.bakiye || 0) > 0).length;
  const toplamVeresiyeBorc = musteriler.reduce((acc, m) => acc + (m.bakiye || 0), 0);

  // Bugünkü dağıtımlar
  const todayStr = new Date().toISOString().split("T")[0];
  const bugunkuDagitimlar = dagitimlar.filter((d) => d.tarih === todayStr);
  const bugunToplamKova = bugunkuDagitimlar.reduce(
    (acc, d) => acc + (d.buyuk_adet || 0) + (d.kucuk_adet || 0) + (d.kova_adedi || 0),
    0
  );
  const bugunNakitTahsilat = bugunkuDagitimlar.reduce(
    (acc, d) => acc + (d.odenen_tutar || 0),
    0
  );

  const TABS: { id: YogurtTabType; label: string; icon: any; count?: number; countColor?: string }[] = [
    { id: "dagitilacaklar", label: "Dağıtılacaklar (Bugün)", icon: Truck },
    { id: "musteri-ekle", label: "Müşteri Ekle", icon: UserPlus, count: musteriler.length },
    {
      id: "veresiye",
      label: "Veresiye Satışlar",
      icon: Wallet,
      count: borcluMusteriSayisi,
      countColor: "bg-rose-100 text-rose-800 border border-rose-300",
    },
    { id: "eski-kayitlar", label: "Eski Kayıtlar", icon: CalendarDays },
    { id: "toplam-yogurt", label: "Toplam Yoğurt", icon: Layers },
  ];

  return (
    <div className="space-y-6">
      <Header
        title="Yoğurt Dağıtım & Takip Sistemi"
        subtitle="Bademcioğlu Yoğurtları — Anamur'un Yerli Markası Dağıtım ve Üretim Dengesi"
      />

      {/* Üst Bento KPI Özet Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
        {/* KPI 1: Günlük Dağıtılan Kova */}
        <div className="bento-card bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 p-4 sm:p-5 bento-glow-amber">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Bugün Dağıtılan
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-400 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white num-mono">
              {bugunToplamKova}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Kova</span>
          </div>
          <div className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold mt-1">
            {bugunkuDagitimlar.length} teslimat noktası tamamlandı
          </div>
        </div>

        {/* KPI 2: Bugün Tahsil Edilen Nakit */}
        <div className="bento-card bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 p-4 sm:p-5 bento-glow-emerald">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Bugün Kasa / Nakit
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
              ₺
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-400 num-mono">
              ₺{bugunNakitTahsilat.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold mt-1">
            ✓ Kasaya giren net tahsilat
          </div>
        </div>

        {/* KPI 3: Kalan Alacak / Toplam Veresiye */}
        <div className="bento-card bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Kalan Toplam Veresiye
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-rose-700 dark:text-rose-400 num-mono">
              ₺{toplamVeresiyeBorc.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="text-[11px] text-rose-700 dark:text-rose-400 font-semibold mt-1">
            {borcluMusteriSayisi} müşteride açık bakiye
          </div>
        </div>
      </div>

      {/* 5 Sekmeli Akışkan Framer-Motion Navigasyon Çubuğu */}
      <div className="flex items-center gap-1.5 p-1.5 bg-white dark:bg-[#101726] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto scrollbar-thin transition-colors">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap tactile-btn focus:outline-none shrink-0 ${
                isActive ? "text-slate-950 font-black" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeYogurtTabPill"
                  className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-500 rounded-xl shadow-md shadow-amber-500/20"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}

              <span className="relative z-10 flex items-center gap-2">
                <Icon className={`w-4 h-4 ${isActive ? "text-slate-950 stroke-[2.5]" : "text-slate-500 dark:text-slate-400"}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      isActive
                        ? "bg-black/15 text-black"
                        : tab.countColor || "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* Aktif Sekme İçeriği */}
      <div className="mt-4">
        {initialLoading ? (
          <div className="bento-card bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-500 dark:text-slate-400">
            <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-medium">Yoğurt verileri yükleniyor...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {activeTab === "dagitilacaklar" && (
                <DagitilacaklarTab
                  musteriler={musteriler}
                  dagitimlar={dagitimlar}
                  onRefresh={loadData}
                  onNavigateToMusteriEkle={() => setActiveTab("musteri-ekle")}
                />
              )}

              {activeTab === "musteri-ekle" && (
                <MusteriEkleTab musteriler={musteriler} onRefresh={loadData} />
              )}

              {activeTab === "veresiye" && (
                <VeresiyeSatislarTab
                  musteriler={musteriler}
                  dagitimlar={dagitimlar}
                  onRefresh={loadData}
                  onNavigateToDagitim={() => setActiveTab("dagitilacaklar")}
                />
              )}

              {activeTab === "eski-kayitlar" && (
                <EskiKayitlarTab
                  musteriler={musteriler}
                  dagitimlar={dagitimlar}
                  onRefresh={loadData}
                />
              )}

              {activeTab === "toplam-yogurt" && (
                <ToplamYogurtTab dagitimlar={dagitimlar} />
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
