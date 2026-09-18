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


export interface IDataService {
  // Müstahsil İşlemleri
  getMustahsiller(): Promise<Mustahsil[]>;
  getMustahsilById(id: string): Promise<Mustahsil | null>;
  addMustahsil(data: Omit<Mustahsil, "id" | "olusturma_tarihi">): Promise<Mustahsil>;
  updateMustahsil(id: string, data: Partial<Mustahsil>): Promise<Mustahsil>;
  deleteMustahsil(id: string): Promise<boolean>;

  // Süt Kayıt İşlemleri
  getSutKayitlari(mustahsilId?: string, durum?: "aktif" | "kapatilmis"): Promise<SutKaydi[]>;
  addSutKaydi(mustahsilId: string, tarih: string, kg: number): Promise<SutKaydi>;
  deleteSutKaydi(id: string): Promise<boolean>;

  // Hesap Kapatma & Raporlama İşlemleri
  hesabiKapat(mustahsilId: string): Promise<HesapKapama>;
  getEskiKayitlar(mustahsilId?: string): Promise<HesapKapama[]>;
  getEskiKayitById(hesapKapamaId: string): Promise<HesapKapama | null>;

  // Yoğurt Müşteri İşlemleri
  getYogurtMusterileri(): Promise<YogurtMusteri[]>;
  getYogurtMusteriById(id: string): Promise<YogurtMusteri | null>;
  addYogurtMusteri(data: Omit<YogurtMusteri, "id" | "olusturma_tarihi" | "bakiye">): Promise<YogurtMusteri>;
  updateYogurtMusteri(id: string, data: Partial<YogurtMusteri>): Promise<YogurtMusteri>;
  deleteYogurtMusteri(id: string): Promise<boolean>;

  // Yoğurt Dağıtım İşlemleri
  getYogurtDagitimlari(musteriId?: string, tarih?: string): Promise<YogurtDagitim[]>;
  getYogurtDagitimById(id: string): Promise<YogurtDagitim | null>;
  addYogurtDagitim(data: Omit<YogurtDagitim, "id" | "olusturma_zamani">): Promise<YogurtDagitim>;
  updateYogurtDagitim(id: string, data: Partial<YogurtDagitim>): Promise<YogurtDagitim>;
  deleteYogurtDagitim(id: string): Promise<boolean>;

  // Yoğurt Üretim İşlemleri (Toplam Yoğurt)
  getYogurtUretimleri(tarih?: string): Promise<YogurtUretim[]>;
  getYogurtUretimByTarih(tarih: string): Promise<YogurtUretim | null>;
  saveYogurtUretim(data: Omit<YogurtUretim, "id" | "olusturma_zamani">): Promise<YogurtUretim>;

  // Gider Kategorileri & Gider İşlemleri
  getGiderKategorileri(): Promise<GiderKategoriItem[]>;
  addGiderKategori(ad: string): Promise<GiderKategoriItem>;
  deleteGiderKategori(id: string): Promise<boolean>;
  getGiderler(kategori?: string, tarih?: string): Promise<Gider[]>;
  addGider(data: Omit<Gider, "id" | "olusturma_zamani">): Promise<Gider>;
  updateGider(id: string, data: Partial<Gider>): Promise<Gider>;
  deleteGider(id: string): Promise<boolean>;

  // İstatistik / Özet
  getDashboardOzet(): Promise<DashboardOzet>;

  // Aylık İstatistik Dönem Kapanışları & Arşiv
  getAylikKapanislar(): Promise<AylikIstatistikKapanis[]>;
  createAylikKapanis(data: Omit<AylikIstatistikKapanis, "id" | "olusturma_zamani">): Promise<AylikIstatistikKapanis>;
  deleteAylikKapanis(id: string): Promise<boolean>;
  getSonKapanisTarihi(): Promise<string | null>;

  // Yedekleme & Geri Yükleme
  exportSistemYedegi(): Promise<SistemYedegi>;
  importSistemYedegi(yedek: SistemYedegi): Promise<boolean>;
}


