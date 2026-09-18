import {
  Mustahsil,
  SutKaydi,
  HesapKapama,
  DashboardOzet,
  YogurtMusteri,
  YogurtDagitim,
  YogurtUretim,
  Gider,
  GiderKategoriItem,
  SistemYedegi,
  AylikIstatistikKapanis,
} from "../types/database";

import { IDataService } from "./storageInterface";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";

export class SupabaseService implements IDataService {
  private checkConfigured() {
    if (!isSupabaseConfigured()) {
      throw new Error(
        "Supabase bağlantısı henüz yapılandırılmadı. Lütfen .env.local dosyanıza NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_ANON_KEY tanımlayın."
      );
    }
  }

  // --- Müstahsil İşlemleri ---
  async getMustahsiller(): Promise<Mustahsil[]> {
    this.checkConfigured();
    const { data, error } = await supabase
      .from("mustahsiller")
      .select("*")
      .order("olusturma_tarihi", { ascending: false });

    if (error) {
      console.error("Supabase getMustahsiller error:", error);
      throw new Error(error.message);
    }

    return (data || []).map((m) => ({
      ...m,
      birim_fiyat: Number(m.birim_fiyat) || 0,
    }));
  }

  async getMustahsilById(id: string): Promise<Mustahsil | null> {
    this.checkConfigured();
    const { data, error } = await supabase
      .from("mustahsiller")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Supabase getMustahsilById error:", error);
      throw new Error(error.message);
    }

