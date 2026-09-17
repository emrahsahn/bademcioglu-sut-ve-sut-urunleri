"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import { dataService } from "@/services";
import { Mustahsil } from "@/types/database";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Modal from "@/components/ui/Modal";
import {
  UserPlus,
  Users,
  Search,
  Trash2,
  Edit2,
  Phone,
  AlertCircle,
  TrendingUp,
  Sparkles,
  Layers,
} from "lucide-react";

export default function MustahsilEklePage() {
  const { success, error } = useToast();
  const [mustahsiller, setMustahsiller] = useState<Mustahsil[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Form State
  const [ad, setAd] = useState("");
  const [telefon, setTelefon] = useState("");
  const [birimFiyat, setBirimFiyat] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<{ ad?: string; birimFiyat?: string }>({});

  // Silme Dialog State
  const [deleteTarget, setDeleteTarget] = useState<Mustahsil | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Düzenleme Modal State
  const [editTarget, setEditTarget] = useState<Mustahsil | null>(null);
  const [editFiyat, setEditFiyat] = useState("");
  const [editTelefon, setEditTelefon] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadMustahsiller();
  }, []);

  async function loadMustahsiller() {
    try {
      setLoading(true);
      const data = await dataService.getMustahsiller();
      setMustahsiller(data);
    } catch (err) {
      error("Müstahsil listesi yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  const validateForm = () => {
    const errors: { ad?: string; birimFiyat?: string } = {};
    if (!ad.trim()) {
      errors.ad = "Müstahsil adı zorunludur.";
    }
    const fiyatNum = parseFloat(birimFiyat.replace(",", "."));
    if (!birimFiyat || isNaN(fiyatNum) || fiyatNum <= 0) {
      errors.birimFiyat = "Geçerli bir birim fiyat giriniz (Örn: 17.50).";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddMustahsil = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const fiyatNum = parseFloat(birimFiyat.replace(",", "."));
      const newMustahsil = await dataService.addMustahsil({
        ad: ad.trim(),
        telefon: telefon.trim() || undefined,
        birim_fiyat: fiyatNum,
      });

      setMustahsiller((prev) => [...prev, newMustahsil]);
      success(`${newMustahsil.ad} başarıyla kaydedildi.`);
      setAd("");
      setTelefon("");
      setBirimFiyat("");
      setFormErrors({});
    } catch (err) {
      error("Müstahsil eklenirken bir hata oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await dataService.deleteMustahsil(deleteTarget.id);
      setMustahsiller((prev) => prev.filter((m) => m.id !== deleteTarget.id));
      success(`${deleteTarget.ad} başarıyla silindi.`);
      setDeleteTarget(null);
    } catch (err) {
      error("Müstahsil silinirken bir hata oluştu.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenEdit = (m: Mustahsil) => {
    setEditTarget(m);
    setEditFiyat(m.birim_fiyat.toString());
    setEditTelefon(m.telefon || "");
  };

  const handleUpdateMustahsil = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;

    const fiyatNum = parseFloat(editFiyat.replace(",", "."));
    if (isNaN(fiyatNum) || fiyatNum <= 0) {
      error("Geçerli bir birim fiyat giriniz.");
      return;
    }

    try {
      setIsUpdating(true);
      const updated = await dataService.updateMustahsil(editTarget.id, {
        birim_fiyat: fiyatNum,
        telefon: editTelefon.trim() || undefined,
      });

      setMustahsiller((prev) =>
        prev.map((m) => (m.id === editTarget.id ? updated : m))
      );
      success(`${editTarget.ad} bilgileri güncellendi.`);
      setEditTarget(null);
    } catch (err) {
      error("Güncelleme yapılamadı.");
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredMustahsiller = mustahsiller.filter(
    (m) =>
      m.ad.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.telefon && m.telefon.includes(searchTerm))
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <Header
        title="Müstahsil Tanımlama & Yönetim"
        subtitle="Süt aldığınız üreticileri ekleyin, birim kg alış fiyatlarını belirleyin"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sol Kolon: Yeni Müstahsil Formu */}
        <div className="lg:col-span-4 space-y-5">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-[#101726] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden"
          >
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-slate-900 dark:text-white text-base">Yeni Müstahsil Ekle</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Üretici bilgilerini giriniz</p>
              </div>
            </div>

            <form onSubmit={handleAddMustahsil} className="mt-5 space-y-4">
              {/* Ad Soyad */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Müstahsil Adı Soyadı <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={ad}
                  onChange={(e) => {
                    setAd(e.target.value);
                    if (formErrors.ad) setFormErrors((p) => ({ ...p, ad: undefined }));
                  }}
                  placeholder="Örn: Hasan Yılmaz"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 ${
                    formErrors.ad
                      ? "border-rose-400 focus:border-rose-500"
                      : "border-slate-200 dark:border-slate-700 focus:border-emerald-500"
                  }`}
                />
                {formErrors.ad && (
                  <p role="alert" className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-1 font-mono">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {formErrors.ad}
                  </p>
                )}
              </div>

              {/* Birim Fiyat */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Birim Kg Alış Fiyatı (TL) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={birimFiyat}
                    onChange={(e) => {
                      setBirimFiyat(e.target.value);
                      if (formErrors.birimFiyat)
                        setFormErrors((p) => ({ ...p, birimFiyat: undefined }));
                    }}
                    placeholder="Örn: 17.50"
                    className={`w-full pl-3.5 pr-14 py-2.5 rounded-xl border text-sm font-mono font-bold transition-all outline-none bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 placeholder-slate-400 ${
                      formErrors.birimFiyat
                        ? "border-rose-400 focus:border-rose-500"
                        : "border-slate-200 dark:border-slate-700 focus:border-emerald-500"
                    }`}
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs font-mono font-bold text-slate-400">
                    ₺ / Kg
                  </span>
                </div>
                {formErrors.birimFiyat && (
                  <p role="alert" className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-1 font-mono">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {formErrors.birimFiyat}
                  </p>
                )}
              </div>

              {/* Telefon (Opsiyonel) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Telefon Numarası <span className="text-slate-400 font-normal">(İsteğe bağlı)</span>
                </label>
                <input
                  type="tel"
                  value={telefon}
                  onChange={(e) => setTelefon(e.target.value)}
                  placeholder="05XX XXX XX XX"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm font-mono transition-all outline-none focus:border-emerald-500"
                />
              </div>

              {/* Kaydet Butonu */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                {submitting ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Müstahsili Kaydet</span>
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* İpucu Kutusu */}
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs text-slate-700 dark:text-slate-300 space-y-1.5">
            <div className="font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Otomatik Raporlama Bilgisi</span>
            </div>
            <p className="leading-relaxed">
              Belirlediğiniz birim fiyat, bu müstahsilden yapılan tüm süt alımlarında toplam tutar
              hesaplanırken otomatik olarak kullanılacaktır.
            </p>
          </div>
        </div>

        {/* Sağ Kolon: Müstahsil Listesi */}
        <div className="lg:col-span-8 space-y-4">
          {/* Arama ve Sayaç Barı */}
          <div className="bg-white dark:bg-[#101726] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Müstahsil adı veya telefon ile ara..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-emerald-500 transition-all"
              />
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
              <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Toplam: {filteredMustahsiller.length} Müstahsil</span>
            </div>
          </div>

          {/* Liste */}
          {loading ? (
            <div className="bg-white dark:bg-[#101726] rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-600 rounded-full animate-spin inline-block" />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Müstahsiller yükleniyor...</p>
            </div>
          ) : filteredMustahsiller.length === 0 ? (
            <div className="bg-white dark:bg-[#101726] rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-sm">
              <Users className="w-10 h-10 text-slate-400 mx-auto" />
              <h4 className="font-serif font-bold text-slate-700 dark:text-slate-200 text-sm mt-3">Müstahsil Bulunamadı</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {searchTerm
                  ? "Aramanıza uygun kayıt bulunamadı."
                  : "Henüz müstahsil eklenmemiş. Soldaki formdan ilk müstahsili ekleyebilirsiniz."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredMustahsiller.map((m) => (
                <div
                  key={m.id}
                  className="bg-white dark:bg-[#101726] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                          {m.ad}
                        </h4>
                        <span className="text-[10px] font-mono text-slate-400">
                          Kayıt: {formatDate(m.olusturma_tarihi)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs border border-emerald-200 dark:border-emerald-800/60">
                          {formatCurrency(m.birim_fiyat)} / kg
                        </span>
                      </div>
                    </div>

                    {m.telefon && (
                      <div className="mt-2.5 flex items-center gap-1.5 text-xs font-mono text-slate-600 dark:text-slate-300">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{m.telefon}</span>
                      </div>
                    )}
                  </div>

                  {/* Kart Aksiyonları */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenEdit(m)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                      <span>Fiyat Düzenle</span>
                    </button>
                    <button
                      onClick={() => setDeleteTarget(m)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                      <span>Sil</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Düzenleme Modalı */}
      <Modal
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="Müstahsil Bilgilerini Düzenle"
        description={`${editTarget?.ad} için birim fiyat ve iletişim güncellemesi`}
      >
        {editTarget && (
          <form onSubmit={handleUpdateMustahsil} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Birim Kg Alış Fiyatı (TL)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={editFiyat}
                  onChange={(e) => setEditFiyat(e.target.value)}
                  className="w-full pl-3.5 pr-14 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400 outline-none focus:border-emerald-500"
                />
                <span className="absolute right-3.5 top-2.5 text-xs font-mono font-bold text-slate-400">
                  ₺ / Kg
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Telefon Numarası
              </label>
              <input
                type="tel"
                value={editTelefon}
                onChange={(e) => setEditTelefon(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono text-slate-900 dark:text-white outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditTarget(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                disabled={isUpdating}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5"
              >
                {isUpdating ? "Kaydediliyor..." : "Güncelle"}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Silme Onay Dialogu */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Müstahsili Sil"
        message={`"${deleteTarget?.ad}" adlı müstahsili silmek istediğinize emin misiniz? Bu üreticiye ait geçmiş kayıtlar saklanmaya devam edecektir.`}
        confirmText="Evet, Sil"
        type="danger"
        loading={isDeleting}
      />
    </div>
  );
}

