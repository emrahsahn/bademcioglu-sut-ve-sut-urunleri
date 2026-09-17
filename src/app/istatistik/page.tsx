"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import { dataService } from "@/services";
import {
  Mustahsil,
  SutKaydi,
  HesapKapama,
  YogurtDagitim,
  Gider,
  SistemYedegi,
} from "@/types/database";
import { formatCurrency, formatKg, formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
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
} from "lucide-react";

export default function IstatistikPage() {
  const { success, error } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mustahsiller, setMustahsiller] = useState<Mustahsil[]>([]);
  const [sutKayitlari, setSutKayitlari] = useState<SutKaydi[]>([]);
  const [eskiKapamalar, setEskiKapamalar] = useState<HesapKapama[]>([]);
  const [yogurtDagitimlar, setYogurtDagitimlar] = useState<YogurtDagitim[]>([]);
  const [giderler, setGiderler] = useState<Gider[]>([]);
  const [loading, setLoading] = useState(true);

  // Yedek Yükleme Onay Modalı
  const [pendingYedek, setPendingYedek] = useState<SistemYedegi | null>(null);
  const [isImportConfirmOpen, setIsImportConfirmOpen] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    try {
      setLoading(true);
      const [mList, kList, eList, yList, gList] = await Promise.all([
        dataService.getMustahsiller(),
        dataService.getSutKayitlari(),
        dataService.getEskiKayitlar(),
        dataService.getYogurtDagitimlari(),
        dataService.getGiderler(),
      ]);
      setMustahsiller(mList);
      setSutKayitlari(kList);
      setEskiKapamalar(eList);
      setYogurtDagitimlar(yList);
      setGiderler(gList);
    } catch (err) {
      error("İstatistik verileri yüklenirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  // --- Hesaplamalar & Metrikler ---
  const tumSutKayitlari = sutKayitlari;
  const toplamToplananSutKg = tumSutKayitlari.reduce((sum, k) => sum + k.kg, 0);

  const aktifKayitlar = tumSutKayitlari.filter((k) => k.durum === "aktif");
  const mustahsilMap = new Map(mustahsiller.map((m) => [m.id, m]));

  const aktifCariTutarTL = aktifKayitlar.reduce((sum, k) => {
    const m = mustahsilMap.get(k.mustahsil_id);
    return sum + k.kg * (m?.birim_fiyat || 0);
  }, 0);

  const gecmisKapatilanTutarTL = eskiKapamalar.reduce(
    (sum, hk) => sum + hk.toplam_tutar,
    0
  );

  const toplamSutMaliyetiTL = aktifCariTutarTL + gecmisKapatilanTutarTL;

  const toplamYogurtCirosuTL = yogurtDagitimlar.reduce(
    (sum, d) => sum + d.toplam_tutar,
    0
  );
  const toplamYogurtTahsilatiTL = yogurtDagitimlar.reduce(
    (sum, d) => sum + (d.odenen_tutar ?? d.tahsil_edilen ?? 0),
    0
  );
  const toplamYogurtKova = yogurtDagitimlar.reduce(
    (sum, d) => sum + (d.buyuk_adet || 0) + (d.kucuk_adet || 0) + (d.kova_adedi || 0),
    0
  );

  const toplamGiderTL = giderler.reduce((sum, g) => sum + g.tutar, 0);

  const ortalamaSutFiyati =
    mustahsiller.length > 0
      ? mustahsiller.reduce((sum, m) => sum + m.birim_fiyat, 0) / mustahsiller.length
      : 0;

  const mustahsilSutToplamlari = mustahsiller.map((m) => {
    const ureticiKayitlari = tumSutKayitlari.filter((k) => k.mustahsil_id === m.id);
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
    <div className="space-y-6 max-w-7xl mx-auto">
      <Header
        title="İstatistik & Analitik Raporu"
        subtitle="Mandıra verimliliği, finansal gelir-gider dengesi ve tam sistem JSON yedekleme"
      />

      {/* Finansal Genel Denge Bento Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#101726] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase">
              Toplam Süt Alım Bedeli
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Milk className="w-4 h-4" />
            </div>
          </div>
          <h4 className="text-2xl font-mono font-bold text-slate-900 dark:text-white mt-2">
            {formatCurrency(toplamSutMaliyetiTL)}
          </h4>
          <div className="mt-2 text-xs font-mono text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <span>Toplam {formatKg(toplamToplananSutKg)} süt</span>
            <span>&bull;</span>
            <span className="text-amber-600 dark:text-amber-400 font-bold">
              Bekleyen: {formatCurrency(aktifCariTutarTL)}
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white dark:bg-[#101726] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-emerald-700 dark:text-emerald-400 uppercase">
              Yoğurt Satış Cirosu
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <h4 className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-2">
            {formatCurrency(toplamYogurtCirosuTL)}
          </h4>
          <div className="mt-2 text-xs font-mono text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <span>{toplamYogurtKova} Kova teslim</span>
            <span>&bull;</span>
            <span className="text-emerald-700 dark:text-emerald-300 font-bold">
              Tahsilat: {formatCurrency(toplamYogurtTahsilatiTL)}
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-[#101726] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-rose-600 dark:text-rose-400 uppercase">
              İşletme Giderleri
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <h4 className="text-2xl font-mono font-bold text-rose-600 dark:text-rose-400 mt-2">
            {formatCurrency(toplamGiderTL)}
          </h4>
          <div className="mt-2 text-xs font-mono text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <span>{giderler.length} Harcama kalemi</span>
            <span>&bull;</span>
            <span className="text-slate-400 font-sans">Yem, mazot, ambalaj</span>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sol Kolon: En Çok Süt Sağlayan Müstahsiller */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-[#101726] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-slate-900 dark:text-white text-base">
                    En Çok Süt Teslim Eden Üreticiler
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Süt hacmine göre en yüksek 5 müstahsil
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">Hacim Payı</span>
            </div>

            {topMustahsiller.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Users className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-xs">Henüz süt kaydı bulunmuyor.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {topMustahsiller.map((m, index) => {
                  const payYuzde =
                    toplamToplananSutKg > 0
                      ? (m.toplamKg / toplamToplananSutKg) * 100
                      : 0;
                  return (
                    <div key={m.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-black ${
                              index === 0
                                ? "bg-amber-400 text-slate-950 shadow-sm"
                                : index === 1
                                ? "bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200"
                                : index === 2
                                ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                            }`}
                          >
                            {index + 1}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white">{m.ad}</span>
                          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                            ({formatCurrency(m.birim_fiyat)}/kg)
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {formatKg(m.toplamKg)}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 ml-2">
                            ({payYuzde.toFixed(1)}%)
                          </span>
                        </div>
                      </div>

                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-amber-500 transition-all duration-500"
                          style={{ width: `${Math.max(4, payYuzde)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
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
                  Kayıtlı Teslimat Sayısı
                </span>
                <span className="text-base font-mono font-bold text-slate-900 dark:text-white">
                  {tumSutKayitlari.length} Giriş
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
              Verileriniz tarayıcınızın yerel hafızasında saklanır. Bilgisayar veya telefon değişimi
              öncesinde tek tıkla tam sistem yedeğini indirebilir, dilediğiniz an geri yükleyebilirsiniz.
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