    if (!data) return null;
    return {
      ...data,
      birim_fiyat: Number(data.birim_fiyat) || 0,
    };
  }

  async addMustahsil(data: Omit<Mustahsil, "id" | "olusturma_tarihi">): Promise<Mustahsil> {
    this.checkConfigured();
    const newId = "m-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7);
    const today = new Date().toISOString().split("T")[0];

    const record: Mustahsil = {
      id: newId,
      ad: data.ad.trim(),
      telefon: data.telefon?.trim() || "",
      birim_fiyat: Number(data.birim_fiyat) || 0,
      olusturma_tarihi: today,
    };

    const { data: inserted, error } = await supabase
      .from("mustahsiller")
      .insert(record)
      .select()
      .single();

    if (error) {
      console.error("Supabase addMustahsil error:", error);
      throw new Error(error.message);
    }

    return {
      ...inserted,
      birim_fiyat: Number(inserted.birim_fiyat) || 0,
    };
  }

  async updateMustahsil(id: string, data: Partial<Mustahsil>): Promise<Mustahsil> {
    this.checkConfigured();
    const updateData: Record<string, unknown> = { ...data };
    if (updateData.birim_fiyat !== undefined) {
      updateData.birim_fiyat = Number(updateData.birim_fiyat);
    }

    const { data: updated, error } = await supabase
      .from("mustahsiller")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase updateMustahsil error:", error);
      throw new Error(error.message);
    }

    return {
      ...updated,
      birim_fiyat: Number(updated.birim_fiyat) || 0,
    };
  }

  async deleteMustahsil(id: string): Promise<boolean> {
    this.checkConfigured();
    const { error } = await supabase.from("mustahsiller").delete().eq("id", id);
    if (error) {
      console.error("Supabase deleteMustahsil error:", error);
      throw new Error(error.message);
    }
    return true;
  }

  // --- Süt Kayıt İşlemleri ---
  async getSutKayitlari(mustahsilId?: string, durum?: "aktif" | "kapatilmis"): Promise<SutKaydi[]> {
    this.checkConfigured();
    let query = supabase.from("sut_kayitlari").select("*");

    if (mustahsilId) {
      query = query.eq("mustahsil_id", mustahsilId);
    }
    if (durum) {
      query = query.eq("durum", durum);
    }

    query = query.order("tarih", { ascending: false }).order("olusturma_zamani", { ascending: false });

    const { data, error } = await query;
    if (error) {
      console.error("Supabase getSutKayitlari error:", error);
      throw new Error(error.message);
    }

    return (data || []).map((k) => ({
      ...k,
      kg: Number(k.kg) || 0,
    }));
  }

  async addSutKaydi(mustahsilId: string, tarih: string, kg: number): Promise<SutKaydi> {
    this.checkConfigured();
    const newRecord: SutKaydi = {
      id: "sk-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
      mustahsil_id: mustahsilId,
      tarih,
      kg: Number(kg) || 0,
      durum: "aktif",
      olusturma_zamani: new Date().toISOString(),
    };

    const { data: inserted, error } = await supabase
      .from("sut_kayitlari")
      .insert(newRecord)
      .select()
      .single();

    if (error) {
      console.error("Supabase addSutKaydi error:", error);
      throw new Error(error.message);
    }

    return {
      ...inserted,
      kg: Number(inserted.kg) || 0,
    };
  }

  async deleteSutKaydi(id: string): Promise<boolean> {
    this.checkConfigured();
    const { error } = await supabase.from("sut_kayitlari").delete().eq("id", id);
    if (error) {
      console.error("Supabase deleteSutKaydi error:", error);
      throw new Error(error.message);
    }
    return true;
  }

  // --- Hesap Kapatma & Raporlama ---
  async hesabiKapat(mustahsilId: string): Promise<HesapKapama> {
    this.checkConfigured();
    const mustahsil = await this.getMustahsilById(mustahsilId);
    if (!mustahsil) throw new Error("Müstahsil bulunamadı");

    const aktifKayitlar = await this.getSutKayitlari(mustahsilId, "aktif");
    if (aktifKayitlar.length === 0) {
      throw new Error("Kapatılacak aktif süt kaydı bulunamadı.");
    }

    const toplamKg = aktifKayitlar.reduce((sum, item) => sum + item.kg, 0);
    const toplamTutar = toplamKg * mustahsil.birim_fiyat;
    const kapamaId = "hk-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7);
    const kapamaTarihi = new Date().toISOString();

    const yeniKapama: HesapKapama = {
      id: kapamaId,
      mustahsil_id: mustahsilId,
      mustahsil_adi: mustahsil.ad,
      birim_fiyat: mustahsil.birim_fiyat,
      kapama_tarihi: kapamaTarihi,
      toplam_kg: toplamKg,
      toplam_tutar: toplamTutar,
      kayit_sayisi: aktifKayitlar.length,
      kayitlar: aktifKayitlar,
    };

    // 1. Hesap Kapama kaydını oluştur
    const { error: insertError } = await supabase
      .from("hesap_kapamalar")
      .insert(yeniKapama);

    if (insertError) {
      console.error("Supabase hesabiKapat insert error:", insertError);
      throw new Error(insertError.message);
    }

    // 2. Aktif süt kayıtlarını kapatılmış olarak güncelle
    const aktifIds = aktifKayitlar.map((k) => k.id);
    const { error: updateError } = await supabase
      .from("sut_kayitlari")
      .update({ durum: "kapatilmis", hesap_kapama_id: kapamaId })
      .in("id", aktifIds);

    if (updateError) {
      console.error("Supabase hesabiKapat update sut_kayitlari error:", updateError);
      throw new Error(updateError.message);
    }

    return yeniKapama;
  }

  async getEskiKayitlar(mustahsilId?: string): Promise<HesapKapama[]> {
    this.checkConfigured();
    let query = supabase.from("hesap_kapamalar").select("*");

    if (mustahsilId) {
      query = query.eq("mustahsil_id", mustahsilId);
    }

    query = query.order("kapama_tarihi", { ascending: false });

    const { data, error } = await query;
    if (error) {
      console.error("Supabase getEskiKayitlar error:", error);
      throw new Error(error.message);
    }

    return (data || []).map((hk) => ({
      ...hk,
      birim_fiyat: Number(hk.birim_fiyat) || 0,
      toplam_kg: Number(hk.toplam_kg) || 0,
      toplam_tutar: Number(hk.toplam_tutar) || 0,
      kayit_sayisi: Number(hk.kayit_sayisi) || 0,
      kayitlar: Array.isArray(hk.kayitlar) ? hk.kayitlar : [],
    }));
  }

  async getEskiKayitById(hesapKapamaId: string): Promise<HesapKapama | null> {
    this.checkConfigured();
    const { data, error } = await supabase
      .from("hesap_kapamalar")
      .select("*")
      .eq("id", hesapKapamaId)
      .maybeSingle();

    if (error) {
      console.error("Supabase getEskiKayitById error:", error);
      throw new Error(error.message);
    }

    if (!data) return null;
    return {
      ...data,
      birim_fiyat: Number(data.birim_fiyat) || 0,
      toplam_kg: Number(data.toplam_kg) || 0,
      toplam_tutar: Number(data.toplam_tutar) || 0,
      kayit_sayisi: Number(data.kayit_sayisi) || 0,
      kayitlar: Array.isArray(data.kayitlar) ? data.kayitlar : [],
    };
  }

  // --- Yoğurt Müşteri İşlemleri ---
  async getYogurtMusterileri(): Promise<YogurtMusteri[]> {
    this.checkConfigured();
    const { data, error } = await supabase
      .from("yogurt_musterileri")
      .select("*")
      .order("olusturma_tarihi", { ascending: false });

    if (error) {
      console.error("Supabase getYogurtMusterileri error:", error);
      throw new Error(error.message);
    }

    return (data || []).map((m) => ({
      ...m,
      buyuk_yogurt_fiyat: Number(m.buyuk_yogurt_fiyat) || 200,
      kucuk_yogurt_fiyat: Number(m.kucuk_yogurt_fiyat) || 120,
      iade_kova_fiyat: Number(m.iade_kova_fiyat) || 30,
      varsayilan_fiyat: m.varsayilan_fiyat !== undefined ? Number(m.varsayilan_fiyat) : undefined,
      bakiye: Number(m.bakiye) || 0,
    }));
  }

  async getYogurtMusteriById(id: string): Promise<YogurtMusteri | null> {
    this.checkConfigured();
    const { data, error } = await supabase
      .from("yogurt_musterileri")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Supabase getYogurtMusteriById error:", error);
      throw new Error(error.message);
    }

    if (!data) return null;
    return {
      ...data,
      buyuk_yogurt_fiyat: Number(data.buyuk_yogurt_fiyat) || 200,
      kucuk_yogurt_fiyat: Number(data.kucuk_yogurt_fiyat) || 120,
      iade_kova_fiyat: Number(data.iade_kova_fiyat) || 30,
      varsayilan_fiyat: data.varsayilan_fiyat !== undefined ? Number(data.varsayilan_fiyat) : undefined,
      bakiye: Number(data.bakiye) || 0,
    };
  }

  async addYogurtMusteri(
    data: Omit<YogurtMusteri, "id" | "olusturma_tarihi" | "bakiye">
  ): Promise<YogurtMusteri> {
    this.checkConfigured();
    const newId = "ym-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7);
    const today = new Date().toISOString().split("T")[0];

    const record: YogurtMusteri = {
      id: newId,
      ad: data.ad.trim(),
      telefon: data.telefon?.trim() || "",
      adres: data.adres?.trim() || "",
      buyuk_yogurt_fiyat: Number(data.buyuk_yogurt_fiyat) || 200,
      kucuk_yogurt_fiyat: Number(data.kucuk_yogurt_fiyat) || 120,
      iade_kova_fiyat: Number(data.iade_kova_fiyat) || 30,
      varsayilan_fiyat: data.varsayilan_fiyat ? Number(data.varsayilan_fiyat) : undefined,
      bakiye: 0,
      olusturma_tarihi: today,
    };

    const { data: inserted, error } = await supabase
      .from("yogurt_musterileri")
      .insert(record)
      .select()
      .single();

    if (error) {
      console.error("Supabase addYogurtMusteri error:", error);
      throw new Error(error.message);
    }

    return {
      ...inserted,
      buyuk_yogurt_fiyat: Number(inserted.buyuk_yogurt_fiyat) || 200,
      kucuk_yogurt_fiyat: Number(inserted.kucuk_yogurt_fiyat) || 120,
      iade_kova_fiyat: Number(inserted.iade_kova_fiyat) || 30,
      bakiye: Number(inserted.bakiye) || 0,
    };
  }

  async updateYogurtMusteri(id: string, data: Partial<YogurtMusteri>): Promise<YogurtMusteri> {
    this.checkConfigured();
    const updateData: Record<string, unknown> = { ...data };
    if (updateData.buyuk_yogurt_fiyat !== undefined) updateData.buyuk_yogurt_fiyat = Number(updateData.buyuk_yogurt_fiyat);
    if (updateData.kucuk_yogurt_fiyat !== undefined) updateData.kucuk_yogurt_fiyat = Number(updateData.kucuk_yogurt_fiyat);
    if (updateData.iade_kova_fiyat !== undefined) updateData.iade_kova_fiyat = Number(updateData.iade_kova_fiyat);
    if (updateData.bakiye !== undefined) updateData.bakiye = Number(updateData.bakiye);

    const { data: updated, error } = await supabase
      .from("yogurt_musterileri")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase updateYogurtMusteri error:", error);
      throw new Error(error.message);
    }

    return {
      ...updated,
      buyuk_yogurt_fiyat: Number(updated.buyuk_yogurt_fiyat) || 200,
      kucuk_yogurt_fiyat: Number(updated.kucuk_yogurt_fiyat) || 120,
      iade_kova_fiyat: Number(updated.iade_kova_fiyat) || 30,
      bakiye: Number(updated.bakiye) || 0,
    };
  }

  async deleteYogurtMusteri(id: string): Promise<boolean> {
    this.checkConfigured();
    const { error } = await supabase.from("yogurt_musterileri").delete().eq("id", id);
    if (error) {
      console.error("Supabase deleteYogurtMusteri error:", error);
      throw new Error(error.message);
    }
    return true;
  }

  // --- Müşteri Cari Bakiye Manuel Senkronizasyonu (Garantör) ---
  private async syncMusteriBakiye(musteriId: string): Promise<void> {
    try {
      const { data: dagitimlar } = await supabase
        .from("yogurt_dagitimlari")
        .select("kalan_tutar")
        .eq("musteri_id", musteriId);

      const totalBakiye = (dagitimlar || []).reduce(
        (sum, item) => sum + (Number(item.kalan_tutar) || 0),
        0
      );

      await supabase
        .from("yogurt_musterileri")
        .update({ bakiye: Math.max(0, totalBakiye) })
        .eq("id", musteriId);
    } catch (e) {
      console.warn("Bakiye senkronizasyon uyarısı:", e);
    }
  }

  // --- Yoğurt Dağıtım İşlemleri ---
  async getYogurtDagitimlari(musteriId?: string, tarih?: string): Promise<YogurtDagitim[]> {
    this.checkConfigured();
    let query = supabase.from("yogurt_dagitimlari").select("*");

    if (musteriId) {
      query = query.eq("musteri_id", musteriId);
    }
    if (tarih) {
      query = query.eq("tarih", tarih);
    }

    query = query.order("tarih", { ascending: false }).order("olusturma_zamani", { ascending: false });

    const { data, error } = await query;
    if (error) {
      console.error("Supabase getYogurtDagitimlari error:", error);
      throw new Error(error.message);
    }

    return (data || []).map((d) => ({
      ...d,
      buyuk_adet: Number(d.buyuk_adet) || 0,
      kucuk_adet: Number(d.kucuk_adet) || 0,
      iade_kova_adet: Number(d.iade_kova_adet) || 0,
      iade_buyuk_adet: Number(d.iade_buyuk_adet) || 0,
      iade_kucuk_adet: Number(d.iade_kucuk_adet) || 0,
      buyuk_birim_fiyat: Number(d.buyuk_birim_fiyat) || 0,
      kucuk_birim_fiyat: Number(d.kucuk_birim_fiyat) || 0,
      iade_kova_birim_fiyat: Number(d.iade_kova_birim_fiyat) || 0,
      toplam_tutar: Number(d.toplam_tutar) || 0,
      odenen_tutar: Number(d.odenen_tutar) || 0,
      kalan_tutar: Number(d.kalan_tutar) || 0,
      fatura_kesildi: Boolean(d.fatura_kesildi),
    }));
  }

  async getYogurtDagitimById(id: string): Promise<YogurtDagitim | null> {
    this.checkConfigured();
    const { data, error } = await supabase
      .from("yogurt_dagitimlari")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Supabase getYogurtDagitimById error:", error);
      throw new Error(error.message);
    }

    if (!data) return null;
    return {
      ...data,
      buyuk_adet: Number(data.buyuk_adet) || 0,
      kucuk_adet: Number(data.kucuk_adet) || 0,
      iade_kova_adet: Number(data.iade_kova_adet) || 0,
      iade_buyuk_adet: Number(data.iade_buyuk_adet) || 0,
      iade_kucuk_adet: Number(data.iade_kucuk_adet) || 0,
      buyuk_birim_fiyat: Number(data.buyuk_birim_fiyat) || 0,
      kucuk_birim_fiyat: Number(data.kucuk_birim_fiyat) || 0,
      iade_kova_birim_fiyat: Number(data.iade_kova_birim_fiyat) || 0,
      toplam_tutar: Number(data.toplam_tutar) || 0,
      odenen_tutar: Number(data.odenen_tutar) || 0,
      kalan_tutar: Number(data.kalan_tutar) || 0,
      fatura_kesildi: Boolean(data.fatura_kesildi),
    };
  }

  async addYogurtDagitim(
    data: Omit<YogurtDagitim, "id" | "olusturma_zamani">
  ): Promise<YogurtDagitim> {
    this.checkConfigured();
    const newRecord: YogurtDagitim = {
      ...data,
      id: "yd-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
      buyuk_adet: Number(data.buyuk_adet) || 0,
      kucuk_adet: Number(data.kucuk_adet) || 0,
      iade_kova_adet: Number(data.iade_kova_adet) || 0,
      iade_buyuk_adet: Number(data.iade_buyuk_adet) || 0,
      iade_kucuk_adet: Number(data.iade_kucuk_adet) || 0,
      buyuk_birim_fiyat: Number(data.buyuk_birim_fiyat) || 0,
      kucuk_birim_fiyat: Number(data.kucuk_birim_fiyat) || 0,
      iade_kova_birim_fiyat: Number(data.iade_kova_birim_fiyat) || 0,
      toplam_tutar: Number(data.toplam_tutar) || 0,
      odenen_tutar: Number(data.odenen_tutar) || 0,
      kalan_tutar: Number(data.kalan_tutar) || 0,
      fatura_kesildi: Boolean(data.fatura_kesildi),
      olusturma_zamani: new Date().toISOString(),
    };

    const { data: inserted, error } = await supabase
      .from("yogurt_dagitimlari")
      .insert(newRecord)
      .select()
      .single();

    if (error) {
      console.error("Supabase addYogurtDagitim error:", error);
      throw new Error(error.message);
    }

    await this.syncMusteriBakiye(data.musteri_id);

    return {
      ...inserted,
      buyuk_adet: Number(inserted.buyuk_adet) || 0,
      kucuk_adet: Number(inserted.kucuk_adet) || 0,
      toplam_tutar: Number(inserted.toplam_tutar) || 0,
      odenen_tutar: Number(inserted.odenen_tutar) || 0,
      kalan_tutar: Number(inserted.kalan_tutar) || 0,
    };
  }

  async updateYogurtDagitim(id: string, data: Partial<YogurtDagitim>): Promise<YogurtDagitim> {
    this.checkConfigured();
    const updateData: Record<string, unknown> = { ...data };

    const { data: updated, error } = await supabase
      .from("yogurt_dagitimlari")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase updateYogurtDagitim error:", error);
      throw new Error(error.message);
    }

    if (updated.musteri_id) {
      await this.syncMusteriBakiye(updated.musteri_id);
    }

    return {
      ...updated,
      buyuk_adet: Number(updated.buyuk_adet) || 0,
      kucuk_adet: Number(updated.kucuk_adet) || 0,
      toplam_tutar: Number(updated.toplam_tutar) || 0,
      odenen_tutar: Number(updated.odenen_tutar) || 0,
      kalan_tutar: Number(updated.kalan_tutar) || 0,
    };
  }

  async deleteYogurtDagitim(id: string): Promise<boolean> {
    this.checkConfigured();
    const existing = await this.getYogurtDagitimById(id);
    const { error } = await supabase.from("yogurt_dagitimlari").delete().eq("id", id);
    if (error) {
      console.error("Supabase deleteYogurtDagitim error:", error);
      throw new Error(error.message);
    }

    if (existing?.musteri_id) {
      await this.syncMusteriBakiye(existing.musteri_id);
    }

    return true;
  }

  // --- Yoğurt Üretim İşlemleri (Toplam Yoğurt) ---
  async getYogurtUretimleri(tarih?: string): Promise<YogurtUretim[]> {
    this.checkConfigured();
    let query = supabase.from("yogurt_uretimleri").select("*");
    if (tarih) {
      query = query.eq("tarih", tarih);
    }
    query = query.order("tarih", { ascending: false });

    const { data, error } = await query;
    if (error) {
      console.error("Supabase getYogurtUretimleri error:", error);
      throw new Error(error.message);
    }

    return (data || []).map((u) => ({
      ...u,
      buyuk_uretim: Number(u.buyuk_uretim) || 0,
      kucuk_uretim: Number(u.kucuk_uretim) || 0,
      maya_kg: Number(u.maya_kg) || 0,
      zayiat_adet: Number(u.zayiat_adet) || 0,
    }));
  }

  async getYogurtUretimByTarih(tarih: string): Promise<YogurtUretim | null> {
    this.checkConfigured();
    const { data, error } = await supabase
      .from("yogurt_uretimleri")
      .select("*")
      .eq("tarih", tarih)
      .maybeSingle();

    if (error) {
      console.error("Supabase getYogurtUretimByTarih error:", error);
      throw new Error(error.message);
    }

    if (!data) return null;
    return {
      ...data,
      buyuk_uretim: Number(data.buyuk_uretim) || 0,
      kucuk_uretim: Number(data.kucuk_uretim) || 0,
      maya_kg: Number(data.maya_kg) || 0,
      zayiat_adet: Number(data.zayiat_adet) || 0,
    };
  }

  async saveYogurtUretim(
    data: Omit<YogurtUretim, "id" | "olusturma_zamani">
  ): Promise<YogurtUretim> {
    this.checkConfigured();
    const existing = await this.getYogurtUretimByTarih(data.tarih);

    const record: YogurtUretim = {
      id: existing ? existing.id : "yu-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
      tarih: data.tarih,
      buyuk_uretim: Number(data.buyuk_uretim) || 0,
      kucuk_uretim: Number(data.kucuk_uretim) || 0,
      maya_kg: Number(data.maya_kg) || 0,
      zayiat_adet: Number(data.zayiat_adet) || 0,
      olusturma_zamani: existing ? existing.olusturma_zamani : new Date().toISOString(),
    };

    const { data: upserted, error } = await supabase
      .from("yogurt_uretimleri")
      .upsert(record, { onConflict: "tarih" })
      .select()
      .single();

    if (error) {
      console.error("Supabase saveYogurtUretim error:", error);
      throw new Error(error.message);
    }

    return {
      ...upserted,
      buyuk_uretim: Number(upserted.buyuk_uretim) || 0,
      kucuk_uretim: Number(upserted.kucuk_uretim) || 0,
      maya_kg: Number(upserted.maya_kg) || 0,
      zayiat_adet: Number(upserted.zayiat_adet) || 0,
    };
  }

  // --- Gider Kategorileri & Gider İşlemleri ---
  async getGiderKategorileri(): Promise<GiderKategoriItem[]> {
    this.checkConfigured();
    const { data, error } = await supabase
      .from("gider_kategorileri")
      .select("*")
      .order("ad", { ascending: true });

    if (error) {
      console.error("Supabase getGiderKategorileri error:", error);
      throw new Error(error.message);
    }

    return data || [];
  }

  async addGiderKategori(ad: string): Promise<GiderKategoriItem> {
    this.checkConfigured();
    const cleanAd = ad.trim();
    const newItem: GiderKategoriItem = {
      id: "kat-" + Date.now() + "-" + Math.random().toString(36).substring(2, 5),
      ad: cleanAd,
      color: "text-indigo-700",
      bg: "bg-indigo-50 border-indigo-200",
    };

    const { data, error } = await supabase
      .from("gider_kategorileri")
      .upsert(newItem, { onConflict: "ad" })
      .select()
      .single();

    if (error) {
      console.error("Supabase addGiderKategori error:", error);
      throw new Error(error.message);
    }

    return data;
  }

  async deleteGiderKategori(id: string): Promise<boolean> {
    this.checkConfigured();
    const { error } = await supabase.from("gider_kategorileri").delete().eq("id", id);
    if (error) {
      console.error("Supabase deleteGiderKategori error:", error);
      throw new Error(error.message);
    }
    return true;
  }

  async getGiderler(kategori?: string, tarih?: string): Promise<Gider[]> {
    this.checkConfigured();
    let query = supabase.from("giderler").select("*");

    if (kategori && kategori !== "tumu") {
      query = query.ilike("kategori", `%${kategori}%`);
    }
    if (tarih) {
      query = query.eq("tarih", tarih);
    }

    query = query.order("tarih", { ascending: false }).order("olusturma_zamani", { ascending: false });

    const { data, error } = await query;
    if (error) {
      console.error("Supabase getGiderler error:", error);
      throw new Error(error.message);
    }

    return (data || []).map((g) => ({
      ...g,
      tutar: Number(g.tutar) || 0,
    }));
  }

  async addGider(data: Omit<Gider, "id" | "olusturma_zamani">): Promise<Gider> {
    this.checkConfigured();
    const newRecord: Gider = {
      ...data,
      id: "g-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
      tutar: Number(data.tutar) || 0,
      olusturma_zamani: new Date().toISOString(),
    };

    const { data: inserted, error } = await supabase
      .from("giderler")
      .insert(newRecord)
      .select()
      .single();

    if (error) {
      console.error("Supabase addGider error:", error);
      throw new Error(error.message);
    }

    return {
      ...inserted,
      tutar: Number(inserted.tutar) || 0,
    };
  }

  async updateGider(id: string, data: Partial<Gider>): Promise<Gider> {
    this.checkConfigured();
    const updateData: Record<string, unknown> = { ...data };
    if (updateData.tutar !== undefined) updateData.tutar = Number(updateData.tutar);

    const { data: updated, error } = await supabase
      .from("giderler")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase updateGider error:", error);
      throw new Error(error.message);
    }

    return {
      ...updated,
      tutar: Number(updated.tutar) || 0,
    };
  }

  async deleteGider(id: string): Promise<boolean> {
    this.checkConfigured();
    const { error } = await supabase.from("giderler").delete().eq("id", id);
    if (error) {
      console.error("Supabase deleteGider error:", error);
      throw new Error(error.message);
    }
    return true;
  }

  // --- İstatistik / Özet ---
  async getDashboardOzet(): Promise<DashboardOzet> {
    this.checkConfigured();
    const [mustahsiller, sutKayitlari, yogurtMusterileri, yogurtDagitimlari, giderler] =
      await Promise.all([
        this.getMustahsiller(),
        this.getSutKayitlari(undefined, "aktif"),
        this.getYogurtMusterileri(),
        this.getYogurtDagitimlari(),
        this.getGiderler(),
      ]);

    const bugunStr = new Date().toISOString().split("T")[0];
    let toplamKg = 0;
    let toplamTutar = 0;
    let bugunkuKg = 0;

    const mustahsilMap = new Map(mustahsiller.map((m) => [m.id, m]));

    for (const k of sutKayitlari) {
      toplamKg += k.kg;
      if (k.tarih === bugunStr) {
        bugunkuKg += k.kg;
      }
      const m = mustahsilMap.get(k.mustahsil_id);
      if (m) {
        toplamTutar += k.kg * m.birim_fiyat;
      }
    }

    const toplamYogurtKova = yogurtDagitimlari.reduce(
      (sum, d) => sum + (d.buyuk_adet || 0) + (d.kucuk_adet || 0) + (d.kova_adedi || 0),
      0
    );
    const toplamGiderTL = giderler.reduce((sum, g) => sum + g.tutar, 0);

    return {
      toplamMustahsilSayisi: mustahsiller.length,
      aktifSutMiktariKg: toplamKg,
      aktifToplamTutarTL: toplamTutar,
      bugunkuSutKg: bugunkuKg,
      toplamYogurtMusterisi: yogurtMusterileri.length,
      toplamDagitilanYogurtKova: toplamYogurtKova,
      aylikToplamGiderTL: toplamGiderTL,
    };
  }

  // --- Aylık İstatistik Kapanışları & Dönem Arşivi ---
  async getAylikKapanislar(): Promise<AylikIstatistikKapanis[]> {
    this.checkConfigured();
    const { data, error } = await supabase
      .from("aylik_istatistikler")
      .select("*")
      .order("kapanis_tarihi", { ascending: false });

    if (error) {
      console.error("Supabase getAylikKapanislar error:", error);
      throw new Error(error.message);
    }

    return (data || []).map((k) => ({
      ...k,
      toplam_yogurt_ciro: Number(k.toplam_yogurt_ciro) || 0,
      toplam_yogurt_tahsilat: Number(k.toplam_yogurt_tahsilat) || 0,
      toplam_veresiye_alacak: Number(k.toplam_veresiye_alacak) || 0,
      toplam_sut_kg: Number(k.toplam_sut_kg) || 0,
      toplam_sut_maliyeti: Number(k.toplam_sut_maliyeti) || 0,
      toplam_gider: Number(k.toplam_gider) || 0,
      net_kar_zarar: Number(k.net_kar_zarar) || 0,
      teslimat_sayisi: Number(k.teslimat_sayisi) || 0,
      gider_sayisi: Number(k.gider_sayisi) || 0,
      detay_json: typeof k.detay_json === "object" ? k.detay_json : {},
    }));
  }

  async createAylikKapanis(
    data: Omit<AylikIstatistikKapanis, "id" | "olusturma_zamani">
  ): Promise<AylikIstatistikKapanis> {
    this.checkConfigured();
    const newRecord: AylikIstatistikKapanis = {
      ...data,
      id: "ak-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
      olusturma_zamani: new Date().toISOString(),
    };

    const { data: inserted, error } = await supabase
      .from("aylik_istatistikler")
      .insert(newRecord)
      .select()
      .single();

    if (error) {
      console.error("Supabase createAylikKapanis error:", error);
      throw new Error(error.message);
    }

    return {
      ...inserted,
      toplam_yogurt_ciro: Number(inserted.toplam_yogurt_ciro) || 0,
      toplam_yogurt_tahsilat: Number(inserted.toplam_yogurt_tahsilat) || 0,
      toplam_veresiye_alacak: Number(inserted.toplam_veresiye_alacak) || 0,
      toplam_sut_kg: Number(inserted.toplam_sut_kg) || 0,
      toplam_sut_maliyeti: Number(inserted.toplam_sut_maliyeti) || 0,
      toplam_gider: Number(inserted.toplam_gider) || 0,
      net_kar_zarar: Number(inserted.net_kar_zarar) || 0,
    };
  }

  async deleteAylikKapanis(id: string): Promise<boolean> {
    this.checkConfigured();
    const { error } = await supabase.from("aylik_istatistikler").delete().eq("id", id);
    if (error) {
      console.error("Supabase deleteAylikKapanis error:", error);
      throw new Error(error.message);
    }
    return true;
  }

  async getSonKapanisTarihi(): Promise<string | null> {
    this.checkConfigured();
    const { data, error } = await supabase
      .from("aylik_istatistikler")
      .select("kapanis_tarihi")
      .order("kapanis_tarihi", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Supabase getSonKapanisTarihi error:", error);
      return null;
    }

    return data?.kapanis_tarihi || null;
  }

  // --- Yedekleme & Geri Yükleme & LocalStorage Migrasyonu ---
  async exportSistemYedegi(): Promise<SistemYedegi> {
    this.checkConfigured();
    const [
      mustahsiller,
      sut_kayitlari,
      hesap_kapamalar,
      yogurt_musterileri,
      yogurt_dagitimlari,
      yogurt_uretimleri,
      gider_kategorileri,
      giderler,
      aylik_kapanislar,
    ] = await Promise.all([
      this.getMustahsiller(),
      this.getSutKayitlari(),
      this.getEskiKayitlar(),
      this.getYogurtMusterileri(),
      this.getYogurtDagitimlari(),
      this.getYogurtUretimleri(),
      this.getGiderKategorileri(),
      this.getGiderler(),
      this.getAylikKapanislar(),
    ]);

    return {
      versiyon: "2.0.0",
      tarih: new Date().toISOString(),
      mustahsiller,
      sut_kayitlari,
      hesap_kapamalar,
      yogurt_musterileri,
      yogurt_dagitimlari,
      yogurt_uretimleri,
      gider_kategorileri,
      giderler,
      aylik_kapanislar,
    };
  }

  async importSistemYedegi(yedek: SistemYedegi): Promise<boolean> {
    this.checkConfigured();
    if (!yedek || !yedek.versiyon) {
      throw new Error("Geçersiz yedek dosyası formatı.");
    }

    // Sıralı ve ilişkisel bütünlüğü koruyarak toplu ekleme (Upsert)
    if (yedek.mustahsiller && yedek.mustahsiller.length > 0) {
      const { error } = await supabase
        .from("mustahsiller")
        .upsert(yedek.mustahsiller, { onConflict: "id" });
      if (error) console.error("Import mustahsiller error:", error);
    }

    if (yedek.hesap_kapamalar && yedek.hesap_kapamalar.length > 0) {
      const { error } = await supabase
        .from("hesap_kapamalar")
        .upsert(yedek.hesap_kapamalar, { onConflict: "id" });
      if (error) console.error("Import hesap_kapamalar error:", error);
    }

    if (yedek.sut_kayitlari && yedek.sut_kayitlari.length > 0) {
      const { error } = await supabase
        .from("sut_kayitlari")
        .upsert(yedek.sut_kayitlari, { onConflict: "id" });
      if (error) console.error("Import sut_kayitlari error:", error);
    }

    if (yedek.yogurt_musterileri && yedek.yogurt_musterileri.length > 0) {
      const { error } = await supabase
        .from("yogurt_musterileri")
        .upsert(yedek.yogurt_musterileri, { onConflict: "id" });
      if (error) console.error("Import yogurt_musterileri error:", error);
    }

    if (yedek.yogurt_dagitimlari && yedek.yogurt_dagitimlari.length > 0) {
      const { error } = await supabase
        .from("yogurt_dagitimlari")
        .upsert(yedek.yogurt_dagitimlari, { onConflict: "id" });
      if (error) console.error("Import yogurt_dagitimlari error:", error);
    }

    if (yedek.yogurt_uretimleri && yedek.yogurt_uretimleri.length > 0) {
      const { error } = await supabase
        .from("yogurt_uretimleri")
        .upsert(yedek.yogurt_uretimleri, { onConflict: "tarih" });
      if (error) console.error("Import yogurt_uretimleri error:", error);
    }

    if (yedek.gider_kategorileri && yedek.gider_kategorileri.length > 0) {
      const { error } = await supabase
        .from("gider_kategorileri")
        .upsert(yedek.gider_kategorileri, { onConflict: "ad" });
      if (error) console.error("Import gider_kategorileri error:", error);
    }

    if (yedek.giderler && yedek.giderler.length > 0) {
      const { error } = await supabase
        .from("giderler")
        .upsert(yedek.giderler, { onConflict: "id" });
      if (error) console.error("Import giderler error:", error);
    }

    if (yedek.aylik_kapanislar && yedek.aylik_kapanislar.length > 0) {
      const { error } = await supabase
        .from("aylik_istatistikler")
        .upsert(yedek.aylik_kapanislar, { onConflict: "id" });
      if (error) console.error("Import aylik_istatistikler error:", error);
    }

    return true;
  }

  // --- LocalStorage'dan Supabase'e Otomatik Taşıma Yardımcısı ---
  async migrateFromLocalStorage(localData: SistemYedegi): Promise<{
    success: boolean;
    counts: {
      mustahsiller: number;
      sutKayitlari: number;
      hesapKapamalar: number;
      yogurtMusterileri: number;
      yogurtDagitimlari: number;
      giderler: number;
    };
  }> {
    await this.importSistemYedegi(localData);
    return {
      success: true,
      counts: {
        mustahsiller: localData.mustahsiller?.length || 0,
        sutKayitlari: localData.sut_kayitlari?.length || 0,
        hesapKapamalar: localData.hesap_kapamalar?.length || 0,
        yogurtMusterileri: localData.yogurt_musterileri?.length || 0,
        yogurtDagitimlari: localData.yogurt_dagitimlari?.length || 0,
        giderler: localData.giderler?.length || 0,
      },
    };
  }
}

export const supabaseService = new SupabaseService();

