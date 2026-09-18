"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import { dataService, isUsingSupabase } from "@/services";
import {
  Mustahsil,
  SutKaydi,
  HesapKapama,
  YogurtDagitim,
  Gider,
  SistemYedegi,
  AylikIstatistikKapanis,
} from "@/types/database";
import { formatCurrency, formatKg, formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import {
  Milk,
  Users,
  Calendar,
  Download,
  Upload,
  ArrowUpRight,
  ArrowDownRight,
  Scale,
  Award,
  ShieldCheck,
  Sparkles,
  Layers,
  Database,
  CloudLightning,
  HardDrive,
  RotateCcw,
  Archive,
  History,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Trash2,
  FileText,
  CheckCircle2,
  Clock,
  Eye,
} from "lucide-react";

const AY_ISIMLERI = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
];

function getVarsayilanDonemAdi(baslangic?: string): string {
  const date = baslangic ? new Date(baslangic) : new Date();
  const ay = AY_ISIMLERI[date.getMonth()] || "Dönem";
  const yil = date.getFullYear();
  return `${ay} ${yil}`;
}

export default function IstatistikPage() {
  const { success, error } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<"aktif" | "arsiv">("aktif");

  const [mustahsiller, setMustahsiller] = useState<Mustahsil[]>([]);
  const [sutKayitlari, setSutKayitlari] = useState<SutKaydi[]>([]);
  const [eskiKapamalar, setEskiKapamalar] = useState<HesapKapama[]>([]);
  const [yogurtDagitimlar, setYogurtDagitimlar] = useState<YogurtDagitim[]>([]);
  const [giderler, setGiderler] = useState<Gider[]>([]);
  const [aylikKapanislar, setAylikKapanislar] = useState<AylikIstatistikKapanis[]>([]);
  const [sonKapanisTarihi, setSonKapanisTarihi] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Dönem Kapatma / Sıfırlama Modalı State
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [donemAdi, setDonemAdi] = useState("");
  const [donemNotu, setDonemNotu] = useState("");
  const [isSubmittingReset, setIsSubmittingReset] = useState(false);

  // Geçmiş Dönem Detay Modalı State
  const [selectedKapanis, setSelectedKapanis] = useState<AylikIstatistikKapanis | null>(null);
  const [deleteKapanisId, setDeleteKapanisId] = useState<string | null>(null);

  // Yedek Yükleme Onay Modalı
  const [pendingYedek, setPendingYedek] = useState<SistemYedegi | null>(null);
  const [isImportConfirmOpen, setIsImportConfirmOpen] = useState(false);

  const isSupabaseActive = isUsingSupabase();

  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    try {
      setLoading(true);
      const [mList, kList, eList, yList, gList, aList, sonTarih] = await Promise.all([
        dataService.getMustahsiller(),
        dataService.getSutKayitlari(),
        dataService.getEskiKayitlar(),
        dataService.getYogurtDagitimlari(),
        dataService.getGiderler(),
        dataService.getAylikKapanislar(),
        dataService.getSonKapanisTarihi(),
      ]);
      setMustahsiller(mList);
      setSutKayitlari(kList);
      setEskiKapamalar(eList);
      setYogurtDagitimlar(yList);
      setGiderler(gList);
      setAylikKapanislar(aList);
      setSonKapanisTarihi(sonTarih);
    } catch (err) {
      error("İstatistik verileri yüklenirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  // --- AKTİF DÖNEM FİLTRELEME & HESAPLAMALARI ---
  // Son kapanış tarihinden SONRA girilmiş kayıtlar aktif dönemi oluşturur.
  const sonKapanisTime = sonKapanisTarihi ? new Date(sonKapanisTarihi).getTime() : 0;

  const isRecordInActivePeriod = (recordTimeStr: string, recordDateStr?: string) => {
    if (!sonKapanisTime) return true;
    const time = new Date(recordTimeStr || recordDateStr || "").getTime();
    return time > sonKapanisTime;
  };

  const aktifSutKayitlari = sutKayitlari.filter((k) =>
    isRecordInActivePeriod(k.olusturma_zamani, k.tarih)
  );

  const aktifYogurtDagitimlari = yogurtDagitimlar.filter((d) =>
    isRecordInActivePeriod(d.olusturma_zamani, d.tarih)
  );

  const aktifGiderler = giderler.filter((g) =>
    isRecordInActivePeriod(g.olusturma_zamani, g.tarih)
  );

  // Aktif Dönem Toplamları
  const aktifToplamSutKg = aktifSutKayitlari.reduce((sum, k) => sum + k.kg, 0);

  const mustahsilMap = new Map(mustahsiller.map((m) => [m.id, m]));
  const aktifSutMaliyetiTL = aktifSutKayitlari.reduce((sum, k) => {
    const m = mustahsilMap.get(k.mustahsil_id);
    return sum + k.kg * (m?.birim_fiyat || 0);
  }, 0);

  const aktifYogurtCirosuTL = aktifYogurtDagitimlari.reduce(
    (sum, d) => sum + (d.toplam_tutar || 0),
    0
  );

  const aktifYogurtTahsilatiTL = aktifYogurtDagitimlari.reduce(
    (sum, d) => sum + (d.odenen_tutar || 0),
    0
  );

  const aktifKalanVeresiyeTL = aktifYogurtDagitimlari.reduce(
    (sum, d) => sum + (d.kalan_tutar || 0),
    0
  );

  const aktifGiderTL = aktifGiderler.reduce((sum, g) => sum + (g.tutar || 0), 0);

  // Net Gelir/Kar = Ciro - Süt Maliyeti - Giderler
  const aktifNetKarZararTL = aktifYogurtCirosuTL - aktifSutMaliyetiTL - aktifGiderTL;

  const ortalamaSutFiyati =
    mustahsiller.length > 0
      ? mustahsiller.reduce((sum, m) => sum + m.birim_fiyat, 0) / mustahsiller.length
      : 0;

  // Müstahsil Bazında Aktif Dönem Süt Toplamları
  const mustahsilSutToplamlari = mustahsiller.map((m) => {
    const ureticiKayitlari = aktifSutKayitlari.filter((k) => k.mustahsil_id === m.id);
    const toplamKg = ureticiKayitlari.reduce((sum, k) => sum + k.kg, 0);
    const toplamTutar = toplamKg * m.birim_fiyat;
    return {
      id: m.id,
      ad: m.ad,
      toplamKg,
      toplamTutar,
      birim_fiyat: m.birim_fiyat,
    };
  });

  const topMustahsiller = [...mustahsilSutToplamlari]
    .sort((a, b) => b.toplamKg - a.toplamKg)
    .slice(0, 5);

  // --- DÖNEM SIFIRLAMA & ARŞİVLEME ---
  const handleOpenResetModal = () => {
    const varsayilanAd = getVarsayilanDonemAdi(sonKapanisTarihi || undefined);
    setDonemAdi(varsayilanAd);
    setDonemNotu("");
    setIsResetModalOpen(true);
  };

  const handleConfirmPeriodReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donemAdi.trim()) {
      error("Lütfen dönem adı giriniz.");
      return;
    }

    try {
      setIsSubmittingReset(true);
      const baslangic = sonKapanisTarihi
        ? sonKapanisTarihi.split("T")[0]
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

      await dataService.createAylikKapanis({
        donem_adi: donemAdi.trim(),
        baslangic_tarihi: baslangic,
        kapanis_tarihi: new Date().toISOString(),
        toplam_yogurt_ciro: aktifYogurtCirosuTL,
        toplam_yogurt_tahsilat: aktifYogurtTahsilatiTL,
        toplam_veresiye_alacak: aktifKalanVeresiyeTL,
        toplam_sut_kg: aktifToplamSutKg,
        toplam_sut_maliyeti: aktifSutMaliyetiTL,
        toplam_gider: aktifGiderTL,
        net_kar_zarar: aktifNetKarZararTL,
        teslimat_sayisi: aktifYogurtDagitimlari.length,
        gider_sayisi: aktifGiderler.length,
        notlar: donemNotu.trim() || undefined,
        detay_json: {
          topMustahsiller,
          mustahsilSayisi: mustahsiller.length,
        },
      });

      success(`"${donemAdi}" dönemi başarıyla arşivlendi ve aktif istatistikler sıfırlandı.`);
      setIsResetModalOpen(false);
      await loadAllData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Dönem kapatılırken hata oluştu.";
      error(msg);
    } finally {
      setIsSubmittingReset(false);
    }
  };

  const handleDeleteKapanis = async () => {
    if (!deleteKapanisId) return;
    try {
      await dataService.deleteAylikKapanis(deleteKapanisId);
      success("Dönem arşivi silindi.");
      setDeleteKapanisId(null);
      await loadAllData();
    } catch (err) {
      error("Arşiv silinirken hata oluştu.");
    }
  };

  // --- YEDEKLEME & GERİ YÜKLEME ---
  const handleExportBackup = async () => {
    try {
      const yedek = await dataService.exportSistemYedegi();
      const jsonStr = JSON.stringify(yedek, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bademcioglu-sistem-yedegi-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      success("Sistem yedeği JSON dosyası olarak başarıyla indirildi.");
    } catch (err) {
      error("Yedek alınırken hata oluştu.");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content) as SistemYedegi;
        if (!parsed.versiyon || !parsed.mustahsiller) {
          throw new Error("Geçersiz yedek formatı.");
        }
        setPendingYedek(parsed);
        setIsImportConfirmOpen(true);
      } catch (err) {
        error("Seçilen dosya geçerli bir sistem yedeği değil.");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleConfirmImport = async () => {
    if (!pendingYedek) return;
    try {
      await dataService.importSistemYedegi(pendingYedek);
      await loadAllData();
      setIsImportConfirmOpen(false);
      setPendingYedek(null);
      success("Yedek başarıyla yüklendi ve sistem güncellendi.");
    } catch (err) {
      error("Yedek yüklenirken hata oluştu.");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      <Header
        title="İstatistik & Finansal Raporlama"
        subtitle="Mandıra verimliliği, aktif dönem ciro-maliyet dengesi ve kalıcı aylık dönem arşivi"
      />

      {/* Üst Sekme Seçici: 1. Aktif Dönem İstatistikleri | 2. Geçmiş Dönem Kapanış Arşivi */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-1.5 bg-white dark:bg-[#101726] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-1 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("aktif")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "aktif"
                ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Aktif Dönem İstatistikleri</span>
          </button>

          <button
            onClick={() => setActiveTab("arsiv")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all relative ${
              activeTab === "arsiv"
                ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Archive className="w-4 h-4" />
            <span>Geçmiş Dönem & Ciro Arşivi</span>
            {aylikKapanislar.length > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 ml-1">
                {aylikKapanislar.length}
              </span>
            )}
          </button>
        </div>

        {/* Aktif Dönemdeyken Sıfırlama Butonu */}
        {activeTab === "aktif" && (
          <button
            onClick={handleOpenResetModal}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 active:scale-95 text-amber-400 text-xs font-bold border border-amber-500/30 shadow-sm flex items-center justify-center gap-2 transition-all"
          >
            <RotateCcw className="w-4 h-4 text-amber-500" />
            <span>Dönemi / Ayı Kapat & Sıfırla</span>
          </button>
        )}
      </div>

      {activeTab === "aktif" ? (
        <>
          {/* Aktif Dönem Bilgi Şeridi */}
          <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 text-xs">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="font-semibold">
                Aktif Dönem Başlangıcı:{" "}
                <span className="font-bold font-mono">
                  {sonKapanisTarihi ? formatDate(sonKapanisTarihi) : "İlk Kurulumdan Beri"}
                </span>
              </span>
            </div>
            <span className="text-[11px] text-amber-700 dark:text-amber-400 font-medium hidden sm:inline">
              (Gösterilen tüm ciro ve maliyetler bu döneme aittir)
            </span>
          </div>

          {/* Finansal Genel Denge Bento Kartları (Aktif Dönem) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Yoğurt Cirosu */}
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-[#101726] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase">
                  Dönemlik Yoğurt Cirosu
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
                  {formatCurrency(aktifYogurtCirosuTL)}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Tahsil Edilen:{" "}
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                    {formatCurrency(aktifYogurtTahsilatiTL)}
                  </span>
                </p>
              </div>
            </motion.div>

            {/* 2. Süt Alım Maliyeti */}
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white dark:bg-[#101726] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase">
                  Dönemlik Süt Maliyeti
                </span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Milk className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl font-mono font-bold text-amber-600 dark:text-amber-400 tracking-tight">
                  {formatCurrency(aktifSutMaliyetiTL)}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Toplanan Süt:{" "}
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                    {formatKg(aktifToplamSutKg)}
                  </span>
                </p>
              </div>
            </motion.div>

            {/* 3. İşletme Giderleri */}
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-[#101726] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase">
                  Dönemlik İşletme Gideri
                </span>
                <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <ArrowDownRight className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl font-mono font-bold text-rose-600 dark:text-rose-400 tracking-tight">
                  {formatCurrency(aktifGiderTL)}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Kayıtlı Gider:{" "}
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                    {aktifGiderler.length} Kalem
                  </span>
                </p>
              </div>
            </motion.div>

            {/* 4. Net Kar / Kazanç */}
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white dark:bg-[#101726] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase">
                  Dönem Net Bakiye / Kar
                </span>
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    aktifNetKarZararTL >= 0
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600"
                      : "bg-rose-50 dark:bg-rose-950/40 text-rose-600"
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <h3
                  className={`text-2xl font-mono font-bold tracking-tight ${
                    aktifNetKarZararTL >= 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {formatCurrency(aktifNetKarZararTL)}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  {aktifNetKarZararTL >= 0 ? "✓ Net Gelir Fazlası" : "⚠ Gider & Maliyet Fazlası"}
                </p>
              </div>
            </motion.div>
          </div>

          {/* Ana Düzen: Sol (Süt ve Müstahsil Analizi) - Sağ (Yedekleme ve Güvenlik) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sol Kolon: Aktif Dönem Müstahsil Teslimatları */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white dark:bg-[#101726] p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-slate-900 dark:text-white text-base">
                        Dönemin Lider Müstahsilleri
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Aktif dönem teslimat hacmine göre ilk 5 üretici
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                    {mustahsiller.length} Üretici
                  </span>
                </div>

                {topMustahsiller.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500">
                    Aktif dönemde henüz kayıtlı süt verisi bulunamadı.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {topMustahsiller.map((m, idx) => {
                      const oran =
                        aktifToplamSutKg > 0 ? (m.toplamKg / aktifToplamSutKg) * 100 : 0;
                      return (
                        <div
                          key={m.id}
                          className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/80 space-y-2"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 font-mono font-bold flex items-center justify-center text-[10px]">
                                {idx + 1}
                              </span>
                              <span className="font-semibold text-slate-900 dark:text-white">
                                {m.ad}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="font-mono font-bold text-slate-900 dark:text-white">
                                {formatKg(m.toplamKg)}
                              </span>
                              <span className="text-[11px] text-slate-500 font-mono ml-2">
                                ({oran.toFixed(1)}%)
                              </span>
                            </div>
                          </div>

                          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(100, Math.max(5, oran))}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Süt & Fiyat Ortalamaları */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-[#101726] border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 shadow-sm flex items-center justify-center">
                    <Scale className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono font-semibold block">
                      Ortalama Süt Fiyatı
                    </span>
                    <span className="text-base font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(ortalamaSutFiyati)} / kg
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-[#101726] border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-blue-600 dark:text-blue-400 shadow-sm flex items-center justify-center">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono font-semibold block">
                      Dönem Teslimat Sayısı
                    </span>
                    <span className="text-base font-mono font-bold text-slate-900 dark:text-white">
                      {aktifSutKayitlari.length} Giriş
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sağ Kolon: Veri Yedekleme & Geri Yükleme */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white dark:bg-[#101726] p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-slate-900 dark:text-white text-base">
                      Veri Güvenliği & Yedekleme
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Tüm kayıtları JSON olarak indirin veya geri yükleyin
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {isSupabaseActive
                    ? "Tüm verileriniz Supabase PostgreSQL bulut veritabanında güvenle tutulur. İstediğiniz zaman anlık tam sistem yedeğini JSON olarak indirebilirsiniz."
                    : "Verileriniz tarayıcınızın yerel hafızasında saklanır."}
                </p>

                <div className="space-y-2.5 pt-2">
                  <button
                    onClick={handleExportBackup}
                    className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Tüm Sistemi Yedekle (.json İndir)</span>
                  </button>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".json"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 transition-all"
                  >
                    <Upload className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Yedekten Geri Yükle (.json Yükle)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* GEÇMİŞ DÖNEMLER & AYLIK CİRO ARŞİVİ */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-serif font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <History className="w-5 h-5 text-amber-500" />
              <span>Arşivlenmiş Aylık Dönem Raporları</span>
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Toplam {aylikKapanislar.length} Kapanış Kaydı
            </span>
          </div>

          {aylikKapanislar.length === 0 ? (
            <div className="bento-card bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 p-16 text-center shadow-sm">
              <Archive className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h4 className="font-bold text-slate-900 dark:text-white text-base">
                Henüz Dönem Kapanışı Yapılmadı
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                "Aktif Dönem İstatistikleri" sekmesindeki "Dönemi / Ayı Kapat & Sıfırla" butonunu
                kullanarak ilk aylık kapanışınızı oluşturabilirsiniz.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {aylikKapanislar.map((k) => (
                <div
                  key={k.id}
                  className="bg-white dark:bg-[#101726] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-amber-400 dark:hover:border-amber-500/60 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-black text-slate-900 dark:text-white text-base">
                        {k.donem_adi}
                      </h4>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono block mt-0.5">
                        Kapanış: {formatDate(k.kapanis_tarihi)}
                      </span>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono ${
                        k.net_kar_zarar >= 0
                          ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                          : "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800"
                      }`}
                    >
                      {k.net_kar_zarar >= 0 ? "+" : ""}
                      {formatCurrency(k.net_kar_zarar)}
                    </span>
                  </div>

                  {/* Detay Metrikler */}
                  <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-100 dark:border-slate-800/80">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">
                        Toplam Ciro
                      </span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(k.toplam_yogurt_ciro)}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">
                        Süt Maliyeti
                      </span>
                      <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                        {formatCurrency(k.toplam_sut_maliyeti)}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">
                        İşletme Gideri
                      </span>
                      <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                        {formatCurrency(k.toplam_gider)}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">
                        Süt Hacmi
                      </span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {formatKg(k.toplam_sut_kg)}
                      </span>
                    </div>
                  </div>

                  {/* Butonlar */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => setSelectedKapanis(k)}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Rapor Detayı</span>
                    </button>

                    <button
                      onClick={() => setDeleteKapanisId(k.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Arşivi Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* DÖNEMİ KAPATMA & SIFIRLAMA MODALI */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="Dönemi / Ayı Kapat & Sıfırla"
        description="Aktif istatistikleri yeni bir arşiv raporu olarak kaydedin ve dönemi sıfırlayın"
      >
        <form onSubmit={handleConfirmPeriodReset} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
              Dönem / Ay Başlığı
            </label>
            <input
              type="text"
              required
              value={donemAdi}
              onChange={(e) => setDonemAdi(e.target.value)}
              placeholder="Örn: Eylül 2026"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-amber-500"
            />
          </div>

          {/* Arşivlenecek Rakamların Özeti */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Dönem Yoğurt Cirosu:</span>
              <span className="font-mono font-bold text-emerald-600">
                {formatCurrency(aktifYogurtCirosuTL)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Dönem Süt Maliyeti ({formatKg(aktifToplamSutKg)}):</span>
              <span className="font-mono font-bold text-amber-600">
                {formatCurrency(aktifSutMaliyetiTL)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Dönem İşletme Gideri ({aktifGiderler.length} Kalem):</span>
              <span className="font-mono font-bold text-rose-600">
                {formatCurrency(aktifGiderTL)}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between font-bold text-sm">
              <span>Arşivlenecek Net Kar/Bakiye:</span>
              <span
                className={`font-mono ${
                  aktifNetKarZararTL >= 0 ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {formatCurrency(aktifNetKarZararTL)}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
              Dönem Kapanış Notu (Opsiyonel)
            </label>
            <textarea
              rows={2}
              value={donemNotu}
              onChange={(e) => setDonemNotu(e.target.value)}
              placeholder="Örn: Yem zamları nedeniyle giderler arttı..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:border-amber-500"
            />
          </div>

          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-300 leading-relaxed">
            💡 <strong>Not:</strong> Bu işlem veritabanınızdaki geçmiş süt tartımlarını, yoğurt teslimatlarını
            veya gider kayıtlarını <u>kesinlikle silmez</u>. Yalnızca aktif dönem sayacını bugünden itibaren
            yeniden başlatır.
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsResetModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={isSubmittingReset}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 disabled:opacity-50 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmittingReset ? "Arşivleniyor..." : "Dönemi Kapat & Sıfırla"}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* GEÇMİŞ DÖNEM DETAY RAPORU MODALI */}
      <Modal
        isOpen={!!selectedKapanis}
        onClose={() => setSelectedKapanis(null)}
        title={`${selectedKapanis?.donem_adi} — Kapanış Raporu`}
        description={`Kapanış Tarihi: ${
          selectedKapanis ? formatDate(selectedKapanis.kapanis_tarihi) : ""
        }`}
      >
        {selectedKapanis && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-slate-500 block text-[11px]">Toplam Ciro:</span>
                <span className="font-mono font-bold text-emerald-600 text-sm">
                  {formatCurrency(selectedKapanis.toplam_yogurt_ciro)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Tahsil Edilen:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                  {formatCurrency(selectedKapanis.toplam_yogurt_tahsilat)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Süt Maliyeti ({formatKg(selectedKapanis.toplam_sut_kg)}):</span>
                <span className="font-mono font-bold text-amber-600 text-sm">
                  {formatCurrency(selectedKapanis.toplam_sut_maliyeti)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Toplam İşletme Gideri:</span>
                <span className="font-mono font-bold text-rose-600 text-sm">
                  {formatCurrency(selectedKapanis.toplam_gider)}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex justify-between items-center text-sm font-bold">
              <span>Dönem Net Kar / Bakiye:</span>
              <span
                className={`font-mono text-base ${
                  selectedKapanis.net_kar_zarar >= 0 ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {formatCurrency(selectedKapanis.net_kar_zarar)}
              </span>
            </div>

            {selectedKapanis.notlar && (
              <div className="p-3.5 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Kapanış Notu:
                </span>
                <p className="text-slate-600 dark:text-slate-400 italic">
                  "{selectedKapanis.notlar}"
                </p>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedKapanis(null)}
                className="px-5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold"
              >
                Kapat
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Arşiv Silme Onayı */}
      <ConfirmDialog
        isOpen={!!deleteKapanisId}
        title="Dönem Arşivini Sil"
        message="Bu dönem kapanış raporunu silmek istediğinizden emin misiniz? (Geçmiş süt ve yoğurt kayıtlarınız silinmez.)"
        confirmText="Evet, Arşivi Sil"
        type="danger"
        onConfirm={handleDeleteKapanis}
        onCancel={() => setDeleteKapanisId(null)}
      />

      {/* Yedek Yükleme Onay Dialogu */}
      <ConfirmDialog
        isOpen={isImportConfirmOpen}
        onClose={() => {
          setIsImportConfirmOpen(false);
          setPendingYedek(null);
        }}
        onConfirm={handleConfirmImport}
        title="Yedek Yüklensin mi?"
        message={`Seçilen yedek dosyasında ${
          pendingYedek?.mustahsiller?.length || 0
        } müstahsil, ${
          pendingYedek?.sut_kayitlari?.length || 0
        } süt kaydı ve ${
          pendingYedek?.giderler?.length || 0
        } gider kaydı bulunmaktadır. Mevcut verilerin üzerine yazılacaktır. Onaylıyor musunuz?`}
        confirmText="Evet, Yedeği Yükle"
        type="warning"
      />
    </div>
  );
}
