export type KayitDurumu = "aktif" | "kapatilmis";

export interface Mustahsil {
  id: string;
  ad: string;
  telefon?: string;
  birim_fiyat: number; // TL / kg
  olusturma_tarihi: string;
}

export interface SutKaydi {
  id: string;
  mustahsil_id: string;
  tarih: string; // YYYY-MM-DD
  kg: number;
  durum: KayitDurumu;
  olusturma_zamani: string;
  hesap_kapama_id?: string;
}

export interface HesapKapama {
  id: string;
  mustahsil_id: string;
  mustahsil_adi: string;
  birim_fiyat: number;
  kapama_tarihi: string; // ISO String veya YYYY-MM-DD
  toplam_kg: number;
  toplam_tutar: number;
  kayit_sayisi: number;
  kayitlar: SutKaydi[];
}

// --- Yoğurt Dağılım Tipleri ---
export interface YogurtMusteri {
  id: string;
  ad: string;
  telefon?: string;
  adres?: string;
  buyuk_yogurt_fiyat: number; // Büyük kova birim fiyatı (TL)
  kucuk_yogurt_fiyat: number; // Küçük kova birim fiyatı (TL)
  iade_kova_fiyat: number;    // İade kova indirim fiyatı (TL)
  varsayilan_fiyat?: number;  // Geriye dönük uyumluluk için opsiyonel
  bakiye: number;             // Toplam veresiye/kalan borç
  olusturma_tarihi: string;
}

export type OdemeDurumu = "odendi" | "odenmedi" | "kismi";

export interface YogurtDagitim {
  id: string;
  musteri_id: string;
  musteri_adi: string;
  tarih: string; // YYYY-MM-DD
  buyuk_adet: number;
  kucuk_adet: number;
  iade_kova_adet: number;
  iade_buyuk_adet: number;
  iade_kucuk_adet: number;
  buyuk_birim_fiyat: number;
  kucuk_birim_fiyat: number;
  iade_kova_birim_fiyat: number;
  toplam_tutar: number;
  odeme_durumu: OdemeDurumu;
  odenen_tutar: number;
  kalan_tutar: number;
  fatura_kesildi: boolean;
  fatura_tarihi?: string;
  olusturma_zamani: string;

  // Geriye dönük uyumluluk opsiyonel alanları
  kova_adedi?: number;
  kova_tipi?: string;
  birim_fiyat?: number;
  tahsil_edilen?: number;
  notlar?: string;
}

export interface YogurtUretim {
  id: string;
  tarih: string; // YYYY-MM-DD
  buyuk_uretim: number;
  kucuk_uretim: number;
  maya_kg: number;
  zayiat_adet: number;
  olusturma_zamani: string;
}

// --- Giderler Tipleri ---
export interface GiderKategoriItem {
  id: string;
  ad: string;
  iconName?: string;
  color?: string;
  bg?: string;
}

export type GiderKategori = string;

export interface Gider {
  id: string;
  baslik: string;
  kategori: string;
  tutar: number;
  tarih: string; // YYYY-MM-DD
  aciklama?: string;
  olusturma_zamani: string;
}

// --- Dashboard & İstatistik Tipleri ---
export interface DashboardOzet {
  toplamMustahsilSayisi: number;
  aktifSutMiktariKg: number;
  aktifToplamTutarTL: number;
  bugunkuSutKg: number;
  toplamYogurtMusterisi: number;
  toplamDagitilanYogurtKova: number;
  aylikToplamGiderTL: number;
}

export interface SistemYedegi {
  versiyon: string;
  tarih: string;
  mustahsiller: Mustahsil[];
  sut_kayitlari: SutKaydi[];
  hesap_kapamalar: HesapKapama[];
  yogurt_musterileri: YogurtMusteri[];
  yogurt_dagitimlari: YogurtDagitim[];
  yogurt_uretimleri?: YogurtUretim[];
  gider_kategorileri?: GiderKategoriItem[];
  giderler: Gider[];
}
