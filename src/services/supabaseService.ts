/**
 * Supabase Entegrasyon Şablonu
 *
 * Bu servis IDataService interface'ini implemente eder.
 * İleride Supabase kullanılmak istendiğinde:
 * 1. `@supabase/supabase-js` paketi eklenir (`npm install @supabase/supabase-js`)
 * 2. `.env.local` dosyasına SUPABASE_URL ve SUPABASE_ANON_KEY tanımlanır
 * 3. `src/services/index.ts` dosyasında `dataService = supabaseService` olarak değiştirilir.
 */

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
} from "../types/database";
import { IDataService } from "./storageInterface";

class SupabaseService implements IDataService {
  async getMustahsiller(): Promise<Mustahsil[]> {
    throw new Error("Supabase henüz yapılandırılmadı. Lütfen localStorage servisini kullanın.");
  }
  async getMustahsilById(_id: string): Promise<Mustahsil | null> {
    throw new Error("Supabase henüz yapılandırılmadı.");
  }
  async addMustahsil(_data: Omit<Mustahsil, "id" | "olusturma_tarihi">): Promise<Mustahsil> {
    throw new Error("Supabase henüz yapılandırılmadı.");
  }
  async updateMustahsil(_id: string, _data: Partial<Mustahsil>): Promise<Mustahsil> {
    throw new Error("Supabase henüz yapılandırılmadı.");
  }
  async deleteMustahsil(_id: string): Promise<boolean> {
    throw new Error("Supabase henüz yapılandırılmadı.");
  }
  async getSutKayitlari(_mustahsilId?: string, _durum?: "aktif" | "kapatilmis"): Promise<SutKaydi[]> {
    throw new Error("Supabase henüz yapılandırılmadı.");
  }
  async addSutKaydi(_mustahsilId: string, _tarih: string, _kg: number): Promise<SutKaydi> {
    throw new Error("Supabase henüz yapılandırılmadı.");
  }
  async deleteSutKaydi(_id: string): Promise<boolean> {
    throw new Error("Supabase henüz yapılandırılmadı.");
  }
  async hesabiKapat(_mustahsilId: string): Promise<HesapKapama> {
    throw new Error("Supabase henüz yapılandırılmadı.");
  }
  async getEskiKayitlar(_mustahsilId?: string): Promise<HesapKapama[]> {
    throw new Error("Supabase henüz yapılandırılmadı.");
  }
  async getEskiKayitById(_hesapKapamaId: string): Promise<HesapKapama | null> {
    throw new Error("Supabase henüz yapılandırılmadı.");
  }

  async getYogurtMusterileri(): Promise<YogurtMusteri[]> {
    throw new Error("Supabase henüz yapılandırılmadı.");
  }
  async getYogurtMusteriById(_id: string): Promise<YogurtMusteri | null> {
    throw new Error("Supabase henüz yapılandırılmadı.");
  }
  async addYogurtMusteri(
    _data: Omit<YogurtMusteri, "id" | "olusturma_tarihi" | "bakiye">
  ): Promise<YogurtMusteri> {
    throw new Error("Supabase henüz yapılandırılmadı.");
  }
  async updateYogurtMusteri(_id: string, _data: Partial<YogurtMusteri>): Promise<YogurtMusteri> {
    throw new Error("Supabase henüz yapılandırılmadı.");
  }
  async deleteYogurtMusteri(_id: string): Promise<boolean> {
    throw new Error("Supabase henüz yapılandırılmadı.");
  }

  async getYogurtDagitimlari(_musteriId?: string, _tarih?: string): Promise<YogurtDagitim[]> {
    throw new Error("Supabase henüz yapılandırılmadı.");
  }
  async getYogurtDagitimById(_id: string): Promise<YogurtDagitim | null> {
    throw new Error("Supabase henüz yapılandırılmadı.");
  }
  async addYogurtDagitim(
    _data: Omit<YogurtDagitim, "id" | "olusturma_zamani">
  ): Promise<YogurtDagitim> {
    throw new Error("Supabase henüz yapılandırılmadı.");
  }
  async updateYogurtDagitim(_id: string, _data: Partial<YogurtDagitim>): Promise<YogurtDagitim> {
    throw new Error("Supabase henüz yapılandırılmadı.");
  }
  async deleteYogurtDagitim(_id: string): Promise<boolean> {
    throw new Error("Supabase henüz yapılandırılmadı.");
  }

  async getYogurtUretimleri(_tarih?: string): Promise<YogurtUretim[]> {
    throw new Error("Supabase henüz yapılandırılmadı.");
  }
  async getYogurtUretimByTarih(_tarih: string): Promise<YogurtUretim | null> {
    throw new Error("Supabase henüz yapılandırılmadı.");
  }
  async saveYogurtUretim(
    _data: Omit<YogurtUretim, "id" | "olusturma_zamani">
  ): Promise<YogurtUretim> {
    throw new Error("Supabase henüz yapılandırılmadı.");
  }

  async getGiderKategorileri(): Promise<GiderKategoriItem[]> {
    throw new Error("Supabase henüz yapılandırılmadı.");
  }
  async addGiderKategori(_ad: string): Promise<GiderKategoriItem> {
    throw new Error("Supabase henüz yapılandırılmadı.");
  }
  async deleteGiderKategori(_id: string): Promise<boolean> {
    throw new Error("Supabase henüz yapılandırılmadı.");
  }
  async getGiderler(_kategori?: string, _tarih?: string): Promise<Gider[]> {
    throw new Error("Supabase henüz yapılandırılmadı.");
  }
  async addGider(_data: Omit<Gider, "id" | "olusturma_zamani">): Promise<Gider> {
    throw new Error("Supabase henüz yapılandırılmadı.");
  }
  async updateGider(_id: string, _data: Partial<Gider>): Promise<Gider> {
    throw new Error("Supabase henüz yapılandırılmadı.");
  }
  async deleteGider(_id: string): Promise<boolean> {
    throw new Error("Supabase henüz yapılandırılmadı.");
  }

  async getDashboardOzet(): Promise<DashboardOzet> {
    throw new Error("Supabase henüz yapılandırılmadı.");
  }
  async exportSistemYedegi(): Promise<SistemYedegi> {
    throw new Error("Supabase henüz yapılandırılmadı.");
  }
  async importSistemYedegi(_yedek: SistemYedegi): Promise<boolean> {
    throw new Error("Supabase henüz yapılandırılmadı.");
  }
}

export const supabaseService = new SupabaseService();
