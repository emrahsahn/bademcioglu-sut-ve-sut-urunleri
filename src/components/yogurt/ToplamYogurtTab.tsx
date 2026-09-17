"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { YogurtDagitim } from "@/types/database";
import { dataService } from "@/services";
import { useToast } from "@/components/ui/Toast";
import { formatDate, getTodayDateString } from "@/lib/utils";
import {
  Calendar,
  Layers,
  Save,
  Truck,
  AlertTriangle,
  PackageCheck,
  FlaskConical,
} from "lucide-react";

interface ToplamYogurtTabProps {
  dagitimlar: YogurtDagitim[];
}

export default function ToplamYogurtTab({ dagitimlar }: ToplamYogurtTabProps) {
  const { success, error } = useToast();

  const [tarih, setTarih] = useState<string>(getTodayDateString());
  const [buyukUretim, setBuyukUretim] = useState<string>("0");
  const [kucukUretim, setKucukUretim] = useState<string>("0");
  const [mayaMiktar, setMayaMiktar] = useState<string>("0");
  const [zayiatYogurt, setZayiatYogurt] = useState<string>("0");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Tarih değiştiğinde o günün kayıtlı üretim verisini yükle
  useEffect(() => {
    async function loadUretim() {
      try {
        setLoading(true);
        const record = await dataService.getYogurtUretimByTarih(tarih);
        if (record) {
          setBuyukUretim((record.buyuk_uretim || 0).toString());
          setKucukUretim((record.kucuk_uretim || 0).toString());
          setMayaMiktar((record.maya_kg || 0).toString());
          setZayiatYogurt((record.zayiat_adet || 0).toString());
        } else {
          setBuyukUretim("0");
          setKucukUretim("0");
          setMayaMiktar("0");
          setZayiatYogurt("0");
        }
      } catch (err) {
        console.error("Uretim yuklenemedi:", err);
      } finally {
        setLoading(false);
      }
    }
    loadUretim();
  }, [tarih]);

  // Seçili tarihe ait dağıtımlar (Otomatik hesaplanır, değiştirilemez)
  const oGununDagitimlari = dagitimlar.filter((d) => d.tarih === tarih);
  const dagitilanBuyuk = oGununDagitimlari.reduce((sum, d) => sum + (d.buyuk_adet || 0), 0);
  const dagitilanKucuk = oGununDagitimlari.reduce((sum, d) => sum + (d.kucuk_adet || 0), 0);
  const dagitilanToplamAdet = dagitilanBuyuk + dagitilanKucuk;

  // Üretim Kaydet
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await dataService.saveYogurtUretim({
        tarih,
        buyuk_uretim: parseInt(buyukUretim) || 0,
        kucuk_uretim: parseInt(kucukUretim) || 0,
        maya_kg: parseFloat(mayaMiktar.replace(",", ".")) || 0,
        zayiat_adet: parseInt(zayiatYogurt) || 0,
      });

      success(`${formatDate(tarih)} tarihi üretim ve zayiat verileri kaydedildi.`);
    } catch (err) {
      error("Üretim verileri kaydedilirken hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  // Elde Kalan Hesaplaması
  const bUretim = parseInt(buyukUretim) || 0;
  const kUretim = parseInt(kucukUretim) || 0;
  const zayiat = parseInt(zayiatYogurt) || 0;
  const toplamUretilen = bUretim + kUretim;
  const eldeKalan = Math.max(0, toplamUretilen - (dagitilanToplamAdet + zayiat));

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* 1. Tarih Seçici & Üst Bento Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bento-card bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-100 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 flex items-center justify-center text-amber-800 dark:text-amber-400 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-widest text-amber-900 dark:text-amber-300 uppercase font-black px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800/60">
                GÜNLÜK DENGE & İMALAT
              </span>
            </div>
            <h3 className="font-black text-slate-900 dark:text-white text-lg mt-0.5">
              {formatDate(tarih)} İmalat ve Dağıtım Sayımı
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700">
          <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <input
            type="date"
            value={tarih}
            onChange={(e) => setTarih(e.target.value)}
            className="bg-transparent text-xs font-mono font-bold text-slate-900 dark:text-white outline-none cursor-pointer"
          />
        </div>
      </motion.div>

      {/* 2. Elle Yazılacak İmalat, Maya & Zayiat Bento Grid */}
      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSave}
        className="bento-card bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 p-6 space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h4 className="font-black text-slate-900 dark:text-white text-base">
              İmalat, Maya ve Zayiat Girişi
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              Mandıradan çıkan parti ve fire adetlerini girip kaydediniz
            </p>
          </div>
          <span className="text-[11px] font-mono font-bold text-amber-800 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800/60 self-start sm:self-auto">
            {loading ? "Veriler Getiriliyor..." : "Otomatik Kayıt Destekli"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Büyük Yoğurt İmalatı */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-2 group">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Büyük Yoğurt (Kova)</label>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>
            <input
              type="number"
              min="0"
              value={buyukUretim}
              onChange={(e) => setBuyukUretim(e.target.value)}
              className="w-full text-center py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xl font-mono font-black text-slate-900 dark:text-white outline-none focus:border-amber-500 dark:focus:border-amber-400 transition-all shadow-sm"
            />
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block text-center font-sans font-medium">
              Üretilen büyük kova adedi
            </span>
          </div>

          {/* Küçük Yoğurt İmalatı */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-2 group">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Küçük Yoğurt (Kova)</label>
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            </div>
            <input
              type="number"
              min="0"
              value={kucukUretim}
              onChange={(e) => setKucukUretim(e.target.value)}
              className="w-full text-center py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xl font-mono font-black text-slate-900 dark:text-white outline-none focus:border-amber-500 dark:focus:border-amber-400 transition-all shadow-sm"
            />
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block text-center font-sans font-medium">
              Üretilen küçük kova adedi
            </span>
          </div>

          {/* Maya Satırı */}
          <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 hover:border-amber-300 dark:hover:border-amber-700 transition-all space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                <FlaskConical className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Maya Miktarı</span>
              </label>
              <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400 font-bold">Kg/Adet</span>
            </div>
            <input
              type="number"
              step="any"
              min="0"
              value={mayaMiktar}
              onChange={(e) => setMayaMiktar(e.target.value)}
              className="w-full text-center py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-800/70 text-xl font-mono font-black text-amber-900 dark:text-amber-300 outline-none focus:border-amber-500 transition-all shadow-sm"
            />
            <span className="text-[11px] text-amber-700 dark:text-amber-400 block text-center font-sans font-medium">
              Kullanılan maya miktarı
            </span>
          </div>

          {/* Zayiat Yoğurt Satırı */}
          <div className="p-4 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/50 hover:border-rose-300 dark:hover:border-rose-700 transition-all space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-rose-900 dark:text-rose-300 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                <span>Zayiat / Fire</span>
              </label>
              <span className="text-[10px] font-mono text-rose-700 dark:text-rose-400 font-bold">Fire</span>
            </div>
            <input
              type="number"
              min="0"
              value={zayiatYogurt}
              onChange={(e) => setZayiatYogurt(e.target.value)}
              className="w-full text-center py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-rose-300 dark:border-rose-800/70 text-xl font-mono font-black text-rose-700 dark:text-rose-300 outline-none focus:border-rose-500 transition-all shadow-sm"
            />
            <span className="text-[11px] text-rose-700 dark:text-rose-400 block text-center font-sans font-medium">
              Bozulan / dökülen kova
            </span>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            id="uretim-bilgileri-kaydet-btn"
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Kaydediliyor..." : "Üretim Bilgilerini Kaydet"}</span>
          </button>
        </div>
      </motion.form>

      {/* 3. Dağıtılan Bölümü (Otomatik Sayım, Salt Okunur Bento) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bento-card bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 p-6 space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <h4 className="font-black text-slate-900 dark:text-white text-base">
                Dağıtılan Toplam Yoğurt
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                Salt Okunur
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              Bu tarihte müşterilere dağıtılan adetler sistem tarafından otomatik çekilir
            </p>
          </div>

          <div className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            {oGununDagitimlari.length} Farklı Noktaya Teslimat
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <span className="text-xs text-slate-600 dark:text-slate-400 font-bold uppercase">Dağıtılan Büyük Kova</span>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-mono font-black text-slate-900 dark:text-white">{dagitilanBuyuk}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Kova</span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <span className="text-xs text-slate-600 dark:text-slate-400 font-bold uppercase">Dağıtılan Küçük Kova</span>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-mono font-black text-slate-900 dark:text-white">{dagitilanKucuk}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Kova</span>
            </div>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-950/20 p-5 rounded-xl border border-emerald-200 dark:border-emerald-800/40 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300 font-black">
              <span>Toplam Teslim Edilen</span>
              <PackageCheck className="w-4 h-4" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-mono font-black text-emerald-800 dark:text-emerald-300">{dagitilanToplamAdet}</span>
              <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold">Kova Teslim</span>
            </div>
          </div>
        </div>

        {/* Günlük Denge & Stok Kartı */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300 font-medium">
            <PackageCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              Toplam İmalat: <strong className="text-slate-900 dark:text-white font-black">{toplamUretilen} Kova</strong>
              {" "}&bull;{" "}
              Zayiat: <strong className="text-rose-700 dark:text-rose-400 font-black">{zayiat} Adet</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-600 dark:text-slate-400 font-bold">Kalan Stok / Denge:</span>
            <span className="px-3 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 font-mono font-black text-sm">
              {eldeKalan} Kova
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
