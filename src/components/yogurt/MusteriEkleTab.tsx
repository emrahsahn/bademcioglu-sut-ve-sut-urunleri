"use client";

import React, { useState } from "react";
import { YogurtMusteri } from "@/types/database";
import { dataService } from "@/services";
import { useToast } from "@/components/ui/Toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Modal from "@/components/ui/Modal";
import { formatCurrency } from "@/lib/utils";
import {
  UserPlus,
  Search,
  Edit2,
  Trash2,
  Users,
  Phone,
  CheckCircle2,
} from "lucide-react";

interface MusteriEkleTabProps {
  musteriler: YogurtMusteri[];
  onRefresh: () => Promise<void>;
}

export default function MusteriEkleTab({ musteriler, onRefresh }: MusteriEkleTabProps) {
  const { success, error } = useToast();

  // Yeni Müşteri Form State
  const [ad, setAd] = useState("");
  const [telefon, setTelefon] = useState("");
  const [adres, setAdres] = useState("");
  const [buyukFiyat, setBuyukFiyat] = useState("200");
  const [kucukFiyat, setKucukFiyat] = useState("120");
  const [iadeKovaFiyat, setIadeKovaFiyat] = useState("30");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Arama & Filtreleme
  const [searchTerm, setSearchTerm] = useState("");

  // Düzenleme Modal State
  const [editMusteri, setEditMusteri] = useState<YogurtMusteri | null>(null);
  const [editAd, setEditAd] = useState("");
  const [editTelefon, setEditTelefon] = useState("");
  const [editAdres, setEditAdres] = useState("");
  const [editBuyukFiyat, setEditBuyukFiyat] = useState("");
  const [editKucukFiyat, setEditKucukFiyat] = useState("");
  const [editIadeKovaFiyat, setEditIadeKovaFiyat] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Silme Dialog State
  const [deleteTarget, setDeleteTarget] = useState<YogurtMusteri | null>(null);

  // Müşteri Kaydet
  const handleAddMusteri = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAd = ad.trim();
    if (!cleanAd) {
      error("Lütfen müşteri isim ve soyismini giriniz.");
      return;
    }

    const bFiyat = parseFloat(buyukFiyat.replace(",", "."));
    const kFiyat = parseFloat(kucukFiyat.replace(",", "."));
    const iFiyat = parseFloat(iadeKovaFiyat.replace(",", "."));

    if (isNaN(bFiyat) || bFiyat <= 0) {
      error("Geçerli bir büyük yoğurt fiyatı giriniz.");
      return;
    }
    if (isNaN(kFiyat) || kFiyat <= 0) {
      error("Geçerli bir küçük yoğurt fiyatı giriniz.");
      return;
    }
    if (isNaN(iFiyat) || iFiyat < 0) {
      error("Geçerli bir iade kova fiyatı giriniz.");
      return;
    }

    try {
      setIsSubmitting(true);
      await dataService.addYogurtMusteri({
        ad: cleanAd,
        telefon: telefon.trim() || undefined,
        adres: adres.trim() || undefined,
        buyuk_yogurt_fiyat: bFiyat,
        kucuk_yogurt_fiyat: kFiyat,
        iade_kova_fiyat: iFiyat,
      });

      success(`${cleanAd} başarıyla müşteri olarak eklendi.`);
      setAd("");
      setTelefon("");
      setAdres("");
      setBuyukFiyat("200");
      setKucukFiyat("120");
      setIadeKovaFiyat("30");
      await onRefresh();
    } catch (err) {
      error("Müşteri eklenirken hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Düzenleme Başlat
  const handleStartEdit = (m: YogurtMusteri) => {
    setEditMusteri(m);
    setEditAd(m.ad);
    setEditTelefon(m.telefon || "");
    setEditAdres(m.adres || "");
    setEditBuyukFiyat((m.buyuk_yogurt_fiyat || 200).toString());
    setEditKucukFiyat((m.kucuk_yogurt_fiyat || 120).toString());
    setEditIadeKovaFiyat((m.iade_kova_fiyat || 30).toString());
  };

  // Düzenlemeyi Kaydet
  const handleUpdateMusteri = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editMusteri) return;

    const cleanAd = editAd.trim();
    if (!cleanAd) {
      error("Lütfen müşteri isim ve soyismini giriniz.");
      return;
    }

    const bFiyat = parseFloat(editBuyukFiyat.replace(",", "."));
    const kFiyat = parseFloat(editKucukFiyat.replace(",", "."));
    const iFiyat = parseFloat(editIadeKovaFiyat.replace(",", "."));

    if (isNaN(bFiyat) || bFiyat <= 0 || isNaN(kFiyat) || kFiyat <= 0 || isNaN(iFiyat) || iFiyat < 0) {
      error("Lütfen tüm birim fiyatları geçerli sayılar olarak giriniz.");
      return;
    }

    try {
      setIsUpdating(true);
      await dataService.updateYogurtMusteri(editMusteri.id, {
        ad: cleanAd,
        telefon: editTelefon.trim() || undefined,
        adres: editAdres.trim() || undefined,
        buyuk_yogurt_fiyat: bFiyat,
        kucuk_yogurt_fiyat: kFiyat,
        iade_kova_fiyat: iFiyat,
      });

      success(`${cleanAd} müşteri bilgileri güncellendi.`);
      setEditMusteri(null);
      await onRefresh();
    } catch (err) {
      error("Müşteri güncellenirken hata oluştu.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Silme Onayı
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      await dataService.deleteYogurtMusteri(deleteTarget.id);
      success(`${deleteTarget.ad} başarıyla silindi.`);
      setDeleteTarget(null);
      await onRefresh();
    } catch (err) {
      error("Müşteri silinemedi.");
    }
  };

  const filteredMusteriler = musteriler.filter(
    (m) =>
      m.ad.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.telefon && m.telefon.includes(searchTerm)) ||
      (m.adres && m.adres.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Üst Kısım: Yeni Müşteri Ekleme Bento Kartı */}
      <div className="bento-card bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 p-6 animate-fade-in">
        <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-200 dark:border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700/50 text-amber-800 dark:text-amber-300 flex items-center justify-center shadow-sm">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 dark:text-white text-base">Yeni Yoğurt Müşterisi Ekle</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Müşteri adını, iletişim bilgilerini ve kova/iade birim fiyatlarını tanımlayın
            </p>
          </div>
        </div>

        <form onSubmit={handleAddMusteri} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* İsim Soyisim */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                İsim Soyisim / İşletme Adı <span className="text-amber-600">*</span>
              </label>
              <input
                type="text"
                required
                value={ad}
                onChange={(e) => setAd(e.target.value)}
                placeholder="Örn: Aksoy Şarküteri - Mehmet Bey"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-semibold outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
              />
            </div>

            {/* Telefon */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">Telefon Numarası</label>
              <div className="relative">
                <input
                  type="tel"
                  value={telefon}
                  onChange={(e) => setTelefon(e.target.value)}
                  placeholder="05XX XXX XX XX"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all num-mono"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>
          </div>

          {/* Fiyat Bilgileri (Ayrı Ayrı Bento Kutuları) */}
          <div className="bg-amber-50/40 dark:bg-amber-950/20 p-4 rounded-xl border border-amber-200/80 dark:border-amber-800/40 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Büyük Yoğurt Fiyatı */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Büyük Yoğurt Fiyatı (TL)</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  min="0"
                  required
                  value={buyukFiyat}
                  onChange={(e) => setBuyukFiyat(e.target.value)}
                  className="w-full pl-3.5 pr-8 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm font-black text-slate-900 dark:text-white outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all num-mono shadow-sm"
                />
                <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">₺</span>
              </div>
            </div>

            {/* Küçük Yoğurt Fiyatı */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-600" />
                <span>Küçük Yoğurt Fiyatı (TL)</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  min="0"
                  required
                  value={kucukFiyat}
                  onChange={(e) => setKucukFiyat(e.target.value)}
                  className="w-full pl-3.5 pr-8 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm font-black text-slate-900 dark:text-white outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all num-mono shadow-sm"
                />
                <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">₺</span>
              </div>
            </div>

            {/* İade Kova Fiyatı */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>İade Boş Kova Bedeli (TL)</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  min="0"
                  required
                  value={iadeKovaFiyat}
                  onChange={(e) => setIadeKovaFiyat(e.target.value)}
                  className="w-full pl-3.5 pr-8 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm font-black text-slate-900 dark:text-white outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all num-mono shadow-sm"
                />
                <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">₺</span>
              </div>
            </div>
          </div>

          {/* Adres / Not */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
              Adres / Dağıtım Notu <span className="text-slate-400 font-normal">(İsteğe bağlı)</span>
            </label>
            <input
              type="text"
              value={adres}
              onChange={(e) => setAdres(e.target.value)}
              placeholder="Örn: Pazar Meydanı, No: 14 / Çarşamba günleri dağıtılır"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 flex items-center gap-2 transition-all tactile-btn disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? "Kaydediliyor..." : "Müşteriyi Kaydet"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Alt Kısım: Kayıtlı Müşteriler Bento Tablosu */}
      <div className="bento-card bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 overflow-hidden animate-fade-in">
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h4 className="font-black text-slate-900 dark:text-white text-sm">
              Kayıtlı Müşteriler ({musteriler.length})
            </h4>
          </div>

          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Müşteri adı, telefon veya adres ara..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-amber-500"
            />
          </div>
        </div>

        {filteredMusteriler.length === 0 ? (
          <div className="py-12 text-center text-slate-500 dark:text-slate-400">
            <Users className="w-10 h-10 mx-auto text-slate-400 mb-2" />
            <p className="text-xs">Aramaya uygun müşteri bulunamadı.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Müşteri Adı</th>
                  <th className="py-3 px-4">İletişim & Adres</th>
                  <th className="py-3 px-4 text-right">Büyük Yoğurt</th>
                  <th className="py-3 px-4 text-right">Küçük Yoğurt</th>
                  <th className="py-3 px-4 text-right">İade Kova</th>
                  <th className="py-3 px-4 text-right">Güncel Bakiye</th>
                  <th className="py-3 px-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredMusteriler.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white">
                      <span>{m.ad}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      <div>{m.telefon || "—"}</div>
                      {m.adres && (
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">
                          {m.adres}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-slate-900 dark:text-white num-mono">
                      {formatCurrency(m.buyuk_yogurt_fiyat || 200)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-slate-900 dark:text-white num-mono">
                      {formatCurrency(m.kucuk_yogurt_fiyat || 120)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-slate-600 dark:text-slate-400 num-mono">
                      -{formatCurrency(m.iade_kova_fiyat || 30)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {m.bakiye > 0 ? (
                        <span className="font-black text-rose-700 dark:text-rose-400 num-mono bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 px-2 py-0.5 rounded-lg">
                          {formatCurrency(m.bakiye)}
                        </span>
                      ) : (
                        <span className="font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-lg">
                          0 ₺
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => handleStartEdit(m)}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-slate-600 dark:text-slate-300 hover:text-amber-800 dark:hover:text-amber-300 transition-colors"
                        title="Düzenle"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(m)}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-slate-600 dark:text-slate-300 hover:text-rose-700 dark:hover:text-rose-300 transition-colors"
                        title="Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Müşteri Düzenleme Modalı */}
      <Modal
        isOpen={!!editMusteri}
        onClose={() => setEditMusteri(null)}
        title={`${editMusteri?.ad} - Bilgileri Düzenle`}
        description="Müşteri adını, iletişim adresini ve kova birim fiyatlarını güncelleyin"
      >
        <form onSubmit={handleUpdateMusteri} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
              Müşteri / İşletme Adı <span className="text-amber-600">*</span>
            </label>
            <input
              type="text"
              required
              value={editAd}
              onChange={(e) => setEditAd(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-amber-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">Telefon</label>
            <input
              type="tel"
              value={editTelefon}
              onChange={(e) => setEditTelefon(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-amber-500 num-mono"
            />
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200">Büyük Yoğurt (TL)</label>
              <input
                type="number"
                step="any"
                min="0"
                required
                value={editBuyukFiyat}
                onChange={(e) => setEditBuyukFiyat(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-black outline-none focus:border-amber-500 num-mono shadow-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200">Küçük Yoğurt (TL)</label>
              <input
                type="number"
                step="any"
                min="0"
                required
                value={editKucukFiyat}
                onChange={(e) => setEditKucukFiyat(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-black outline-none focus:border-amber-500 num-mono shadow-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200">İade Kova (TL)</label>
              <input
                type="number"
                step="any"
                min="0"
                required
                value={editIadeKovaFiyat}
                onChange={(e) => setEditIadeKovaFiyat(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-black outline-none focus:border-amber-500 num-mono shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">Adres / Not</label>
            <input
              type="text"
              value={editAdres}
              onChange={(e) => setEditAdres(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-amber-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setEditMusteri(null)}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black shadow-md transition-all tactile-btn"
            >
              {isUpdating ? "Kaydediliyor..." : "Güncelle"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Silme Onay Penceresi */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Müşteriyi Sil"
        message={`${deleteTarget?.ad} müşterisini sistemden kaldırmak istediğinizden emin misiniz?`}
        confirmText="Evet, Sil"
        cancelText="Vazgeç"
        type="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
