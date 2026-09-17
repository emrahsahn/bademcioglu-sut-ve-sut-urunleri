"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { YogurtDagitim } from "@/types/database";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Printer, X } from "lucide-react";
import BademciogluLogo from "@/components/brand/BademciogluLogo";

interface FisYazdirProps {
  dagitim: YogurtDagitim | null;
  onClose: () => void;
}

export default function FisYazdir({ dagitim, onClose }: FisYazdirProps) {
  if (!dagitim) return null;

  const handlePrint = () => {
    window.print();
  };

  const buyukToplam = (dagitim.buyuk_adet || 0) * (dagitim.buyuk_birim_fiyat || 0);
  const kucukToplam = (dagitim.kucuk_adet || 0) * (dagitim.kucuk_birim_fiyat || 0);
  const iadeKovaToplam = (dagitim.iade_kova_adet || 0) * (dagitim.iade_kova_birim_fiyat || 0);
  const iadeBuyukToplam = (dagitim.iade_buyuk_adet || 0) * (dagitim.buyuk_birim_fiyat || 0);
  const iadeKucukToplam = (dagitim.iade_kucuk_adet || 0) * (dagitim.kucuk_birim_fiyat || 0);

  let odemeTutari = 0;
  if (dagitim.odeme_durumu === "odendi") {
    odemeTutari = dagitim.toplam_tutar;
  } else if (dagitim.odeme_durumu === "kismi") {
    odemeTutari = dagitim.odenen_tutar;
  } else {
    odemeTutari = 0;
  }

  const kalanTutar = Math.max(0, dagitim.toplam_tutar - odemeTutari);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
        <motion.div
          initial={{ scale: 0.92, y: 16, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.92, y: 16, opacity: 0 }}
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
          className="bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-sm w-full max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Ekran Başlığı (Yazdırmada Gizli) */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 flex items-center justify-between no-print shrink-0">
            <div className="flex items-center gap-2">
              <Printer className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="font-extrabold text-xs uppercase tracking-wider text-amber-700 dark:text-amber-400">
                Teslimat Fişi Önizleme
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Termal Fiş Gövdesi (Yazdırılan Beyaz Alan) */}
          <div
            id="thermal-receipt"
            className="p-6 font-mono text-xs text-black space-y-3 bg-white overflow-y-auto flex-1 scrollbar-thin"
          >
            {/* Bademcioğlu Kurumsal Başlık */}
            <div className="border-b border-dashed border-black pb-3">
              <BademciogluLogo size="receipt" />
              <div className="text-center text-[10px] text-black font-semibold mt-1">
                Tarih: {formatDate(dagitim.tarih)}
              </div>
            </div>

            {/* Müşteri İsmi */}
            <div className="text-center py-1">
              <div className="text-[10px] uppercase font-semibold text-neutral-600">Müşteri</div>
              <h2 className="font-black text-sm uppercase tracking-wide text-black">
                {dagitim.musteri_adi}
              </h2>
            </div>

            {/* Ürün Listesi */}
            <div className="space-y-1.5 py-2 border-t border-b border-dashed border-black">
              {/* Büyük Yoğurt */}
              {dagitim.buyuk_adet > 0 && (
                <div className="flex justify-between items-center text-xs">
                  <span>
                    Büyük Yoğurt <span className="font-bold">x{dagitim.buyuk_adet}</span>{" "}
                    <span className="text-[10px] text-neutral-600">
                      (@{formatCurrency(dagitim.buyuk_birim_fiyat)})
                    </span>
                  </span>
                  <span className="font-bold">{formatCurrency(buyukToplam)}</span>
                </div>
              )}

              {/* Küçük Yoğurt */}
              {dagitim.kucuk_adet > 0 && (
                <div className="flex justify-between items-center text-xs">
                  <span>
                    Küçük Yoğurt <span className="font-bold">x{dagitim.kucuk_adet}</span>{" "}
                    <span className="text-[10px] text-neutral-600">
                      (@{formatCurrency(dagitim.kucuk_birim_fiyat)})
                    </span>
                  </span>
                  <span className="font-bold">{formatCurrency(kucukToplam)}</span>
                </div>
              )}

              {/* Boş Kova İade */}
              {dagitim.iade_kova_adet > 0 && (
                <div className="flex justify-between items-center text-xs">
                  <span>
                    İade Kova <span className="font-bold">x{dagitim.iade_kova_adet}</span>{" "}
                    <span className="text-[10px]">(@-{formatCurrency(dagitim.iade_kova_birim_fiyat)})</span>
                  </span>
                  <span className="font-bold">-{formatCurrency(iadeKovaToplam)}</span>
                </div>
              )}

              {/* İade Büyük Yoğurt */}
              {dagitim.iade_buyuk_adet > 0 && (
                <div className="flex justify-between items-center text-xs">
                  <span>
                    İade Büyük Yoğurt <span className="font-bold">x{dagitim.iade_buyuk_adet}</span>{" "}
                    <span className="text-[10px]">(@-{formatCurrency(dagitim.buyuk_birim_fiyat)})</span>
                  </span>
                  <span className="font-bold">-{formatCurrency(iadeBuyukToplam)}</span>
                </div>
              )}

              {/* İade Küçük Yoğurt */}
              {dagitim.iade_kucuk_adet > 0 && (
                <div className="flex justify-between items-center text-xs">
                  <span>
                    İade Küçük Yoğurt <span className="font-bold">x{dagitim.iade_kucuk_adet}</span>{" "}
                    <span className="text-[10px]">(@-{formatCurrency(dagitim.kucuk_birim_fiyat)})</span>
                  </span>
                  <span className="font-bold">-{formatCurrency(iadeKucukToplam)}</span>
                </div>
              )}
            </div>

            {/* Genel Toplam */}
            <div className="space-y-1 pt-1 border-b border-dashed border-black pb-2">
              <div className="flex justify-between items-center text-xs font-black">
                <span>NET TOPLAM:</span>
                <span>{formatCurrency(dagitim.toplam_tutar)}</span>
              </div>

              {/* Ödeme Bilgisi */}
              <div className="flex justify-between items-center text-xs">
                <span>
                  Ödeme{" "}
                  <span className="text-[10px] text-neutral-600 font-semibold">
                    ({dagitim.odeme_durumu === "odendi" ? "Tamamı Ödendi" : dagitim.odeme_durumu === "kismi" ? "Kısmi" : "Ödenmedi"})
                  </span>
                  :
                </span>
                <span className="font-bold">{formatCurrency(odemeTutari)}</span>
              </div>

              {/* Kalan Tutar */}
              <div className="flex justify-between items-center text-xs font-bold">
                <span>KALAN BORÇ:</span>
                <span>{formatCurrency(kalanTutar)}</span>
              </div>
            </div>

            {/* Alt Bilgi */}
            <div className="text-center pt-2 space-y-0.5">
              <p className="text-[10px] font-bold uppercase tracking-tight text-neutral-800">
                Mali değeri yoktur
              </p>
              <p className="text-[9px] text-neutral-600">
                Afiyet Olsun • Bademcioğlu Yoğurtları
              </p>
            </div>
          </div>

          {/* Yazdırma ve Kapatma Butonları (Yazdırmada Gizli) */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 no-print">
            <button
              type="button"
              id="fis-kapat-btn"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 transition-all"
            >
              Kapat
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold shadow-md shadow-amber-500/20 flex items-center gap-2 active:scale-95 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Fişi Yazdır</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
