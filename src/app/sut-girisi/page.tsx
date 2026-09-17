"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import { dataService } from "@/services";
import { Mustahsil, SutKaydi } from "@/types/database";
import { formatCurrency, formatDate, getTodayDateString, formatKg } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import Modal from "@/components/ui/Modal";
import {
  Milk,
  Search,
  Calendar,
  Plus,
  Scale,
  CheckCircle2,
  Trash2,
  Clock,
  User,
  History,
  AlertCircle,
  Layers,
  Sparkles,
} from "lucide-react";

export default function SutGirisiPage() {
  const { success, error } = useToast();
  const [mustahsiller, setMustahsiller] = useState<Mustahsil[]>([]);
  const [bugunkuKayitlar, setBugunkuKayitlar] = useState<
    (SutKaydi & { mustahsil_adi?: string })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Seçili Müstahsil ve Giriş Formu State
  const [selectedMustahsil, setSelectedMustahsil] = useState<Mustahsil | null>(null);
  const [tarih, setTarih] = useState<string>(getTodayDateString());
  const [kg, setKg] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [mList, kList] = await Promise.all([
        dataService.getMustahsiller(),
        dataService.getSutKayitlari(undefined, "aktif"),
      ]);

      setMustahsiller(mList);

      // Müstahsil adını eşleştirerek son kayıtları hazırla
      const mMap = new Map(mList.map((m) => [m.id, m.ad]));
      const enrichedKayitlar = kList.map((k) => ({
        ...k,
        mustahsil_adi: mMap.get(k.mustahsil_id) || "Bilinmeyen Müstahsil",
      }));
      setBugunkuKayitlar(enrichedKayitlar);
    } catch (err) {
      error("Veriler yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  const handleOpenEntry = (m: Mustahsil) => {
    setSelectedMustahsil(m);
    setTarih(getTodayDateString());
    setKg("");
    setInputError(null);
  };

  const handleSaveSut = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMustahsil) return;

    const kgNum = parseFloat(kg.replace(",", "."));
    if (!kg || isNaN(kgNum) || kgNum <= 0) {
      setInputError("Lütfen geçerli bir kilogram değeri giriniz.");
      return;
    }

    try {
      setSubmitting(true);
      const newKayit = await dataService.addSutKaydi(
        selectedMustahsil.id,
        tarih,
        kgNum
      );

      // Listeyi güncelle
      const enriched: SutKaydi & { mustahsil_adi?: string } = {
        ...newKayit,
        mustahsil_adi: selectedMustahsil.ad,
      };
      setBugunkuKayitlar((prev) => [enriched, ...prev]);

      success(
        `${selectedMustahsil.ad} için ${formatKg(kgNum)} süt girişi kaydedildi.`
      );

      // Formu sıfırla ve kapat
      setSelectedMustahsil(null);
      setKg("");
      setInputError(null);
    } catch (err) {
      error("Süt kaydı yapılırken hata oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteKayit = async (id: string, mustahsilAdi: string = "") => {
    try {
      await dataService.deleteSutKaydi(id);
      setBugunkuKayitlar((prev) => prev.filter((k) => k.id !== id));
      success(`${mustahsilAdi ? mustahsilAdi + " kaydı" : "Süt kaydı"} silindi.`);
    } catch (err) {
      error("Kayıt silinemedi.");
    }
  };

  const filteredMustahsiller = mustahsiller.filter((m) =>
    m.ad.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Günlük özet
  const bugunStr = getTodayDateString();
  const bugunkuToplamKg = bugunkuKayitlar
    .filter((k) => k.tarih === bugunStr)
    .reduce((sum, item) => sum + item.kg, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <Header
        title="Süt Girişi"
        subtitle="Müstahsil seçin, tarih ve kilogram belirterek mandıra süt alımını kaydedin"
      />

      {/* Üst Bento Bilgi Barı */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#101726] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4"
        >
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Milk className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Bugün Toplanan Süt
            </span>
            <h4 className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {formatKg(bugunkuToplamKg)}
            </h4>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white dark:bg-[#101726] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4"
        >
          <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Kayıtlı Müstahsil
            </span>
            <h4 className="text-2xl font-mono font-bold text-slate-900 dark:text-white mt-0.5">
              {mustahsiller.length}{" "}
              <span className="text-xs font-sans text-slate-500 dark:text-slate-400 font-normal">Üretici</span>
            </h4>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-[#101726] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4"
        >
          <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              İşlem Tarihi
            </span>
            <h4 className="text-base font-serif font-bold text-slate-900 dark:text-white mt-0.5">
              {formatDate(bugunStr)}
            </h4>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sol Kolon: Müstahsil Seçim Listesi */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-[#101726] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Müstahsil Seçiniz</span>
              </h3>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                Giriş için üreticiye tıklayın
              </span>
            </div>

            {/* Arama */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Müstahsil adı ile hızlı filtrele..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-emerald-500 transition-all"
              />
            </div>
          </div>

          {/* Müstahsil Kartları */}
          {loading ? (
            <div className="bg-white dark:bg-[#101726] rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-600 rounded-full animate-spin inline-block" />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Müstahsiller yükleniyor...</p>
            </div>
          ) : filteredMustahsiller.length === 0 ? (
            <div className="bg-white dark:bg-[#101726] rounded-2xl p-10 text-center border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-xs text-slate-500 dark:text-slate-400">Kayıtlı müstahsil bulunamadı.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredMustahsiller.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleOpenEntry(m)}
                  className="p-4 rounded-xl bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 transition-all text-left flex items-center justify-between group active:scale-95 shadow-sm"
                >
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                      {m.ad}
                    </h4>
                    <p className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                      {formatCurrency(m.birim_fiyat)} / kg
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 group-hover:bg-emerald-600 group-hover:text-white text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-colors">
                    <Plus className="w-4 h-4" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sağ Kolon: Canlı Kayıt Akışı & Son Girişler */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-[#101726] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white">Son Süt Girişleri</h3>
              </div>
              <span className="text-xs font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                Aktif Dönem
              </span>
            </div>

            {bugunkuKayitlar.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Milk className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-xs">Henüz süt kaydı girilmedi.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1 scrollbar-thin">
                {bugunkuKayitlar.slice(0, 15).map((k) => (
                  <div
                    key={k.id}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                  >
                    <div>
                      <h5 className="font-bold text-xs text-slate-900 dark:text-white">
                        {k.mustahsil_adi}
                      </h5>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        <span>{formatDate(k.tarih)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
                        {k.kg.toFixed(1)} kg
                      </span>
                      <button
                        onClick={() => handleDeleteKayit(k.id, k.mustahsil_adi)}
                        className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Kaydı Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Süt Girişi Modalı (Müstahsil Seçilince Açılan Giriş Penceresi) */}
      <Modal
        isOpen={!!selectedMustahsil}
        onClose={() => setSelectedMustahsil(null)}
        title="Süt Girişi Yap"
        description={`${selectedMustahsil?.ad} için teslimat detaylarını giriniz`}
      >
        {selectedMustahsil && (
          <form onSubmit={handleSaveSut} className="space-y-5">
            {/* Üretici Bilgi Kartı */}
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                  Müstahsil
                </span>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  {selectedMustahsil.ad}
                </h4>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                  Birim Fiyat
                </span>
                <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  {formatCurrency(selectedMustahsil.birim_fiyat)} / kg
                </p>
              </div>
            </div>

            {/* Tarih Seçimi */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Teslimat Tarihi</span>
              </label>
              <input
                type="date"
                value={tarih}
                onChange={(e) => setTarih(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-mono text-slate-900 dark:text-white outline-none focus:border-emerald-500"
              />
            </div>

            {/* Kg Manuel Giriş */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-slate-400" />
                <span>Süt Miktarı (Kg)</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  autoFocus
                  value={kg}
                  onChange={(e) => {
                    setKg(e.target.value);
                    if (inputError) setInputError(null);
                  }}
                  placeholder="0.0"
                  className={`w-full pl-4 pr-14 py-3 rounded-xl border bg-white dark:bg-slate-800 text-2xl font-mono font-bold text-slate-900 dark:text-white outline-none transition-all ${
                    inputError
                      ? "border-rose-400 focus:border-rose-500"
                      : "border-slate-200 dark:border-slate-700 focus:border-emerald-500"
                  }`}
                />
                <span className="absolute right-4 top-4 text-sm font-mono font-bold text-slate-400">
                  KG
                </span>
              </div>
              {inputError && (
                <p role="alert" className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-1 font-mono">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {inputError}
                </p>
              )}
            </div>

            {/* Hızlı Ekleme Butonları (+10, +25, +50, +100) */}
            <div className="flex items-center gap-2">
              {[10, 25, 50, 100].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => {
                    const current = parseFloat(kg || "0");
                    setKg((current + val).toString());
                  }}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-700 dark:text-slate-300 transition-colors"
                >
                  +{val} kg
                </button>
              ))}
            </div>

            {/* Tahmini Tutar Hesaplama Önizleme */}
            {kg && parseFloat(kg) > 0 && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between text-xs">
                <span className="font-semibold text-amber-800 dark:text-amber-300">Hesaplanan Tutar:</span>
                <span className="font-mono font-bold text-amber-700 dark:text-amber-400 text-sm">
                  {formatCurrency(parseFloat(kg) * selectedMustahsil.birim_fiyat)}
                </span>
              </div>
            )}

            {/* Modal Butonları */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedMustahsil(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2"
              >
                {submitting ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Kaydet ve Bitir</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

