"use client";

import React, { useState } from "react";
import { YogurtMusteri, YogurtDagitim } from "@/types/database";
import { formatCurrency, formatDate } from "@/lib/utils";
import Modal from "@/components/ui/Modal";
import {
  Wallet,
  Search,
  Calendar,
  ChevronRight,
  Receipt,
  Clock,
} from "lucide-react";

interface VeresiyeSatislarTabProps {
  musteriler: YogurtMusteri[];
  dagitimlar: YogurtDagitim[];
  onRefresh?: () => Promise<void>;
  onNavigateToDagitim?: () => void;
}

export default function VeresiyeSatislarTab({ musteriler, dagitimlar }: VeresiyeSatislarTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMusteri, setSelectedMusteri] = useState<YogurtMusteri | null>(null);

  const borcluMusteriler = musteriler.filter((m) => (m.bakiye || 0) > 0);

  const filteredMusteriler = borcluMusteriler.filter((m) =>
    m.ad.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toplamVeresiyeAlacagi = borcluMusteriler.reduce((sum, m) => sum + (m.bakiye || 0), 0);

  const musteriVeresiyeKayitlari = selectedMusteri
    ? dagitimlar.filter((d) => d.musteri_id === selectedMusteri.id && (d.kalan_tutar || 0) > 0)
    : [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Üst Özet Bento Kartı & Arama */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-rose-50/60 dark:bg-rose-950/30 p-6 rounded-2xl border border-rose-200 dark:border-rose-800/60 text-slate-900 dark:text-white shadow-sm">
        <div>
          <span className="text-xs font-black text-rose-800 dark:text-rose-300 uppercase tracking-wider flex items-center gap-2">
            <Wallet className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span>Toplam Açık Veresiye Alacağı</span>
          </span>
          <h3 className="text-3xl font-black text-rose-700 dark:text-rose-400 mt-1 num-mono">
            {formatCurrency(toplamVeresiyeAlacagi)}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
            {borcluMusteriler.length} müşteride tahsil edilmemiş açık bakiye var
          </p>
        </div>

        <div className="relative w-full sm:w-72 self-start sm:self-auto">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Borçlu müşteri ara..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 placeholder:text-slate-400 shadow-sm"
          />
        </div>
      </div>

      {/* Kutu Kutu Müşteriler Bento Grid */}
      {filteredMusteriler.length === 0 ? (
        <div className="bento-card bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 p-16 text-center shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 mx-auto flex items-center justify-center mb-3">
            <Receipt className="w-6 h-6" />
          </div>
          <h4 className="font-black text-slate-900 dark:text-white text-base">Açık Veresiye Bulunmuyor</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto font-medium">
            Tüm yoğurt teslimatlarının tahsilatı eksiksiz yapılmış, bekleyen alacak yok.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredMusteriler.map((m) => {
            const veresiyeAdet = dagitimlar.filter(
              (d) => d.musteri_id === m.id && (d.kalan_tutar || 0) > 0
            ).length;

            return (
              <div
                key={m.id}
                onClick={() => setSelectedMusteri(m)}
                className="group cursor-pointer bento-card bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 p-5 hover:border-rose-400 dark:hover:border-rose-500/70 transition-all duration-200 flex flex-col justify-between tactile-btn"
              >
                {/* Üst: İsim */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-black text-slate-900 dark:text-white text-sm group-hover:text-rose-700 dark:group-hover:text-rose-400 transition-colors line-clamp-1">
                      {m.ad}
                    </h4>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5 font-medium">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{veresiyeAdet} adet vadeli işlem</span>
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Alt: Toplam Borcu */}
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-baseline justify-between">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Toplam Borç:
                  </span>
                  <span className="text-lg font-black text-rose-700 dark:text-rose-400 num-mono">
                    {formatCurrency(m.bakiye || 0)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Kutuya Basınca Açılan Detay Modal */}
      <Modal
        isOpen={!!selectedMusteri}
        onClose={() => setSelectedMusteri(null)}
        title={`${selectedMusteri?.ad || ""} — Veresiye Hareketleri`}
        description="Bu müşteriye ait açık ve ödenmemiş satış kayıtları"
      >
        <div className="space-y-4">
          {/* Toplam Borç Başlığı */}
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center justify-between">
            <span className="text-xs font-bold text-rose-900 dark:text-rose-300">Güncel Toplam Borç:</span>
            <span className="text-lg font-black text-rose-700 dark:text-rose-400 num-mono">
              {formatCurrency(selectedMusteri?.bakiye || 0)}
            </span>
          </div>

          {/* Sadece Tarih ve Tutar Listesi */}
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1 scrollbar-thin">
            {musteriVeresiyeKayitlari.length === 0 ? (
              <div className="py-8 text-center text-slate-500 dark:text-slate-400 text-xs">
                Açık veresiye satırı bulunmuyor.
              </div>
            ) : (
              musteriVeresiyeKayitlari.map((k) => (
                <div
                  key={k.id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    <div>
                      <span className="font-black text-slate-900 dark:text-white block num-mono">{formatDate(k.tarih)}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        {k.odeme_durumu === "kismi" ? "Kısmi Ödeme Yapılmış" : "Hiç Ödeme Yapılmadı"}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black text-rose-700 dark:text-rose-400 block num-mono">
                      {formatCurrency(k.kalan_tutar)}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 num-mono">
                      Toplam: {formatCurrency(k.toplam_tutar)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
            <button
              onClick={() => setSelectedMusteri(null)}
              className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-300 dark:border-slate-700 transition-all tactile-btn"
            >
              Kapat
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
