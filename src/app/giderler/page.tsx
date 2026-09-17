"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import { dataService } from "@/services";
import { Gider, GiderKategoriItem } from "@/types/database";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency, formatDate, getTodayDateString } from "@/lib/utils";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import {
  TrendingDown,
  Plus,
  Calendar,
  CalendarDays,
  Tag,
  Search,
  Receipt,
  CheckCircle2,
  Trash2,
  Edit2,
  AlertCircle,
  Clock,
  Sparkles,
} from "lucide-react";

type GiderTabType = "ekle" | "eski";

export default function GiderlerPage() {
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState<GiderTabType>("ekle");
  const [giderler, setGiderler] = useState<Gider[]>([]);
  const [kategoriler, setKategoriler] = useState<GiderKategoriItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State: 1. Gider Ekle
  const [baslik, setBaslik] = useState("");
  const [tutar, setTutar] = useState("");
  const [seciliKategori, setSeciliKategori] = useState("");
  const [tarih, setTarih] = useState(getTodayDateString());
  const [aciklama, setAciklama] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Modal: Yeni Kategori Ekle
  const [isNewKatOpen, setIsNewKatOpen] = useState(false);
  const [yeniKatAdi, setYeniKatAdi] = useState("");
  const [isAddingKat, setIsAddingKat] = useState(false);

  // 2. Eski Kayıtlar Sekmesi State
  const [selectedHistoryDate, setSelectedHistoryDate] = useState(getTodayDateString());
  const [historySearch, setHistorySearch] = useState("");

  // Düzenleme Modal State
  const [editGider, setEditGider] = useState<Gider | null>(null);
  const [editBaslik, setEditBaslik] = useState("");
  const [editTutar, setEditTutar] = useState("");
  const [editKategori, setEditKategori] = useState("");
  const [editTarih, setEditTarih] = useState("");
  const [editAciklama, setEditAciklama] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Silme Onay Dialog State
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [gList, kList] = await Promise.all([
        dataService.getGiderler(),
        dataService.getGiderKategorileri(),
      ]);
      setGiderler(gList);
      setKategoriler(kList);
      if (kList.length > 0 && !seciliKategori) {
        setSeciliKategori(kList[0].ad);
      }
    } catch (err) {
      error("Gider verileri yüklenirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  // Yeni Gider Kaydet
  const handleAddGider = async (e: React.FormEvent, customDate?: string) => {
    e.preventDefault();
    const cleanBaslik = baslik.trim();
    if (!cleanBaslik) {
      error("Lütfen gider adını giriniz.");
      return;
    }

    const tutarNum = parseFloat(tutar.replace(",", "."));
    if (isNaN(tutarNum) || tutarNum <= 0) {
      error("Lütfen geçerli bir fiyat giriniz.");
      return;
    }

    try {
      setSubmitting(true);
      const targetDate = customDate || tarih;
      const newG = await dataService.addGider({
        baslik: cleanBaslik,
        kategori: seciliKategori || "Diğer Giderler",
        tutar: tutarNum,
        tarih: targetDate,
        aciklama: aciklama.trim() || undefined,
      });

      setGiderler((prev) => [newG, ...prev]);
      success(`${formatCurrency(tutarNum)} tutarında ${cleanBaslik} kaydedildi.`);

      setBaslik("");
      setTutar("");
      setAciklama("");
    } catch (err) {
      error("Gider kaydedilemedi.");
    } finally {
      setSubmitting(false);
    }
  };

  // Yeni Kategori Ekle
  const handleCreateKategori = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKat = yeniKatAdi.trim();
    if (!cleanKat) {
      error("Lütfen kategori adı giriniz.");
      return;
    }

    try {
      setIsAddingKat(true);
      const added = await dataService.addGiderKategori(cleanKat);
      setKategoriler((prev) => [...prev, added]);
      setSeciliKategori(added.ad);
      setYeniKatAdi("");
      setIsNewKatOpen(false);
      success(`"${cleanKat}" kategorisi eklendi.`);
    } catch (err) {
      error("Kategori eklenemedi.");
    } finally {
      setIsAddingKat(false);
    }
  };

  // Düzenleme Başlat
  const handleOpenEdit = (g: Gider) => {
    setEditGider(g);
    setEditBaslik(g.baslik);
    setEditTutar(g.tutar.toString());
    setEditKategori(g.kategori);
    setEditTarih(g.tarih);
    setEditAciklama(g.aciklama || "");
  };

  // Düzenleme Kaydet
  const handleUpdateGider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editGider) return;

    const cleanBaslik = editBaslik.trim();
    if (!cleanBaslik) {
      error("Lütfen gider başlığını giriniz.");
      return;
    }

    const tutarNum = parseFloat(editTutar.replace(",", "."));
    if (isNaN(tutarNum) || tutarNum <= 0) {
      error("Geçerli bir tutar giriniz.");
      return;
    }

    try {
      setIsUpdating(true);
      await dataService.updateGider(editGider.id, {
        baslik: cleanBaslik,
        tutar: tutarNum,
        kategori: editKategori,
        tarih: editTarih,
        aciklama: editAciklama.trim() || undefined,
      });

      setGiderler((prev) =>
        prev.map((g) =>
          g.id === editGider.id
            ? {
                ...g,
                baslik: cleanBaslik,
                tutar: tutarNum,
                kategori: editKategori,
                tarih: editTarih,
                aciklama: editAciklama.trim() || undefined,
              }
            : g
        )
      );

      success("Gider kaydı güncellendi.");
      setEditGider(null);
    } catch (err) {
      error("Gider güncellenemedi.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Silme Onayla
  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    try {
      await dataService.deleteGider(deleteTargetId);
      setGiderler((prev) => prev.filter((g) => g.id !== deleteTargetId));
      success("Gider kaydı silindi.");
      setDeleteTargetId(null);
    } catch (err) {
      error("Kayıt silinemedi.");
    }
  };

  // Geçmiş Tarih Kısayolları
  const handleQuickHistoryDate = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    setSelectedHistoryDate(d.toISOString().split("T")[0]);
  };

  // Seçili tarihin giderleri
  const seciliTarihGiderleri = giderler.filter((g) => {
    const matchesDate = g.tarih === selectedHistoryDate;
    if (!historySearch) return matchesDate;
    const term = historySearch.toLowerCase();
    return (
      matchesDate &&
      (g.baslik.toLowerCase().includes(term) ||
        g.kategori.toLowerCase().includes(term) ||
        (g.aciklama && g.aciklama.toLowerCase().includes(term)))
    );
  });

  const seciliTarihToplamTutar = seciliTarihGiderleri.reduce((sum, g) => sum + g.tutar, 0);
  const tumToplamGider = giderler.reduce((sum, g) => sum + g.tutar, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <Header
        title="Giderler & Harcamalar"
        subtitle="İşletme masraflarını kaydedin, kategorize edin ve geçmiş harcamaları gün gün takip edin"
      />

      {/* İki Ana Seçenek: Gider Ekle | Eski Kayıtlara Bak */}
      <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 rounded-2xl w-fit shadow-sm">
        <button
          type="button"
          onClick={() => setActiveTab("ekle")}
          className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "ekle"
              ? "text-slate-950 font-black"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50"
          }`}
        >
          {activeTab === "ekle" && (
            <motion.div
              layoutId="giderTabPill"
              className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-500 rounded-xl shadow-md shadow-amber-500/20"
              transition={{ type: "spring", stiffness: 450, damping: 35 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2">
            <Plus className={`w-4 h-4 ${activeTab === "ekle" ? "text-slate-950 stroke-[2.5]" : "text-rose-600 dark:text-rose-400"}`} />
            <span>1. Gider Ekle</span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("eski")}
          className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "eski"
              ? "text-slate-950 font-black"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50"
          }`}
        >
          {activeTab === "eski" && (
            <motion.div
              layoutId="giderTabPill"
              className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-500 rounded-xl shadow-md shadow-amber-500/20"
              transition={{ type: "spring", stiffness: 450, damping: 35 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2">
            <CalendarDays className={`w-4 h-4 ${activeTab === "eski" ? "text-slate-950 stroke-[2.5]" : "text-amber-600 dark:text-amber-400"}`} />
            <span>2. Eski Kayıtlara Bak</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                activeTab === "eski"
                  ? "bg-slate-950/20 text-slate-900"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              }`}
            >
              {giderler.length}
            </span>
          </span>
        </button>
      </div>

      {/* 1. GÖRÜNÜM: GİDER EKLE */}
      {activeTab === "ekle" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6"
        >
          {/* Sol Kolon: Basit ve Net Gider Ekleme Formu */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bento-card bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 p-6 space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-base">Hızlı Gider Girişi</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                    Gider adı, harcama tutarı ve kategori seçerek anında kaydedin
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5" />
                </div>
              </div>

              <form onSubmit={(e) => handleAddGider(e)} className="space-y-4">
                {/* Gider Adı */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    Gider Adı <span className="text-rose-600 dark:text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={baslik}
                    onChange={(e) => setBaslik(e.target.value)}
                    placeholder="Örn: 20 Çuval Süt Yemi Alımı"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-rose-500 transition-colors"
                  />
                </div>

                {/* Fiyat (Tutar) */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    Fiyat (TL) <span className="text-rose-600 dark:text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      required
                      value={tutar}
                      onChange={(e) => setTutar(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-lg font-mono font-black text-rose-700 dark:text-rose-400 placeholder-slate-400 outline-none focus:border-rose-500 transition-colors shadow-sm"
                    />
                    <span className="absolute right-3.5 top-3 text-sm font-bold text-slate-400 font-mono">
                      ₺
                    </span>
                  </div>
                </div>

                {/* Kategori Seçimi & Yeni Kategori Ekle Butonu */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">Kategori</label>
                    <button
                      type="button"
                      onClick={() => setIsNewKatOpen(true)}
                      className="text-[11px] font-bold text-amber-700 dark:text-amber-400 hover:text-amber-800 flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      <span>+ Yeni Kategori Ekle</span>
                    </button>
                  </div>
                  <select
                    value={seciliKategori}
                    onChange={(e) => setSeciliKategori(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-rose-500"
                  >
                    {kategoriler.map((k) => (
                      <option key={k.id} value={k.ad} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                        {k.ad}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tarih */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">Harcama Tarihi</label>
                  <input
                    type="date"
                    value={tarih}
                    onChange={(e) => setTarih(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-xs font-mono font-semibold text-slate-900 dark:text-white outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-rose-500"
                  />
                </div>

                {/* Açıklama / Not */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    Açıklama / Fiş Notu <span className="text-slate-400 font-normal">(İsteğe bağlı)</span>
                  </label>
                  <input
                    type="text"
                    value={aciklama}
                    onChange={(e) => setAciklama(e.target.value)}
                    placeholder="Örn: Kooperatiften nakit ödendi, fiş no: 412"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-rose-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-black shadow-md shadow-rose-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{submitting ? "Kaydediliyor..." : "Gideri Kaydet"}</span>
                </button>
              </form>
            </div>
          </div>

          {/* Sağ Kolon: Son Eklenen Harcamalar Akışı */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bento-card bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <h4 className="font-black text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  <span>Son Eklenen Giderler</span>
                </h4>
                <span className="text-xs font-mono font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 px-2.5 py-0.5 rounded-lg">
                  Toplam {giderler.length} Harcama
                </span>
              </div>

              {giderler.length === 0 ? (
                <div className="py-14 text-center text-slate-500 dark:text-slate-400">
                  <p className="text-xs font-medium">Henüz gider kaydı bulunmuyor.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1 scrollbar-thin">
                  {giderler.slice(0, 10).map((g) => (
                    <div
                      key={g.id}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:bg-slate-100/80 dark:hover:bg-slate-850 flex items-center justify-between gap-3 text-xs transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">{g.baslik}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
                            {g.kategori}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2 font-medium">
                          <span>{formatDate(g.tarih)}</span>
                          {g.aciklama && <span>&bull; {g.aciklama}</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono font-black text-rose-700 dark:text-rose-400 text-sm">
                          {formatCurrency(g.tutar)}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(g)}
                            className="p-1 rounded text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                            title="Düzenle"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTargetId(g.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-700 dark:hover:text-rose-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                            title="Sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* 2. GÖRÜNÜM: ESKİ KAYITLARA BAK */}
      {activeTab === "eski" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          {/* Tarih Seçici & Kısayol Kartı */}
          <div className="bento-card bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-black text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <span>Geçmiş Tarihli Gider İnceleme</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                  İstediğiniz güne giderek o gün yapılan harcamaları ve toplam maliyeti inceleyin
                </p>
              </div>

              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700">
                <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <input
                  type="date"
                  value={selectedHistoryDate}
                  onChange={(e) => setSelectedHistoryDate(e.target.value)}
                  className="bg-transparent text-xs font-mono font-bold text-slate-900 dark:text-white outline-none cursor-pointer"
                />
              </div>
            </div>

            {/* Tarih Kısayolları */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 overflow-x-auto text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-bold whitespace-nowrap text-[11px]">Kısayollar:</span>
              <button
                type="button"
                onClick={() => handleQuickHistoryDate(0)}
                className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                  selectedHistoryDate === getTodayDateString()
                    ? "bg-amber-500 text-slate-950 font-black shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700"
                }`}
              >
                Bugün
              </button>
              <button
                type="button"
                onClick={() => handleQuickHistoryDate(1)}
                className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold border border-slate-300 dark:border-slate-700 transition-colors"
              >
                Dün
              </button>
              <button
                type="button"
                onClick={() => handleQuickHistoryDate(3)}
                className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold border border-slate-300 dark:border-slate-700 transition-colors"
              >
                3 Gün Önce
              </button>
              <button
                type="button"
                onClick={() => handleQuickHistoryDate(7)}
                className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold border border-slate-300 dark:border-slate-700 transition-colors"
              >
                1 Hafta Önce
              </button>
            </div>
          </div>

          {/* O Günün Mali Özeti Kartı */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bento-card bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 p-5 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                  {formatDate(selectedHistoryDate)} Toplam Masraf
                </span>
                <h4 className="text-2xl font-mono font-black text-rose-700 dark:text-rose-400 mt-1">
                  {formatCurrency(seciliTarihToplamTutar)}
                </h4>
              </div>
              <span className="text-xs font-mono font-bold bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-400 px-3 py-1 rounded-lg">
                {seciliTarihGiderleri.length} Kalem
              </span>
            </div>

            <div className="bento-card bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 p-5 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                  Tüm Zamanlar Toplam Gider
                </span>
                <h4 className="text-2xl font-mono font-black text-slate-900 dark:text-white mt-1">
                  {formatCurrency(tumToplamGider)}
                </h4>
              </div>
              <span className="text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-3 py-1 rounded-lg border border-slate-300 dark:border-slate-700">
                Genel Toplam
              </span>
            </div>
          </div>

          {/* Seçili Tarihe Ait Gider Listesi */}
          <div className="bento-card bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h4 className="font-black text-slate-900 dark:text-white text-base">
                {formatDate(selectedHistoryDate)} Tarihindeki Giderler ({seciliTarihGiderleri.length})
              </h4>

              <div className="relative flex-1 max-w-xs">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  placeholder="Gider veya kategori ara..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-rose-500"
                />
              </div>
            </div>

            {seciliTarihGiderleri.length === 0 ? (
              <div className="py-16 text-center text-slate-500 dark:text-slate-400">
                <Calendar className="w-12 h-12 mx-auto text-slate-400 mb-2" />
                <h5 className="font-black text-slate-800 dark:text-slate-200 text-sm">Bu Tarihte Harcama Yok</h5>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  {formatDate(selectedHistoryDate)} tarihine ait harcama kaydı bulunamadı.
                </p>
                <button
                  onClick={() => {
                    setTarih(selectedHistoryDate);
                    setActiveTab("ekle");
                  }}
                  className="mt-4 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-black shadow-md inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Bu Tarihe Gider Ekle</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="py-3 px-4">Gider Adı</th>
                      <th className="py-3 px-4">Kategori</th>
                      <th className="py-3 px-4">Açıklama</th>
                      <th className="py-3 px-4 text-right">Fiyat (Tutar)</th>
                      <th className="py-3 px-4 text-right">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {seciliTarihGiderleri.map((g) => (
                      <tr key={g.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{g.baslik}</td>
                        <td className="py-3.5 px-4">
                          <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
                            {g.kategori}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 max-w-xs truncate font-sans">
                          {g.aciklama || "-"}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-black text-rose-700 dark:text-rose-400 text-sm whitespace-nowrap">
                          {formatCurrency(g.tutar)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(g)}
                              className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="Düzenle"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteTargetId(g.id)}
                              className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-rose-700 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="Sil"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* YENİ KATEGORİ EKLE MODALI */}
      <Modal
        isOpen={isNewKatOpen}
        onClose={() => setIsNewKatOpen(false)}
        title="Yeni Gider Kategorisi Tanımla"
        description="Örn: Nakliye, İlaç, Ambalaj gibi yeni harcama kategorisi oluşturabilirsiniz"
      >
        <form onSubmit={handleCreateKategori} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
              Kategori Adı <span className="text-amber-600 dark:text-amber-400">*</span>
            </label>
            <input
              type="text"
              required
              value={yeniKatAdi}
              onChange={(e) => setYeniKatAdi(e.target.value)}
              placeholder="Örn: Ambalaj & Kova Alımı"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-amber-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsNewKatOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={isAddingKat}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black shadow-md transition-all"
            >
              {isAddingKat ? "Ekleniyor..." : "Kategoriyi Ekle"}
            </button>
          </div>
        </form>
      </Modal>

      {/* GİDER DÜZENLEME MODALI */}
      <Modal
        isOpen={!!editGider}
        onClose={() => setEditGider(null)}
        title="Gider Kaydını Düzenle"
        description="Masraf başlığını, tutarını veya kategorisini güncelleyin"
      >
        <form onSubmit={handleUpdateGider} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">Gider Adı</label>
            <input
              type="text"
              required
              value={editBaslik}
              onChange={(e) => setEditBaslik(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-rose-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">Fiyat (TL)</label>
              <input
                type="number"
                step="any"
                min="0"
                required
                value={editTutar}
                onChange={(e) => setEditTutar(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-black outline-none focus:border-rose-500 num-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">Kategori</label>
              <select
                value={editKategori}
                onChange={(e) => setEditKategori(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold outline-none focus:border-rose-500"
              >
                {kategoriler.map((k) => (
                  <option key={k.id} value={k.ad} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                    {k.ad}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">Harcama Tarihi</label>
            <input
              type="date"
              value={editTarih}
              onChange={(e) => setEditTarih(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-rose-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">Açıklama / Not</label>
            <input
              type="text"
              value={editAciklama}
              onChange={(e) => setEditAciklama(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-rose-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setEditGider(null)}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md transition-all"
            >
              {isUpdating ? "Güncelleniyor..." : "Güncelle"}
            </button>
          </div>
        </form>
      </Modal>

      {/* SİLME ONAY DİALOGU */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        title="Gider Kaydını Sil"
        message="Bu gider kaydını silmek istediğinizden emin misiniz? Toplam maliyet hesapları güncellenecektir."
        confirmText="Evet, Sil"
        cancelText="Vazgeç"
        type="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
}
