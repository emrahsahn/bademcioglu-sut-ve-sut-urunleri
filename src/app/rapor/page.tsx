"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import { dataService } from "@/services";
import { Mustahsil, SutKaydi, HesapKapama } from "@/types/database";
import { formatCurrency, formatDate, formatDateTime, formatKg } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import ReceiptModal from "@/components/ui/ReceiptModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Modal from "@/components/ui/Modal";
import {
  FileSpreadsheet,
  Search,
  Printer,
  Lock,
  History,
  Scale,
  DollarSign,
  User,
  Calendar,
  Layers,
  ChevronRight,
  Eye,
  Sparkles,
} from "lucide-react";

export default function RaporPage() {
  const { success, error, info } = useToast();

  const [mustahsiller, setMustahsiller] = useState<Mustahsil[]>([]);
  const [selectedMustahsilId, setSelectedMustahsilId] = useState<string>("");
  const [aktifKayitlar, setAktifKayitlar] = useState<SutKaydi[]>([]);
  const [eskiKayitlar, setEskiKayitlar] = useState<HesapKapama[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"aktif" | "eski">("aktif");
  const [searchTerm, setSearchTerm] = useState("");

  // Fiş Yazdırma Modalı
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [archiveReceiptTarget, setArchiveReceiptTarget] = useState<HesapKapama | null>(null);

  // Hesap Kapatma Dialogu
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  // Eski Kayıt Detay Modalı
  const [viewingArchive, setViewingArchive] = useState<HesapKapama | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    try {
      setLoading(true);
      const mList = await dataService.getMustahsiller();
      setMustahsiller(mList);

      if (mList.length > 0) {
        setSelectedMustahsilId(mList[0].id);
        await loadMustahsilReports(mList[0].id);
      }
    } catch (err) {
      error("Müstahsil listesi yüklenirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  async function loadMustahsilReports(mId: string) {
    try {
      const [kayitlar, eski] = await Promise.all([
        dataService.getSutKayitlari(mId, "aktif"),
        dataService.getEskiKayitlar(mId),
      ]);
      setAktifKayitlar(kayitlar);
      setEskiKayitlar(eski);
    } catch (err) {
      error("Rapor kayıtları yüklenemedi.");
    }
  }

  const handleSelectMustahsil = async (mId: string) => {
    setSelectedMustahsilId(mId);
    await loadMustahsilReports(mId);
  };

  const selectedMustahsil = mustahsiller.find((m) => m.id === selectedMustahsilId);

  // Aktif Kayıt Hesaplamaları
  const toplamKg = aktifKayitlar.reduce((sum, item) => sum + item.kg, 0);
  const birimFiyat = selectedMustahsil?.birim_fiyat || 0;
  const toplamTutar = toplamKg * birimFiyat;

  // Hesap Kapatma İşlemi
  const handleHesabiKapat = async () => {
    if (!selectedMustahsilId) return;
    try {
      setClosing(true);
      const yeniKapama = await dataService.hesabiKapat(selectedMustahsilId);
      success(
        `${selectedMustahsil?.ad} için ${formatCurrency(
          yeniKapama.toplam_tutar
        )} tutarındaki hesap başarıyla kapatıldı ve arşive taşındı.`
      );

      // Verileri yenile
      await loadMustahsilReports(selectedMustahsilId);
      setConfirmCloseOpen(false);
    } catch (err: any) {
      error(err.message || "Hesap kapatılırken hata oluştu.");
    } finally {
      setClosing(false);
    }
  };

  const filteredMustahsiller = mustahsiller.filter((m) =>
    m.ad.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <Header
        title="Raporlama, Fiş Yazdırma & Hesap Kapatma"
        subtitle="Müstahsil bazlı açık teslimat dökümü, termal fiş çıktısı ve dönem kapama arşivi"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sol Kolon: Müstahsil Seçici */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-[#101726] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Müstahsil Ara / Seç
              </span>
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {mustahsiller.length} Üretici
              </span>
            </div>

            {/* Arama Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="İsim ile hızlı filtrele..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-emerald-500 transition-all"
              />
            </div>

            {/* Müstahsil Listesi */}
            <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
              {filteredMustahsiller.map((m) => {
                const isSelected = m.id === selectedMustahsilId;
                return (
                  <button
                    key={m.id}
                    onClick={() => handleSelectMustahsil(m.id)}
                    className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between group ${
                      isSelected
                        ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700 shadow-sm"
                        : "bg-white dark:bg-[#101726] border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <div>
                      <h4
                        className={`font-bold text-xs ${
                          isSelected ? "text-emerald-950 dark:text-emerald-200" : "text-slate-800 dark:text-slate-200"
                        }`}
                      >
                        {m.ad}
                      </h4>
                      <p
                        className={`text-[11px] mt-0.5 font-mono ${
                          isSelected ? "text-emerald-700 dark:text-emerald-400 font-bold" : "text-slate-400"
                        }`}
                      >
                        Birim: {formatCurrency(m.birim_fiyat)}/kg
                      </p>
                    </div>
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                        isSelected
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 group-hover:text-slate-700 dark:group-hover:text-slate-200"
                      }`}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sağ Kolon: Rapor Detayı & Aksiyonlar */}
        <div className="lg:col-span-8 space-y-4">
          {selectedMustahsil ? (
            <>
              {/* Seçili Müstahsil Başlık & Sekmeler */}
              <div className="bg-white dark:bg-[#101726] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <h3 className="font-serif font-bold text-slate-900 dark:text-white text-lg">
                      {selectedMustahsil.ad}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Kayıtlı Alış Fiyatı:{" "}
                    <strong className="text-emerald-600 dark:text-emerald-400 font-mono">
                      {formatCurrency(selectedMustahsil.birim_fiyat)} / kg
                    </strong>
                  </p>
                </div>

                {/* Sekmeler */}
                <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
                  <button
                    onClick={() => setActiveTab("aktif")}
                    className={`px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                      activeTab === "aktif"
                        ? "bg-white dark:bg-[#101726] text-slate-900 dark:text-white shadow-sm"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    Aktif Dönem ({aktifKayitlar.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("eski")}
                    className={`px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                      activeTab === "eski"
                        ? "bg-white dark:bg-[#101726] text-slate-900 dark:text-white shadow-sm"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <History className="w-3.5 h-3.5 text-slate-400" />
                    <span>Eski Kayıtlar ({eskiKayitlar.length})</span>
                  </button>
                </div>
              </div>

              {/* Sekme 1: Aktif Dönem Raporu */}
              {activeTab === "aktif" && (
                <div className="space-y-4">
                  {/* Özet ve Butonlar */}
                  <div className="bg-gradient-to-br from-emerald-50/60 dark:from-emerald-950/20 via-white dark:via-[#101726] to-slate-50 dark:to-slate-900 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 text-slate-900 dark:text-slate-100 shadow-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pb-5 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                          Toplam Teslim Edilen Süt
                        </span>
                        <h4 className="text-3xl font-mono font-bold text-slate-900 dark:text-white mt-1">
                          {formatKg(toplamKg)}
                        </h4>
                        <span className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1 block">
                          {aktifKayitlar.length} Teslimat girişi
                        </span>
                      </div>

                      <div>
                        <span className="text-xs font-mono font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                          Toplam Ödenecek Tutar
                        </span>
                        <h4 className="text-3xl font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                          {formatCurrency(toplamTutar)}
                        </h4>
                        <span className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1 block">
                          {formatKg(toplamKg)} × {formatCurrency(birimFiyat)}
                        </span>
                      </div>
                    </div>

                    {/* Aksiyon Butonları */}
                    <div className="pt-4 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        disabled={aktifKayitlar.length === 0}
                        onClick={() => setReceiptOpen(true)}
                        className="px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 flex items-center gap-2 transition-all disabled:opacity-40 shadow-sm"
                      >
                        <Printer className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Rapor Yazdır (Termal Fiş)</span>
                      </button>

                      <button
                        type="button"
                        disabled={aktifKayitlar.length === 0}
                        onClick={() => setConfirmCloseOpen(true)}
                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center gap-2 transition-all disabled:opacity-40"
                      >
                        <Lock className="w-4 h-4" />
                        <span>Hesabı Kapat & Ödendi İşle</span>
                      </button>
                    </div>
                  </div>

                  {/* Süt Kayıtları Tablosu */}
                  <div className="bg-white dark:bg-[#101726] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <h4 className="font-serif font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                        Teslimat Döküm Tablosu
                      </h4>
                      <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                        {aktifKayitlar.length} Gün / Kayıt
                      </span>
                    </div>

                    {aktifKayitlar.length === 0 ? (
                      <div className="p-12 text-center text-slate-400">
                        <FileSpreadsheet className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                        <p className="text-xs">Bu müstahsile ait açık süt kaydı bulunmuyor.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-mono font-bold border-b border-slate-200 dark:border-slate-700">
                            <tr>
                              <th className="py-3 px-4">#</th>
                              <th className="py-3 px-4">Teslimat Tarihi</th>
                              <th className="py-3 px-4 text-right">Miktar (Kg)</th>
                              <th className="py-3 px-4 text-right">Birim Fiyat</th>
                              <th className="py-3 px-4 text-right">Tutar (TL)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {aktifKayitlar.map((k, index) => (
                              <tr key={k.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                                <td className="py-3 px-4 text-slate-400 font-mono">
                                  {index + 1}
                                </td>
                                <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                                  {formatDate(k.tarih)}
                                </td>
                                <td className="py-3 px-4 text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                                  {k.kg.toFixed(1)} kg
                                </td>
                                <td className="py-3 px-4 text-right font-mono text-slate-500 dark:text-slate-400">
                                  {formatCurrency(birimFiyat)}
                                </td>
                                <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                  {formatCurrency(k.kg * birimFiyat)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Sekme 2: Eski Kayıtlar (Kapatılmış Dönemler) */}
              {activeTab === "eski" && (
                <div className="bg-white dark:bg-[#101726] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <h4 className="font-serif font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                      Geçmiş Dönem Hesap Kapama Kayıtları
                    </h4>
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                      Toplam {eskiKayitlar.length} Kapanış
                    </span>
                  </div>

                  {eskiKayitlar.length === 0 ? (
                    <div className="p-12 text-center text-slate-400">
                      <History className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                      <p className="text-xs">Henüz kapatılmış bir hesap dönemi bulunmuyor.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {eskiKayitlar.map((hk) => (
                        <div
                          key={hk.id}
                          className="p-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 flex items-center justify-between transition-colors"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900 dark:text-white">
                                Kapama Tarihi: {formatDateTime(hk.kapama_tarihi)}
                              </span>
                              <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                                {hk.kayit_sayisi} Kayıt
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
                              Birim: {formatCurrency(hk.birim_fiyat)} | Toplam:{" "}
                              {formatKg(hk.toplam_kg)} süt
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
                              {formatCurrency(hk.toplam_tutar)}
                            </span>

                            <button
                              onClick={() => setViewingArchive(hk)}
                              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="Dönem Detayını İncele"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => {
                                setArchiveReceiptTarget(hk);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors border border-slate-200 dark:border-slate-700"
                            >
                              <Printer className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                              <span>Fiş</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="bg-white dark:bg-[#101726] p-16 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm text-center text-slate-400">
              <User className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <h4 className="font-serif font-bold text-slate-700 dark:text-slate-300 text-sm">Müstahsil Seçiniz</h4>
              <p className="text-xs text-slate-400 mt-1">
                Raporunu ve dökümünü görmek istediğiniz müstahsili soldaki listeden seçin.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Aktif Dönem Termal Fiş Modalı */}
      {selectedMustahsil && (
        <ReceiptModal
          isOpen={receiptOpen}
          onClose={() => setReceiptOpen(false)}
          mustahsil={selectedMustahsil}
          kayitlar={aktifKayitlar}
        />
      )}

      {/* Arşiv Termal Fiş Modalı */}
      {archiveReceiptTarget && (
        <ReceiptModal
          isOpen={!!archiveReceiptTarget}
          onClose={() => setArchiveReceiptTarget(null)}
          mustahsil={{
            ad: archiveReceiptTarget.mustahsil_adi,
            birim_fiyat: archiveReceiptTarget.birim_fiyat,
          }}
          kayitlar={archiveReceiptTarget.kayitlar || []}
          kapamaTarihi={archiveReceiptTarget.kapama_tarihi}
          isArchive={true}
        />
      )}

      {/* Hesap Kapatma Onay Dialogu */}
      <ConfirmDialog
        isOpen={confirmCloseOpen}
        onClose={() => setConfirmCloseOpen(false)}
        onConfirm={handleHesabiKapat}
        title="Hesabı Kapatmak İstiyor musunuz?"
        message={`${selectedMustahsil?.ad} adlı müstahsilin mevcut ${aktifKayitlar.length} teslimat kaydı kapatılacak, toplam ${formatCurrency(toplamTutar)} tutar ödendi olarak işaretlenip Eski Kayıtlar sekmesine taşınacaktır.`}
        confirmText="Evet, Hesabı Kapat"
        type="warning"
        loading={closing}
      />

      {/* Eski Kayıt Detay İnceleme Modalı */}
      <Modal
        isOpen={!!viewingArchive}
        onClose={() => setViewingArchive(null)}
        title="Kapatılmış Dönem Detayı"
        description={`${viewingArchive?.mustahsil_adi} - ${
          viewingArchive ? formatDateTime(viewingArchive.kapama_tarihi) : ""
        }`}
        maxWidth="lg"
      >
        {viewingArchive && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block font-mono">Kapatılan Süt</span>
                <strong className="text-slate-900 dark:text-white text-sm font-mono">
                  {formatKg(viewingArchive.toplam_kg)}
                </strong>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block font-mono">Birim Fiyat</span>
                <strong className="text-slate-900 dark:text-white text-sm font-mono">
                  {formatCurrency(viewingArchive.birim_fiyat)}/kg
                </strong>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block font-mono">Toplam Tutar</span>
                <strong className="text-emerald-600 dark:text-emerald-400 text-sm font-mono">
                  {formatCurrency(viewingArchive.toplam_tutar)}
                </strong>
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900/40">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono font-bold sticky top-0 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-2.5 px-3">Tarih</th>
                    <th className="py-2.5 px-3 text-right">Kg</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                  {(viewingArchive.kayitlar || []).map((k, idx) => (
                    <tr key={k.id || idx}>
                      <td className="py-2 px-3 text-slate-700 dark:text-slate-300">{formatDate(k.tarih)}</td>
                      <td className="py-2 px-3 text-right font-medium text-emerald-600 dark:text-emerald-400">
                        {k.kg.toFixed(1)} kg
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setViewingArchive(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors"
              >
                Kapat
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

