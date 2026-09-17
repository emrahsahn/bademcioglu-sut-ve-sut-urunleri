"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import { dataService } from "@/services";
import { DashboardOzet } from "@/types/database";
import { formatCurrency, formatKg } from "@/lib/utils";
import BademciogluLogo from "@/components/brand/BademciogluLogo";
import {
  Milk,
  Users,
  Wallet,
  ArrowRight,
  ClipboardList,
  PlusCircle,
  FileSpreadsheet,
  Package,
  TrendingDown,
  BarChart3,
  Sparkles,
  Calendar,
} from "lucide-react";

export default function HomePage() {
  const [stats, setStats] = useState<DashboardOzet>({
    toplamMustahsilSayisi: 0,
    aktifSutMiktariKg: 0,
    aktifToplamTutarTL: 0,
    bugunkuSutKg: 0,
    toplamYogurtMusterisi: 0,
    toplamDagitilanYogurtKova: 0,
    aylikToplamGiderTL: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await dataService.getDashboardOzet();
        setStats(data);
      } catch (err) {
        console.error("Stats load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <Header
        title="Genel Bakış"
        subtitle="Mandıra süt toplama, yoğurt dağıtımı ve işletme maliyet takip paneli"
      />

      {/* Brand Hero Banner - Dual Theme Artisan */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-amber-500/10 via-white to-amber-50/50 dark:from-amber-500/10 dark:via-[#101726] dark:to-amber-950/20 border border-amber-300/80 dark:border-amber-500/30 rounded-3xl p-6 sm:p-7 shadow-sm relative overflow-hidden transition-colors"
      >
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-amber-500/10 to-transparent pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5 text-center sm:text-left flex-col sm:flex-row">
            <BademciogluLogo size="md" />
            <div className="space-y-1">
              <h2 className="font-serif text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Bademcioğlu Süt ve Süt Ürünleri
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-lg font-medium leading-relaxed">
                Günlük mandıra süt alımları, kova yoğurt dağıtımı, veresiye takibi ve işletme harcamalarını ferah ve pratik ekrandan yönetin.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/yogurt-dagilim"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 flex items-center gap-2 active:scale-95 transition-all"
            >
              <Package className="w-4 h-4" />
              <span>Yoğurt Dağıtımı</span>
            </Link>
            <Link
              href="/sut-girisi"
              className="px-5 py-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-300 dark:border-slate-700 shadow-sm flex items-center gap-2 active:scale-95 transition-all"
            >
              <Milk className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Süt Girişi</span>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Dual Theme Bento İstatistik Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Müstahsil Sayısı */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bento-card bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 p-5 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Kayıtlı Müstahsil
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-blue-700 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-mono font-black text-slate-900 dark:text-white">
              {loading ? "..." : stats.toplamMustahsilSayisi}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 ml-1.5 font-sans font-medium">üretici</span>
          </div>
        </motion.div>

        {/* Açık Dönem Süt */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bento-card bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 p-5 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Açık Dönem Süt
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Milk className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-mono font-black text-emerald-600 dark:text-emerald-400">
              {loading ? "..." : formatKg(stats.aktifSutMiktariKg)}
            </span>
          </div>
        </motion.div>

        {/* Cari Borç (Süt) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bento-card bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 p-5 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Açık Cari Borç (Süt)
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-mono font-black text-amber-600 dark:text-amber-400">
              {loading ? "..." : formatCurrency(stats.aktifToplamTutarTL)}
            </span>
          </div>
        </motion.div>

        {/* Yoğurt Dağıtımı */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bento-card bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 p-5 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Toplam Yoğurt Dağıtımı
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 text-purple-700 dark:text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline">
            <span className="text-2xl font-mono font-black text-slate-900 dark:text-white">
              {loading ? "..." : `${stats.toplamDagitilanYogurtKova} Kova`}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 ml-2 font-sans font-medium">
              ({stats.toplamYogurtMusterisi} müşteri)
            </span>
          </div>
        </motion.div>
      </div>

      {/* Süt Alım Modülü Bento Kartları */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <Milk className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span>Süt Alım & Müstahsil Modülü</span>
          </h3>
          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-semibold">MANDIRA GİRDİLERİ</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/sut-girisi"
            className="group bento-card bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 p-5 hover:border-emerald-500/60 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden"
          >
            <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ClipboardList className="w-5 h-5" />
            </div>
            <h4 className="font-serif text-base font-bold text-slate-900 dark:text-white mt-4 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              1. Süt Girişi Yap
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              Kayıtlı üreticiyi seçip sabah/akşam litre ve kg girerek hızlıca süt kaydı ekleyin.
            </p>
            <div className="mt-4 flex items-center text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
              <span>Giriş Ekranına Git</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </Link>

          <Link
            href="/mustahsil-ekle"
            className="group bento-card bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 p-5 hover:border-emerald-500/60 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden"
          >
            <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-blue-700 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <PlusCircle className="w-5 h-5" />
            </div>
            <h4 className="font-serif text-base font-bold text-slate-900 dark:text-white mt-4 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              2. Müstahsil Ekle & Fiyat
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              Yeni üretici tanımlayın ve kilogram başına alış birim fiyatını belirleyin.
            </p>
            <div className="mt-4 flex items-center text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
              <span>Müstahsil Yönetimi</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </Link>

          <Link
            href="/rapor"
            className="group bento-card bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 p-5 hover:border-emerald-500/60 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden"
          >
            <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h4 className="font-serif text-base font-bold text-slate-900 dark:text-white mt-4 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              3. Rapor & Fiş Yazdır
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              Üreticinin teslimat dökümünü inceleyin, termal makbuz yazdırın ve hesabı kapatın.
            </p>
            <div className="mt-4 flex items-center text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
              <span>Müstahsil Raporları</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </Link>
        </div>
      </div>

      {/* Yoğurt Dağıtım & Gider Modülü Bento Kartları */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Package className="w-4 h-4 text-amber-700 dark:text-amber-400" />
            <span>Yoğurt Dağıtım, Gider & İstatistikler</span>
          </h3>
          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-semibold">SATIŞ VE İŞLETME</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/yogurt-dagilim"
            className="group bento-card bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 p-5 hover:border-amber-500/60 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden"
          >
            <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Package className="w-5 h-5" />
            </div>
            <h4 className="font-serif text-base font-bold text-slate-900 dark:text-white mt-4 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
              Yoğurt Dağıtım Portalı
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              Günlük kova teslimatları, boş kova ve ürün iadeleri, veresiye takibi ve termal fiş çıktısı.
            </p>
            <div className="mt-4 flex items-center text-xs font-mono font-bold text-amber-800 dark:text-amber-400 group-hover:translate-x-1 transition-transform">
              <span>Dağıtım Ekranına Git</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </Link>

          <Link
            href="/giderler"
            className="group bento-card bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 p-5 hover:border-rose-500/60 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden"
          >
            <div className="w-11 h-11 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <TrendingDown className="w-5 h-5" />
            </div>
            <h4 className="font-serif text-base font-bold text-slate-900 dark:text-white mt-4 group-hover:text-rose-700 dark:group-hover:text-rose-400 transition-colors">
              İşletme Giderleri
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              Yem, akaryakıt, ambalaj, elektrik masraflarını kaydedin ve geçmiş harcamaları listeleyin.
            </p>
            <div className="mt-4 flex items-center text-xs font-mono font-bold text-rose-700 dark:text-rose-400 group-hover:translate-x-1 transition-transform">
              <span>Giderler Modülüne Git</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </Link>

          <Link
            href="/istatistik"
            className="group bento-card bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 p-5 hover:border-sky-500/60 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden"
          >
            <div className="w-11 h-11 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 text-sky-700 dark:text-sky-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h4 className="font-serif text-base font-bold text-slate-900 dark:text-white mt-4 group-hover:text-sky-700 dark:group-hover:text-sky-400 transition-colors">
              Mali Denge & Yedekleme
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              Gelir-gider dengesini görün ve tüm sistemi tek tıkla JSON olarak yedekleyin veya geri yükleyin.
            </p>
            <div className="mt-4 flex items-center text-xs font-mono font-bold text-sky-700 dark:text-sky-400 group-hover:translate-x-1 transition-transform">
              <span>İstatistikleri Gör</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
