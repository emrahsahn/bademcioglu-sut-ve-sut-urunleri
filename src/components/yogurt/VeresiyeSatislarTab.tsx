"use client";

import React, { useState } from "react";
import { YogurtMusteri, YogurtDagitim, OdemeDurumu } from "@/types/database";
import { dataService } from "@/services";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import Modal from "@/components/ui/Modal";
import {
  Wallet,
  Search,
  Calendar,
  ChevronRight,
  Receipt,
  Clock,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  Sparkles,
  Layers,
} from "lucide-react";

interface VeresiyeSatislarTabProps {
  musteriler: YogurtMusteri[];
  dagitimlar: YogurtDagitim[];
  onRefresh?: () => Promise<void>;
  onNavigateToDagitim?: () => void;
}

export default function VeresiyeSatislarTab({
  musteriler,
  dagitimlar,
  onRefresh,
}: VeresiyeSatislarTabProps) {
  const { success, error } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMusteri, setSelectedMusteri] = useState<YogurtMusteri | null>(null);

  // Tekil Dağıtım Tahsilat Modalı State
  const [selectedDagitim, setSelectedDagitim] = useState<YogurtDagitim | null>(null);
  const [odemeTipi, setOdemeTipi] = useState<"tam" | "kismi">("tam");
  const [alinanTutar, setAlinanTutar] = useState<string>("");
  const [submittingPayment, setSubmittingPayment] = useState(false);

  // Toplu Tahsilat Modalı State
  const [isBatchOpen, setIsBatchOpen] = useState(false);
  const [batchAlinanTutar, setBatchAlinanTutar] = useState<string>("");
  const [submittingBatch, setSubmittingBatch] = useState(false);

  const borcluMusteriler = musteriler.filter((m) => (m.bakiye || 0) > 0);

  const filteredMusteriler = borcluMusteriler.filter((m) =>
    m.ad.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toplamVeresiyeAlacagi = borcluMusteriler.reduce((sum, m) => sum + (m.bakiye || 0), 0);

  // Seçili müşterinin açık borçlu kayıtları
  const musteriVeresiyeKayitlari = selectedMusteri
    ? dagitimlar
        .filter((d) => d.musteri_id === selectedMusteri.id && (d.kalan_tutar || 0) > 0)
        .sort((a, b) => (a.tarih > b.tarih ? 1 : -1)) // Eskiden yeniye sıralı
    : [];

  // Güncel seçili müşteriyi listeden dinamik al
  const currentActiveMusteri = selectedMusteri
    ? musteriler.find((m) => m.id === selectedMusteri.id) || selectedMusteri
    : null;

  // --- Tekil Dağıtım Tahsilatını Başlat ---
  const handleOpenDagitimPayment = (d: YogurtDagitim) => {
    setSelectedDagitim(d);
    setOdemeTipi("tam");
    setAlinanTutar((d.kalan_tutar || 0).toString());
  };

  // --- Tekil Dağıtım Tahsilatını Kaydet ---
  const handleSaveDagitimPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDagitim) return;

    try {
      setSubmittingPayment(true);
      const toplam = selectedDagitim.toplam_tutar;
      const mevcutOdenen = selectedDagitim.odenen_tutar || 0;
      const mevcutKalan = selectedDagitim.kalan_tutar || 0;

      let tahsilEdilenMiktar = 0;
      if (odemeTipi === "tam") {
        tahsilEdilenMiktar = mevcutKalan;
      } else {
        tahsilEdilenMiktar = parseFloat(alinanTutar.replace(",", ".")) || 0;
      }

      if (tahsilEdilenMiktar <= 0) {
        error("Lütfen geçerli bir tahsilat tutarı giriniz.");
        return;
      }

      if (tahsilEdilenMiktar > mevcutKalan) {
        error(`Tahsil edilen tutar kalan borçtan (${formatCurrency(mevcutKalan)}) büyük olamaz.`);
        return;
      }

      const yeniOdenen = mevcutOdenen + tahsilEdilenMiktar;
      const yeniKalan = Math.max(0, toplam - yeniOdenen);
      const yeniDurum: OdemeDurumu = yeniKalan === 0 ? "odendi" : "kismi";

      await dataService.updateYogurtDagitim(selectedDagitim.id, {
        odenen_tutar: yeniOdenen,
        kalan_tutar: yeniKalan,
        odeme_durumu: yeniDurum,
      });

      success(`${formatCurrency(tahsilEdilenMiktar)} tahsilat başarıyla kaydedildi.`);
      setSelectedDagitim(null);
      if (onRefresh) await onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Tahsilat kaydedilirken hata oluştu.";
      error(msg);
    } finally {
      setSubmittingPayment(false);
    }
  };

  // --- Müşteriden Toplu Tahsilat Yap (Eski Borçlardan Düşerek Dağıt) ---
  const handleSaveBatchPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentActiveMusteri) return;

    const odenecekToplam = parseFloat(batchAlinanTutar.replace(",", ".")) || 0;
    if (odenecekToplam <= 0) {
      error("Lütfen geçerli bir tahsilat tutarı giriniz.");
      return;
    }

    if (odenecekToplam > (currentActiveMusteri.bakiye || 0)) {
      error(
        `Girilen tutar toplam borçtan (${formatCurrency(
          currentActiveMusteri.bakiye || 0
        )}) fazla olamaz.`
      );
      return;
    }

    try {
      setSubmittingBatch(true);
      let kalanHavuz = odenecekToplam;

      // En eski vadeli borçtan başlayarak tahsilatı düş
      for (const d of musteriVeresiyeKayitlari) {
        if (kalanHavuz <= 0) break;

        const buKaydinKalani = d.kalan_tutar || 0;
        const dusulecek = Math.min(buKaydinKalani, kalanHavuz);

        const yeniOdenen = (d.odenen_tutar || 0) + dusulecek;
        const yeniKalan = Math.max(0, d.toplam_tutar - yeniOdenen);
        const yeniDurum: OdemeDurumu = yeniKalan === 0 ? "odendi" : "kismi";

        await dataService.updateYogurtDagitim(d.id, {
          odenen_tutar: yeniOdenen,
          kalan_tutar: yeniKalan,
          odeme_durumu: yeniDurum,
        });

        kalanHavuz -= dusulecek;
      }

      success(
        `${currentActiveMusteri.ad} için ${formatCurrency(
          odenecekToplam
        )} toplu tahsilat başarıyla düşüldü.`
      );
      setIsBatchOpen(false);
      setBatchAlinanTutar("");
      if (onRefresh) await onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Toplu tahsilat kaydedilirken hata oluştu.";
      error(msg);
    } finally {
      setSubmittingBatch(false);
    }
  };

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
          <h4 className="font-black text-slate-900 dark:text-white text-base">
            Açık Veresiye Bulunmuyor
          </h4>
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

                {/* Alt: Toplam Borcu & Tahsilat Aksiyonu */}
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block">
                      Kalan Borç:
                    </span>
                    <span className="text-lg font-black text-rose-700 dark:text-rose-400 num-mono">
                      {formatCurrency(m.bakiye || 0)}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 group-hover:underline">
                    <span>Tahsil Et</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Müşteri Detay ve Borç Dökümü Modalı */}
      <Modal
        isOpen={!!currentActiveMusteri}
        onClose={() => setSelectedMusteri(null)}
        title={`${currentActiveMusteri?.ad || ""} — Veresiye Hareketleri`}
        description="Açık teslimatları inceleyin, tek tek veya toplu ödeme tahsilatı yapın"
        maxWidth="3xl"
      >
        <div className="space-y-5">
          {/* Toplam Borç ve Toplu Tahsilat Butonu */}
          <div className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div>
              <span className="text-xs font-bold text-rose-900 dark:text-rose-300 block uppercase tracking-wide">
                Müşteri Güncel Toplam Borcu:
              </span>
              <span className="text-3xl font-black text-rose-700 dark:text-rose-400 num-mono mt-0.5 block">
                {formatCurrency(currentActiveMusteri?.bakiye || 0)}
              </span>
            </div>

            {(currentActiveMusteri?.bakiye || 0) > 0 && (
              <button
                onClick={() => {
                  setBatchAlinanTutar((currentActiveMusteri?.bakiye || 0).toString());
                  setIsBatchOpen(true);
                }}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-black shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all shrink-0"
              >
                <DollarSign className="w-4 h-4" />
                <span>Toplu Ödeme Al</span>
              </button>
            )}
          </div>

          {/* Açık Teslimat Satırları Listesi */}
          <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1 scrollbar-thin">
            {musteriVeresiyeKayitlari.length === 0 ? (
              <div className="py-12 text-center text-slate-500 dark:text-slate-400 text-xs">
                Açık veresiye satırı bulunmuyor.
              </div>
            ) : (
              musteriVeresiyeKayitlari.map((k) => (
                <div
                  key={k.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-200 dark:border-rose-900">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-black text-sm text-slate-900 dark:text-white block num-mono">
                        {formatDate(k.tarih)}
                      </span>
                      <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-slate-600 dark:text-slate-400 font-medium">
                        {k.buyuk_adet > 0 && (
                          <span className="bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px] font-bold text-slate-800 dark:text-slate-200">
                            {k.buyuk_adet} Büyük
                          </span>
                        )}
                        {k.kucuk_adet > 0 && (
                          <span className="bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px] font-bold text-slate-800 dark:text-slate-200">
                            {k.kucuk_adet} Küçük
                          </span>
                        )}
                        {k.odeme_durumu === "kismi" && (
                          <span className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded text-[10px] font-bold border border-amber-300 dark:border-amber-800">
                            Kısmi Ödeme Yapılmış
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-slate-800">
                    <div className="text-left sm:text-right">
                      <span className="text-sm font-black text-rose-700 dark:text-rose-400 block num-mono">
                        Kalan: {formatCurrency(k.kalan_tutar)}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 num-mono block">
                        Toplam: {formatCurrency(k.toplam_tutar)} (Ödenen: {formatCurrency(k.odenen_tutar || 0)})
                      </span>
                    </div>

                    <button
                      onClick={() => handleOpenDagitimPayment(k)}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black text-xs shadow-sm flex items-center gap-1.5 transition-all shrink-0"
                    >
                      <DollarSign className="w-4 h-4" />
                      <span>Tahsil Et</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
            <button
              onClick={() => setSelectedMusteri(null)}
              className="px-6 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-300 dark:border-slate-700 transition-all tactile-btn"
            >
              Kapat
            </button>
          </div>
        </div>
      </Modal>

      {/* Tekil Teslimat Tahsilat Modalı */}
      <Modal
        isOpen={!!selectedDagitim}
        onClose={() => setSelectedDagitim(null)}
        title="Teslimat Tahsilatı Yap"
        description={`${selectedDagitim?.musteri_adi || ""} — ${
          selectedDagitim ? formatDate(selectedDagitim.tarih) : ""
        }`}
        maxWidth="xl"
      >
        {selectedDagitim && (
          <form onSubmit={handleSaveDagitimPayment} className="space-y-5">
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-bold">Toplam Fiş Tutarı:</span>
                <span className="font-mono text-base font-bold text-slate-900 dark:text-white">
                  {formatCurrency(selectedDagitim.toplam_tutar)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-bold">Şu Anki Kalan Borç:</span>
                <span className="font-mono text-base font-black text-rose-600 dark:text-rose-400">
                  {formatCurrency(selectedDagitim.kalan_tutar)}
                </span>
              </div>
            </div>

            {/* Ödeme Tipi Seçimi */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Tahsilat Şekli
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setOdemeTipi("tam");
                    setAlinanTutar((selectedDagitim.kalan_tutar || 0).toString());
                  }}
                  className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                    odemeTipi === "tam"
                      ? "bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-500/20"
                      : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Borcun Tamamı ({formatCurrency(selectedDagitim.kalan_tutar)})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setOdemeTipi("kismi")}
                  className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                    odemeTipi === "kismi"
                      ? "bg-amber-500 text-slate-950 border-amber-600 shadow-md shadow-amber-500/20"
                      : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Kısmi Tahsilat</span>
                </button>
              </div>
            </div>

            {/* Tahsil Edilen Tutar Girişi */}
            {odemeTipi === "kismi" && (
              <div className="space-y-2 p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60">
                <label className="text-xs font-bold text-amber-950 dark:text-amber-300 block">
                  Tahsil Edilen Tutar (TL)
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  min="1"
                  max={selectedDagitim.kalan_tutar}
                  value={alinanTutar}
                  onChange={(e) => setAlinanTutar(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-base font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-amber-500 shadow-sm"
                />
              </div>
            )}

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedDagitim(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={submittingPayment}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all"
              >
                {submittingPayment ? "Kaydediliyor..." : "Tahsilatı Onayla"}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Toplu Tahsilat Modalı */}
      <Modal
        isOpen={isBatchOpen}
        onClose={() => setIsBatchOpen(false)}
        title="Toplu Borç Tahsilatı"
        description={`${currentActiveMusteri?.ad || ""} hesabına toplu para girişi yapın`}
        maxWidth="xl"
      >
        <form onSubmit={handleSaveBatchPayment} className="space-y-5">
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-300 leading-relaxed font-medium">
            Girilen tahsilat miktarı, müşterinin en eski tarihli borçlarından başlanarak sırasıyla
            tüm açık teslimat kayıtlarına otomatik dağıtılacaktır.
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
              Alınan Toplam Tutar (TL)
            </label>
            <input
              type="number"
              step="any"
              required
              min="1"
              max={currentActiveMusteri?.bakiye || 0}
              value={batchAlinanTutar}
              onChange={(e) => setBatchAlinanTutar(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-lg font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500 shadow-sm"
            />
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-1 font-medium">
              Maksimum Kalan Borç: {formatCurrency(currentActiveMusteri?.bakiye || 0)}
            </span>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsBatchOpen(false)}
              className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={submittingBatch}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 disabled:opacity-50 flex items-center gap-2 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{submittingBatch ? "İşleniyor..." : "Toplu Tahsilatı Onayla"}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
