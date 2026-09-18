"use client";

import React, { useState } from "react";
import { YogurtMusteri, YogurtDagitim, OdemeDurumu } from "@/types/database";
import { dataService } from "@/services";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency, formatDate, getTodayDateString } from "@/lib/utils";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import {
  CalendarDays,
  Calendar,
  Plus,
  Trash2,
  Receipt,
  FileCheck,
} from "lucide-react";

interface EskiKayitlarTabProps {
  musteriler: YogurtMusteri[];
  dagitimlar: YogurtDagitim[];
  onRefresh: () => Promise<void>;
}

export default function EskiKayitlarTab({
  musteriler,
  dagitimlar,
  onRefresh,
}: EskiKayitlarTabProps) {
  const { success, error } = useToast();

  // Seçili Tarih
  const [selectedTarih, setSelectedTarih] = useState<string>(getTodayDateString());

  // Geriye Dönük Satış Ekleme Modalı State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addMusteriId, setAddMusteriId] = useState<string>("");
  const [addBuyukAdet, setAddBuyukAdet] = useState<string>("");
  const [addKucukAdet, setAddKucukAdet] = useState<string>("");
  const [addIadeKova, setAddIadeKova] = useState<string>("");
  const [addIadeBuyuk, setAddIadeBuyuk] = useState<string>("");
  const [addIadeKucuk, setAddIadeKucuk] = useState<string>("");
  const [addToplamTutar, setAddToplamTutar] = useState<string>("0");
  const [addOdemeDurumu, setAddOdemeDurumu] = useState<OdemeDurumu>("odendi");
  const [addOdenenTutar, setAddOdenenTutar] = useState<string>("0");
  const [isAddingHistorySale, setIsAddingHistorySale] = useState(false);

  // Silme Onayı
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Seçili tarihe ait dağıtımlar
  const gunKayitlari = dagitimlar.filter((d) => d.tarih === selectedTarih);

  // Hızlı Tarih Kısayolları
  const handleQuickDate = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    setSelectedTarih(d.toISOString().split("T")[0]);
  };


  // Geçmiş Tarihe Yeni Satış Hesapla
  const calculateAddTotal = () => {
    const targetM = musteriler.find((m) => m.id === addMusteriId);
    if (!targetM) return;

    const bFyt = targetM.buyuk_yogurt_fiyat || 200;
    const kFyt = targetM.kucuk_yogurt_fiyat || 120;
    const iFyt = targetM.iade_kova_fiyat || 30;

    const bAdt = parseInt(addBuyukAdet) || 0;
    const kAdt = parseInt(addKucukAdet) || 0;
    const iKova = parseInt(addIadeKova) || 0;
    const iBAdt = parseInt(addIadeBuyuk) || 0;
    const iKAdt = parseInt(addIadeKucuk) || 0;

    const urunler = bAdt * bFyt + kAdt * kFyt;
    const iadeler = iKova * iFyt + iBAdt * bFyt + iKAdt * kFyt;
    const sonuc = Math.max(0, urunler - iadeler);

    setAddToplamTutar(sonuc.toString());
    if (addOdemeDurumu === "odendi") setAddOdenenTutar(sonuc.toString());
    else if (addOdemeDurumu === "odenmedi") setAddOdenenTutar("0");
  };

  // Yeni Satış Kaydet
  const handleSaveAddHistorySale = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetM = musteriler.find((m) => m.id === addMusteriId);
    if (!targetM) {
      error("Lütfen bir müşteri seçiniz.");
      return;
    }

    const bAdt = parseInt(addBuyukAdet) || 0;
    const kAdt = parseInt(addKucukAdet) || 0;
    const iKova = parseInt(addIadeKova) || 0;
    const iBAdt = parseInt(addIadeBuyuk) || 0;
    const iKAdt = parseInt(addIadeKucuk) || 0;

    if (bAdt === 0 && kAdt === 0 && iKova === 0 && iBAdt === 0 && iKAdt === 0) {
      error("En az bir teslimat veya iade adedi giriniz.");
      return;
    }

    const top = parseFloat(addToplamTutar.replace(",", ".")) || 0;
    let odenen = 0;
    if (addOdemeDurumu === "odendi") odenen = top;
    else if (addOdemeDurumu === "odenmedi") odenen = 0;
    else odenen = parseFloat(addOdenenTutar.replace(",", ".")) || 0;

    const kalan = Math.max(0, top - odenen);

    try {
      setIsAddingHistorySale(true);
      await dataService.addYogurtDagitim({
        musteri_id: targetM.id,
        musteri_adi: targetM.ad,
        tarih: selectedTarih,
        buyuk_adet: bAdt,
        kucuk_adet: kAdt,
        iade_kova_adet: iKova,
        iade_buyuk_adet: iBAdt,
        iade_kucuk_adet: iKAdt,
        buyuk_birim_fiyat: targetM.buyuk_yogurt_fiyat || 200,
        kucuk_birim_fiyat: targetM.kucuk_yogurt_fiyat || 120,
        iade_kova_birim_fiyat: targetM.iade_kova_fiyat || 30,
        toplam_tutar: top,
        odeme_durumu: addOdemeDurumu,
        odenen_tutar: odenen,
        kalan_tutar: kalan,
        fatura_kesildi: false,
      });

      success(`${targetM.ad} için ${formatDate(selectedTarih)} tarihine satış eklendi.`);
      setIsAddOpen(false);
      setAddBuyukAdet("");
      setAddKucukAdet("");
      setAddIadeKova("");
      setAddIadeBuyuk("");
      setAddIadeKucuk("");
      setAddToplamTutar("0");
      setAddOdenenTutar("0");
      await onRefresh();
    } catch (err) {
      error("Satış eklenemedi.");
    } finally {
      setIsAddingHistorySale(false);
    }
  };

  // Silme Onayı
  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    try {
      await dataService.deleteYogurtDagitim(deleteTargetId);
      success("Dağıtım kaydı silindi ve müşteri bakiyesi düzeltildi.");
      setDeleteTargetId(null);
      await onRefresh();
    } catch (err) {
      error("Kayıt silinemedi.");
    }
  };

  // O Günün Mali Özeti
  const gunToplamCiro = gunKayitlari.reduce((acc, d) => acc + (d.toplam_tutar || 0), 0);
  const gunToplamTahsilat = gunKayitlari.reduce((acc, d) => acc + (d.odenen_tutar || 0), 0);
  const gunToplamKalan = gunKayitlari.reduce((acc, d) => acc + (d.kalan_tutar || 0), 0);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* 1. Tarih Seçici & Kısayol Bento Kartı */}
      <div className="bento-card bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <h3 className="font-black text-slate-900 dark:text-white text-sm">Tarih Bazında Dağıtım Kayıtları</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              İstediğiniz günü seçerek o günkü dağıtımları listeleyebilir, ödeme durumunu güncelleyebilirsiniz
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-3 py-1.5 rounded-xl">
              <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <input
                type="date"
                value={selectedTarih}
                onChange={(e) => setSelectedTarih(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-900 dark:text-white outline-none"
              />
            </div>

            <button
              onClick={() => {
                if (musteriler.length > 0) setAddMusteriId(musteriler[0].id);
                setIsAddOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-black shadow-md flex items-center gap-1.5 transition-all tactile-btn"
            >
              <Plus className="w-4 h-4" />
              <span>Bu Tarihe Satış Ekle</span>
            </button>
          </div>
        </div>

        {/* Hızlı Tarih Kısayolları */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-bold whitespace-nowrap text-[11px]">Kısayollar:</span>
          <button
            type="button"
            onClick={() => handleQuickDate(0)}
            className={`px-3 py-1 rounded-lg font-bold transition-colors tactile-btn ${
              selectedTarih === getTodayDateString()
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700"
            }`}
          >
            Bugün
          </button>
          <button
            type="button"
            onClick={() => handleQuickDate(1)}
            className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold border border-slate-300 dark:border-slate-700 tactile-btn"
          >
            Dün
          </button>
          <button
            type="button"
            onClick={() => handleQuickDate(3)}
            className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold border border-slate-300 dark:border-slate-700 tactile-btn"
          >
            3 Gün Önce
          </button>
          <button
            type="button"
            onClick={() => handleQuickDate(7)}
            className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold border border-slate-300 dark:border-slate-700 tactile-btn"
          >
            1 Hafta Önce
          </button>
        </div>
      </div>

      {/* 2. O Günün Mali Özeti Bento Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bento-card bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 p-4">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">O Günün Toplam Satışı</span>
          <h4 className="text-xl font-black text-slate-900 dark:text-white mt-1 num-mono">{formatCurrency(gunToplamCiro)}</h4>
        </div>
        <div className="bento-card bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 p-4 bento-glow-emerald">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Tahsil Edilen Tutar</span>
          <h4 className="text-xl font-black text-emerald-700 dark:text-emerald-400 mt-1 num-mono">{formatCurrency(gunToplamTahsilat)}</h4>
        </div>
        <div className="bento-card bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 p-4">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Açık Kalan Veresiye</span>
          <h4 className="text-xl font-black text-rose-700 dark:text-rose-400 mt-1 num-mono">{formatCurrency(gunToplamKalan)}</h4>
        </div>
      </div>

      {/* 3. O Gün Dağıtım Yapılan Müşteriler Bento Tablosu */}
      <div className="bento-card bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h4 className="font-black text-slate-900 dark:text-white text-sm">
            {formatDate(selectedTarih)} Tarihindeki Dağıtımlar ({gunKayitlari.length})
          </h4>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Ödeme durumunu değiştirmek için satıra tıklayın
          </span>
        </div>

        {gunKayitlari.length === 0 ? (
          <div className="py-16 text-center text-slate-500 dark:text-slate-400">
            <Calendar className="w-12 h-12 mx-auto text-slate-400 mb-2" />
            <h5 className="font-black text-slate-800 dark:text-slate-200 text-sm">Kayıt Bulunamadı</h5>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Bu tarihe ait henüz bir yoğurt dağıtım kaydı yapılmamış.
            </p>
            <button
              onClick={() => {
                if (musteriler.length > 0) setAddMusteriId(musteriler[0].id);
                setIsAddOpen(true);
              }}
              className="mt-3 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-black shadow inline-flex items-center gap-1.5 tactile-btn"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Bu Güne Kayıt Ekle</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Müşteri</th>
                  <th className="py-3 px-4">Teslimat Detayı</th>
                  <th className="py-3 px-4 text-right">Toplam Tutar</th>
                  <th className="py-3 px-4 text-center">Ödeme Durumu</th>
                  <th className="py-3 px-4 text-right">Kalan Borç</th>
                  <th className="py-3 px-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {gunKayitlari.map((d) => (
                  <tr
                    key={d.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white">
                      <span className="block text-xs">
                        {d.musteri_adi}
                      </span>
                      {d.fatura_kesildi && (
                        <span className="text-[10px] text-emerald-800 dark:text-emerald-300 font-black bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-300 dark:border-emerald-800 inline-block mt-0.5">
                          Fatura Kesildi ({formatDate(d.fatura_tarihi || d.tarih)})
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                      <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                        {d.buyuk_adet > 0 && (
                          <span className="font-bold text-slate-900 dark:text-white">
                            Büyük: {d.buyuk_adet}
                          </span>
                        )}
                        {d.kucuk_adet > 0 && (
                          <span className="font-bold text-slate-900 dark:text-white">
                            Küçük: {d.kucuk_adet}
                          </span>
                        )}
                        {d.iade_kova_adet > 0 && (
                          <span className="text-rose-700 dark:text-rose-400 font-bold">İade Kova: {d.iade_kova_adet}</span>
                        )}
                        {d.iade_buyuk_adet > 0 && (
                          <span className="text-rose-700 dark:text-rose-400 font-bold">İade Büyük: {d.iade_buyuk_adet}</span>
                        )}
                        {d.iade_kucuk_adet > 0 && (
                          <span className="text-rose-700 dark:text-rose-400 font-bold">İade Küçük: {d.iade_kucuk_adet}</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-black text-slate-900 dark:text-white num-mono">
                      {formatCurrency(d.toplam_tutar)}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full font-black text-[10px] ${
                          d.odeme_durumu === "odendi"
                            ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                            : d.odeme_durumu === "kismi"
                            ? "bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
                            : "bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800"
                        }`}
                      >
                        {d.odeme_durumu === "odendi"
                          ? "✓ Tam Ödendi"
                          : d.odeme_durumu === "kismi"
                          ? `◈ Kısmi (${formatCurrency(d.odenen_tutar || 0)})`
                          : "✕ Ödenmedi"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {d.kalan_tutar > 0 ? (
                        <span className="font-black text-rose-700 dark:text-rose-400 num-mono bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800">
                          {formatCurrency(d.kalan_tutar)}
                        </span>
                      ) : (
                        <span className="text-emerald-700 dark:text-emerald-400 font-bold">0 ₺</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setDeleteTargetId(d.id)}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-slate-500 dark:text-slate-400 hover:text-rose-700 dark:hover:text-rose-300 transition-colors"
                        title="Kaydı Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>


      {/* Geçmiş Güne Satış Ekleme Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title={`${formatDate(selectedTarih)} Tarihine Satış Ekle`}
        description="Geçmiş tarihe geriye dönük yoğurt teslimat kaydı oluşturun"
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveAddHistorySale} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
              Müşteri Seçin <span className="text-amber-600">*</span>
            </label>
            <select
              value={addMusteriId}
              onChange={(e) => {
                setAddMusteriId(e.target.value);
                setTimeout(calculateAddTotal, 0);
              }}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold outline-none focus:border-amber-500 shadow-sm"
            >
              {musteriler.map((m) => (
                <option key={m.id} value={m.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  {m.ad} ({formatCurrency(m.bakiye || 0)} borç)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">Büyük Yoğurt (Kova)</label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={addBuyukAdet}
                onChange={(e) => {
                  setAddBuyukAdet(e.target.value);
                  setTimeout(calculateAddTotal, 0);
                }}
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold outline-none focus:border-amber-500 num-mono shadow-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">Küçük Yoğurt (Kova)</label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={addKucukAdet}
                onChange={(e) => {
                  setAddKucukAdet(e.target.value);
                  setTimeout(calculateAddTotal, 0);
                }}
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold outline-none focus:border-amber-500 num-mono shadow-sm"
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 space-y-2.5">
            <span className="text-[11px] font-black text-rose-800 dark:text-rose-300 uppercase block tracking-wider">
              İadeler & Boş Kova
            </span>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1">Boş Kova</label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={addIadeKova}
                  onChange={(e) => {
                    setAddIadeKova(e.target.value);
                    setTimeout(calculateAddTotal, 0);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs font-bold outline-none num-mono shadow-sm"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1">İade Büyük</label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={addIadeBuyuk}
                  onChange={(e) => {
                    setAddIadeBuyuk(e.target.value);
                    setTimeout(calculateAddTotal, 0);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs font-bold outline-none num-mono shadow-sm"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1">İade Küçük</label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={addIadeKucuk}
                  onChange={(e) => {
                    setAddIadeKucuk(e.target.value);
                    setTimeout(calculateAddTotal, 0);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs font-bold outline-none num-mono shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Hesaplanan Net Tutar */}
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-between shadow-sm">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Hesaplanan Toplam Tutar:</span>
            <span className="text-xl font-black text-amber-800 dark:text-amber-300 num-mono">
              {formatCurrency(parseFloat(addToplamTutar) || 0)}
            </span>
          </div>

          {/* Ödeme Durumu Seçimi */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">Ödeme Durumu</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setAddOdemeDurumu("odendi");
                  setAddOdenenTutar(addToplamTutar);
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                  addOdemeDurumu === "odendi"
                    ? "bg-emerald-500 text-white border-emerald-600 shadow-sm"
                    : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                }`}
              >
                Tam Ödendi
              </button>
              <button
                type="button"
                onClick={() => {
                  setAddOdemeDurumu("kismi");
                  setAddOdenenTutar("");
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                  addOdemeDurumu === "kismi"
                    ? "bg-amber-500 text-slate-950 border-amber-600 shadow-sm"
                    : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                }`}
              >
                Kısmi Ödeme
              </button>
              <button
                type="button"
                onClick={() => {
                  setAddOdemeDurumu("odenmedi");
                  setAddOdenenTutar("0");
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                  addOdemeDurumu === "odenmedi"
                    ? "bg-rose-500 text-white border-rose-600 shadow-sm"
                    : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                }`}
              >
                Ödenmedi
              </button>
            </div>
          </div>

          {addOdemeDurumu === "kismi" && (
            <div className="space-y-1.5 p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
              <label className="block text-xs font-bold text-amber-950 dark:text-amber-300">
                Tahsil Edilen Peşinat (TL)
              </label>
              <input
                type="number"
                step="any"
                min="0"
                max={parseFloat(addToplamTutar) || 0}
                value={addOdenenTutar}
                onChange={(e) => setAddOdenenTutar(e.target.value)}
                placeholder="0.00"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-amber-500"
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={isAddingHistorySale}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black shadow-md transition-all tactile-btn disabled:opacity-50"
            >
              {isAddingHistorySale ? "Ekleniyor..." : "Satışı Kaydet"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Silme Onay Penceresi */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        title="Dağıtım Kaydını Sil"
        message="Bu dağıtım kaydını silmek istediğinizden emin misiniz? Müşterinin açık veresiye borcu otomatik olarak düşürülecektir."
        confirmText="Evet, Sil"
        cancelText="Vazgeç"
        type="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
}
