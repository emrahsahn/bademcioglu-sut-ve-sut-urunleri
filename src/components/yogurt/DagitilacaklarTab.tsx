"use client";

import React, { useState, useEffect } from "react";
import { YogurtMusteri, YogurtDagitim, OdemeDurumu } from "@/types/database";
import { dataService } from "@/services";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency, formatDate, getTodayDateString } from "@/lib/utils";
import FisYazdir from "./FisYazdir";
import Modal from "@/components/ui/Modal";
import {
  Printer,
  History,
  CheckCircle2,
  AlertCircle,
  Search,
  Calendar,
  FileCheck,
  RotateCcw,
  Package,
} from "lucide-react";

interface DagitilacaklarTabProps {
  musteriler: YogurtMusteri[];
  dagitimlar: YogurtDagitim[];
  onRefresh: () => Promise<void>;
  onNavigateToMusteriEkle: () => void;
}

export default function DagitilacaklarTab({
  musteriler,
  dagitimlar,
  onRefresh,
  onNavigateToMusteriEkle,
}: DagitilacaklarTabProps) {
  const { success, error } = useToast();

  // Seçili Müşteri
  const [selectedMusteriId, setSelectedMusteriId] = useState<string>("");
  const [musteriSearch, setMusteriSearch] = useState("");

  // Teslimat Bilgileri State
  const [tarih, setTarih] = useState<string>(getTodayDateString());
  const [buyukAdet, setBuyukAdet] = useState<string>("");
  const [kucukAdet, setKucukAdet] = useState<string>("");
  const [iadeKovaAdet, setIadeKovaAdet] = useState<string>("");
  const [iadeBuyukAdet, setIadeBuyukAdet] = useState<string>("");
  const [iadeKucukAdet, setIadeKucukAdet] = useState<string>("");

  // Fiyat State (Elle değiştirilebilir, varsayılan müşteriden gelir)
  const [buyukFiyat, setBuyukFiyat] = useState<string>("200");
  const [kucukFiyat, setKucukFiyat] = useState<string>("120");
  const [iadeKovaFiyat, setIadeKovaFiyat] = useState<string>("30");

  // Toplam Tutar (Otomatik hesaplanır, istenirse elle değiştirilebilir)
  const [toplamTutar, setToplamTutar] = useState<string>("0");
  const [isToplamManuel, setIsToplamManuel] = useState(false);

  // Ödeme Durumu
  const [odemeDurumu, setOdemeDurumu] = useState<OdemeDurumu>("odendi");
  const [odenenTutar, setOdenenTutar] = useState<string>("0");

  // Fatura
  const [faturaKesildi, setFaturaKesildi] = useState<boolean>(false);
  const [faturaTarihi, setFaturaTarihi] = useState<string>("");

  // Durum & Yükleme
  const [submitting, setSubmitting] = useState(false);

  // Fiş Yazdırma State
  const [yazdirDagitim, setYazdirDagitim] = useState<YogurtDagitim | null>(null);

  // Müşteri Geçmişi Popup State
  const [isCustomerHistoryOpen, setIsCustomerHistoryOpen] = useState(false);

  // İlk müşteri otomatik seçilsin
  useEffect(() => {
    if (musteriler.length > 0) {
      if (!selectedMusteriId || !musteriler.some((m) => m.id === selectedMusteriId)) {
        handleSelectMusteri(musteriler[0]);
      }
    } else {
      setSelectedMusteriId("");
    }
  }, [musteriler]);

  // Müşteri seçildiğinde varsayılan fiyatları yükle
  const handleSelectMusteri = (m: YogurtMusteri) => {
    setSelectedMusteriId(m.id);
    setBuyukFiyat((m.buyuk_yogurt_fiyat || 200).toString());
    setKucukFiyat((m.kucuk_yogurt_fiyat || 120).toString());
    setIadeKovaFiyat((m.iade_kova_fiyat || 30).toString());
    setIsToplamManuel(false);
  };

  const selectedMusteri = musteriler.find((m) => m.id === selectedMusteriId) || null;

  // Otomatik Fiyat Hesaplama
  useEffect(() => {
    if (isToplamManuel) return;

    const bAdt = parseInt(buyukAdet) || 0;
    const kAdt = parseInt(kucukAdet) || 0;
    const iKova = parseInt(iadeKovaAdet) || 0;
    const iBuyuk = parseInt(iadeBuyukAdet) || 0;
    const iKucuk = parseInt(iadeKucukAdet) || 0;

    const bFyt = parseFloat(buyukFiyat.replace(",", ".")) || 0;
    const kFyt = parseFloat(kucukFiyat.replace(",", ".")) || 0;
    const iKovaFyt = parseFloat(iadeKovaFiyat.replace(",", ".")) || 0;

    // Formül: (Büyük x Fiyat) + (Küçük x Fiyat) - (İade Kova x Fiyat) - (İade Büyük x Fiyat) - (İade Küçük x Fiyat)
    const urunlerToplami = bAdt * bFyt + kAdt * kFyt;
    const iadelerToplami = iKova * iKovaFyt + iBuyuk * bFyt + iKucuk * kFyt;
    const sonuc = Math.max(0, urunlerToplami - iadelerToplami);

    setToplamTutar(sonuc.toString());

    // Ödeme durumuna göre ödenen tutarı ayarla
    if (odemeDurumu === "odendi") {
      setOdenenTutar(sonuc.toString());
    } else if (odemeDurumu === "odenmedi") {
      setOdenenTutar("0");
    }
  }, [
    buyukAdet,
    kucukAdet,
    iadeKovaAdet,
    iadeBuyukAdet,
    iadeKucukAdet,
    buyukFiyat,
    kucukFiyat,
    iadeKovaFiyat,
    isToplamManuel,
    odemeDurumu,
  ]);

  // Fatura tiki değişince bugünün tarihini otomatik ata
  const handleToggleFatura = (checked: boolean) => {
    setFaturaKesildi(checked);
    if (checked) {
      setFaturaTarihi(getTodayDateString());
    } else {
      setFaturaTarihi("");
    }
  };

  // Ödeme durumu değişim kontrolü
  const handleChangeOdemeDurumu = (durum: OdemeDurumu) => {
    setOdemeDurumu(durum);
    const top = parseFloat(toplamTutar.replace(",", ".")) || 0;
    if (durum === "odendi") {
      setOdenenTutar(top.toString());
    } else if (durum === "odenmedi") {
      setOdenenTutar("0");
    } else if (durum === "kismi") {
      setOdenenTutar("0");
    }
  };

  // Alınmayan Toplam Ödeme (Kalan)
  const currentToplamTutar = parseFloat(toplamTutar.replace(",", ".")) || 0;
  const currentOdenenTutar =
    odemeDurumu === "odendi"
      ? currentToplamTutar
      : odemeDurumu === "odenmedi"
      ? 0
      : parseFloat(odenenTutar.replace(",", ".")) || 0;
  const alinmayanToplamOdeme = Math.max(0, currentToplamTutar - currentOdenenTutar);

  // Dağıtım Kaydet
  const handleSave = async (isAlsoPrint = false) => {
    if (!selectedMusteri) {
      error("Lütfen bir müşteri seçiniz.");
      return;
    }

    const bAdt = parseInt(buyukAdet) || 0;
    const kAdt = parseInt(kucukAdet) || 0;
    const iKova = parseInt(iadeKovaAdet) || 0;
    const iBuyuk = parseInt(iadeBuyukAdet) || 0;
    const iKucuk = parseInt(iadeKucukAdet) || 0;

    if (bAdt === 0 && kAdt === 0 && iKova === 0 && iBuyuk === 0 && iKucuk === 0) {
      error("Lütfen en az bir teslimat veya iade adedi giriniz.");
      return;
    }

    const bFyt = parseFloat(buyukFiyat.replace(",", ".")) || 0;
    const kFyt = parseFloat(kucukFiyat.replace(",", ".")) || 0;
    const iKovaFyt = parseFloat(iadeKovaFiyat.replace(",", ".")) || 0;

    try {
      setSubmitting(true);

      const newRecord = await dataService.addYogurtDagitim({
        musteri_id: selectedMusteri.id,
        musteri_adi: selectedMusteri.ad,
        tarih,
        buyuk_adet: bAdt,
        kucuk_adet: kAdt,
        iade_kova_adet: iKova,
        iade_buyuk_adet: iBuyuk,
        iade_kucuk_adet: iKucuk,
        buyuk_birim_fiyat: bFyt,
        kucuk_birim_fiyat: kFyt,
        iade_kova_birim_fiyat: iKovaFyt,
        toplam_tutar: currentToplamTutar,
        odeme_durumu: odemeDurumu,
        odenen_tutar: currentOdenenTutar,
        kalan_tutar: alinmayanToplamOdeme,
        fatura_kesildi: faturaKesildi,
        fatura_tarihi: faturaKesildi ? faturaTarihi || getTodayDateString() : undefined,
      });

      success(`${selectedMusteri.ad} için teslimat başarıyla kaydedildi.`);

      if (isAlsoPrint) {
        setYazdirDagitim(newRecord);
      }

      // Formu sıfırla
      setBuyukAdet("");
      setKucukAdet("");
      setIadeKovaAdet("");
      setIadeBuyukAdet("");
      setIadeKucukAdet("");
      setToplamTutar("0");
      setIsToplamManuel(false);
      setOdemeDurumu("odendi");
      setOdenenTutar("0");
      setFaturaKesildi(false);
      setFaturaTarihi("");

      await onRefresh();
    } catch (err) {
      error("Dağıtım kaydedilirken bir hata oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedMusteriKayitlari = dagitimlar.filter(
    (d) => selectedMusteri && d.musteri_id === selectedMusteri.id
  );

  const filteredMusteriler = musteriler.filter(
    (m) =>
      m.ad.toLowerCase().includes(musteriSearch.toLowerCase()) ||
      (m.telefon && m.telefon.includes(musteriSearch))
  );

  return (
    <div className="space-y-5">
      {/* 1. Müşteriler Hızlı Sekmeler (Bento Chips) */}
      <div className="bento-card bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 p-4 sm:p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <h3 className="font-black text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider">
              Hızlı Müşteri Seçimi ({musteriler.length})
            </h3>
          </div>

          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={musteriSearch}
              onChange={(e) => setMusteriSearch(e.target.value)}
              placeholder="Müşteri hızlı ara..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30"
            />
          </div>
        </div>

        {musteriler.length === 0 ? (
          <div className="py-8 text-center text-slate-500 dark:text-slate-400">
            <p className="text-xs">Henüz kayıtlı müşteri yok.</p>
            <button
              onClick={onNavigateToMusteriEkle}
              className="mt-2 text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline"
            >
              + Buradan Müşteri Ekleyin
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin">
            {filteredMusteriler.map((m) => {
              const isSelected = selectedMusteriId === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => handleSelectMusteri(m)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 shrink-0 tactile-btn ${
                    isSelected
                      ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 ring-2 ring-amber-400 font-black"
                      : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <span>{m.ad}</span>
                  {m.bakiye > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-black ${
                        isSelected
                          ? "bg-slate-950 text-rose-300"
                          : "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800/80"
                      }`}
                    >
                      {formatCurrency(m.bakiye)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Seçili Müşteri Dağıtım Formu Bento Kartı */}
      {selectedMusteri && (
        <div className="bento-card bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 p-5 space-y-5">
          {/* Müşteri Başlığı & Tarih */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900 dark:text-white">{selectedMusteri.ad}</h2>
                <span className="text-[11px] bg-amber-100 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700/50 font-extrabold px-2 py-0.5 rounded-lg">
                  Seçili Nokta
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium">
                {selectedMusteri.telefon || "Telefon kayıtlı değil"} • Güncel Bakiye:{" "}
                <strong className="text-rose-600 dark:text-rose-400 font-black num-mono">
                  {formatCurrency(selectedMusteri.bakiye || 0)}
                </strong>
              </p>
            </div>

            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-3 py-1.5 rounded-xl">
              <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <input
                type="date"
                value={tarih}
                onChange={(e) => setTarih(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-900 dark:text-white outline-none"
              />
            </div>
          </div>

          {/* Sipariş & İade Girişleri Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sol: Teslim Edilen Yoğurtlar */}
            <div className="bg-amber-50/40 dark:bg-amber-950/20 p-4 rounded-xl border border-amber-200/80 dark:border-amber-800/40 space-y-3.5">
              <h4 className="text-xs font-black text-amber-900 dark:text-amber-300 uppercase tracking-wide flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Teslim Edilen Yoğurtlar</span>
              </h4>

              {/* Büyük Yoğurt */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                  <label htmlFor="buyuk-adet-input" className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    Büyük Yoğurt (Kova)
                  </label>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Birim: {formatCurrency(parseFloat(buyukFiyat) || 0)}
                  </span>
                </div>
                <div className="w-28">
                  <input
                    id="buyuk-adet-input"
                    aria-label="Büyük Yoğurt Adedi"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={buyukAdet}
                    onChange={(e) => setBuyukAdet(e.target.value)}
                    className="w-full text-center py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-base font-black text-slate-900 dark:text-white outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 num-mono shadow-sm"
                  />
                </div>
              </div>

              {/* Küçük Yoğurt */}
              <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-amber-200/60 dark:border-amber-800/40">
                <div className="flex-1">
                  <label htmlFor="kucuk-adet-input" className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    Küçük Yoğurt (Kova)
                  </label>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Birim: {formatCurrency(parseFloat(kucukFiyat) || 0)}
                  </span>
                </div>
                <div className="w-28">
                  <input
                    id="kucuk-adet-input"
                    aria-label="Küçük Yoğurt Adedi"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={kucukAdet}
                    onChange={(e) => setKucukAdet(e.target.value)}
                    className="w-full text-center py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-base font-black text-slate-900 dark:text-white outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 num-mono shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* Sağ: İadeler & Boş Kova Düşüşü */}
            <div className="bg-rose-50/40 dark:bg-rose-950/20 p-4 rounded-xl border border-rose-200/80 dark:border-rose-800/40 space-y-3.5">
              <h4 className="text-xs font-black text-rose-900 dark:text-rose-300 uppercase tracking-wide flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <span>İadeler & Boş Kova Düşüşü</span>
              </h4>

              {/* İade Kova */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                  <label htmlFor="iade-kova-input" className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    İade Boş Kova
                  </label>
                  <span className="text-[11px] text-rose-700 dark:text-rose-400 font-medium">
                    Kova başı düşüş: -{formatCurrency(parseFloat(iadeKovaFiyat) || 0)}
                  </span>
                </div>
                <div className="w-28">
                  <input
                    id="iade-kova-input"
                    aria-label="İade Boş Kova Adedi"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={iadeKovaAdet}
                    onChange={(e) => setIadeKovaAdet(e.target.value)}
                    className="w-full text-center py-2 rounded-xl bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-800/80 text-base font-black text-rose-700 dark:text-rose-400 outline-none focus:border-rose-500 num-mono shadow-sm"
                  />
                </div>
              </div>

              {/* İade Büyük Yoğurt */}
              <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-rose-200/60 dark:border-rose-800/40">
                <div className="flex-1">
                  <label htmlFor="iade-buyuk-input" className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    İade Büyük Yoğurt
                  </label>
                  <span className="text-[11px] text-rose-700 dark:text-rose-400 font-medium">
                    Birim düşüş: -{formatCurrency(parseFloat(buyukFiyat) || 0)}
                  </span>
                </div>
                <div className="w-28">
                  <input
                    id="iade-buyuk-input"
                    aria-label="İade Büyük Yoğurt Adedi"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={iadeBuyukAdet}
                    onChange={(e) => setIadeBuyukAdet(e.target.value)}
                    className="w-full text-center py-2 rounded-xl bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-800/80 text-base font-black text-rose-700 dark:text-rose-400 outline-none focus:border-rose-500 num-mono shadow-sm"
                  />
                </div>
              </div>

              {/* İade Küçük Yoğurt */}
              <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-rose-200/60 dark:border-rose-800/40">
                <div className="flex-1">
                  <label htmlFor="iade-kucuk-input" className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    İade Küçük Yoğurt
                  </label>
                  <span className="text-[11px] text-rose-700 dark:text-rose-400 font-medium">
                    Birim düşüş: -{formatCurrency(parseFloat(kucukFiyat) || 0)}
                  </span>
                </div>
                <div className="w-28">
                  <input
                    id="iade-kucuk-input"
                    aria-label="İade Küçük Yoğurt Adedi"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={iadeKucukAdet}
                    onChange={(e) => setIadeKucukAdet(e.target.value)}
                    className="w-full text-center py-2 rounded-xl bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-800/80 text-base font-black text-rose-700 dark:text-rose-400 outline-none focus:border-rose-500 num-mono shadow-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Fiyat & Tutar Özeti Bento Kartı */}
          <div className="bg-white dark:bg-[#121929] border border-amber-300/80 dark:border-amber-700/50 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
            <div>
              <span className="text-[11px] font-black text-amber-900 dark:text-amber-300 uppercase tracking-wider block">
                Hesaplanan Net Tutar (İadeler Düşüldü)
              </span>
              <div className="flex items-center gap-2 mt-1">
                <input
                  id="toplam-tutar-input"
                  aria-label="Toplam Tutar"
                  type="number"
                  step="any"
                  value={toplamTutar}
                  onChange={(e) => {
                    setIsToplamManuel(true);
                    setToplamTutar(e.target.value);
                  }}
                  className="bg-transparent text-3xl font-black text-amber-700 dark:text-amber-400 outline-none border-b-2 border-dashed border-amber-400 dark:border-amber-500 focus:border-amber-600 w-44 num-mono"
                />
                <span className="text-2xl font-black text-amber-700 dark:text-amber-400">₺</span>
                {isToplamManuel && (
                  <button
                    type="button"
                    onClick={() => setIsToplamManuel(false)}
                    className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 font-semibold"
                  >
                    Otomatiğe Dön
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                Boş kova ve ürün iadeleri otomatik düşülmüştür. İstenirse elle değiştirilebilir.
              </p>
            </div>

            {/* Ödeme Durumu Seçenekleri */}
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-800 dark:text-slate-200">Ödeme Durumu</label>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleChangeOdemeDurumu("odendi")}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 tactile-btn ${
                    odemeDurumu === "odendi"
                      ? "bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700"
                  }`}
                >
                  <span>✓ Ödendi (Nakit)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleChangeOdemeDurumu("odenmedi")}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 tactile-btn ${
                    odemeDurumu === "odenmedi"
                      ? "bg-rose-600 text-white shadow-md ring-2 ring-rose-400"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700"
                  }`}
                >
                  <span>✕ Ödeme Alınmadı</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleChangeOdemeDurumu("kismi")}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 tactile-btn ${
                    odemeDurumu === "kismi"
                      ? "bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700"
                  }`}
                >
                  <span>◈ Kısmi Ödeme</span>
                </button>
              </div>

              {/* Kısmi Ödeme Alanı */}
              {odemeDurumu === "kismi" && (
                <div className="pt-2 flex items-center gap-2">
                  <label className="text-xs text-amber-900 dark:text-amber-300 font-bold">Alınan Tutar:</label>
                  <div className="relative w-36">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      max={currentToplamTutar}
                      value={odenenTutar}
                      onChange={(e) => setOdenenTutar(e.target.value)}
                      className="w-full pl-2.5 pr-6 py-1.5 rounded-xl bg-white dark:bg-slate-900 border-2 border-amber-500 text-slate-900 dark:text-white text-xs font-black outline-none num-mono shadow-sm"
                    />
                    <span className="absolute right-2.5 top-1.5 text-xs text-slate-400">₺</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Alınmayan Toplam Ödeme Bildirimi */}
          {alinmayanToplamOdeme > 0 && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                <div>
                  <span className="text-xs font-black text-rose-900 dark:text-rose-300 block">
                    Alınmayan Toplam Ödeme (Veresiye Borca Eklenecek):
                  </span>
                  <span className="text-[11px] text-rose-700 dark:text-rose-400 font-medium">
                    Bu tutar müşterinin veresiye kartına otomatik aktarılacaktır.
                  </span>
                </div>
              </div>
              <span className="text-base font-black text-rose-700 dark:text-rose-400 num-mono">
                {formatCurrency(alinmayanToplamOdeme)}
              </span>
            </div>
          )}

          {/* Fatura Kesildi Tiki */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={faturaKesildi}
                onChange={(e) => handleToggleFatura(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
              />
              <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                Fatura Kesildi Olarak İşaretle
              </span>
            </label>

            {faturaKesildi && (
              <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                <FileCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="font-semibold">Fatura Tarihi:</span>
                <span className="font-black text-slate-900 dark:text-white bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 num-mono">
                  {formatDate(faturaTarihi || getTodayDateString())}
                </span>
              </div>
            )}
          </div>

          {/* Butonlar: Kaydet, Yazdır, Eski Kayıtlar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsCustomerHistoryOpen(true)}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 transition-all tactile-btn shadow-sm"
            >
              <History className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>Bu Müşterinin Eski Kayıtları ({selectedMusteriKayitlari.length})</span>
            </button>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSave(true)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-300 dark:border-slate-700 flex items-center gap-2 transition-all tactile-btn disabled:opacity-50"
              >
                <Printer className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Kaydet & Fiş Yazdır</span>
              </button>

              <button
                id="teslimat-kaydet-btn"
                type="button"
                disabled={submitting}
                onClick={() => handleSave(false)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 flex items-center gap-2 transition-all tactile-btn disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{submitting ? "Kaydediliyor..." : "Teslimatı Kaydet"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Fiş Yazdırma Modalı */}
      {yazdirDagitim && (
        <FisYazdir dagitim={yazdirDagitim} onClose={() => setYazdirDagitim(null)} />
      )}

      {/* 4. Müşterinin Eski Kayıtları Modalı */}
      <Modal
        isOpen={isCustomerHistoryOpen}
        onClose={() => setIsCustomerHistoryOpen(false)}
        title={`${selectedMusteri?.ad || "Müşteri"} - Geçmiş Teslimat Kayıtları`}
        description="Tarih bazında alınan yoğurtlar, iadeler ve tahsilat hareketleri"
      >
        <div className="space-y-3">
          {selectedMusteriKayitlari.length === 0 ? (
            <div className="py-8 text-center text-slate-500 dark:text-slate-400">
              <p className="text-xs">Bu müşteriye ait henüz geçmiş teslimat kaydı bulunmuyor.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1 scrollbar-thin">
              {selectedMusteriKayitlari.map((d) => (
                <div
                  key={d.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900 dark:text-white num-mono">{formatDate(d.tarih)}</span>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded ${
                          d.odeme_durumu === "odendi"
                            ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                            : d.odeme_durumu === "kismi"
                            ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
                            : "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800"
                        }`}
                      >
                        {d.odeme_durumu === "odendi"
                          ? "Ödendi"
                          : d.odeme_durumu === "kismi"
                          ? "Kısmi Ödendi"
                          : "Ödeme Alınmadı"}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 flex flex-wrap gap-x-3 gap-y-0.5 font-medium">
                      {d.buyuk_adet > 0 && <span>Büyük: {d.buyuk_adet} ad.</span>}
                      {d.kucuk_adet > 0 && <span>Küçük: {d.kucuk_adet} ad.</span>}
                      {d.iade_kova_adet > 0 && <span>İade Kova: {d.iade_kova_adet} ad.</span>}
                      {d.iade_buyuk_adet > 0 && (
                        <span className="text-rose-700 dark:text-rose-400">İade Büyük: {d.iade_buyuk_adet}</span>
                      )}
                      {d.iade_kucuk_adet > 0 && (
                        <span className="text-rose-700 dark:text-rose-400">İade Küçük: {d.iade_kucuk_adet}</span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-black text-slate-900 dark:text-white block num-mono">
                      {formatCurrency(d.toplam_tutar)}
                    </span>
                    {d.kalan_tutar > 0 ? (
                      <span className="text-[10px] text-rose-700 dark:text-rose-400 font-bold block num-mono">
                        Kalan: {formatCurrency(d.kalan_tutar)}
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold block">
                        Tamamı Ödendi
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
            <button
              onClick={() => setIsCustomerHistoryOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Kapat
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
