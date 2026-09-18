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

const STORAGE_KEYS = {
  MUSTAHSILLER: "sut_defteri_mustahsiller",
  SUT_KAYITLARI: "sut_defteri_sut_kayitlari",
  HESAP_KAPAMALAR: "sut_defteri_hesap_kapamalar",
  YOGURT_MUSTERILERI: "sut_defteri_yogurt_musterileri",
  YOGURT_DAGITIMLARI: "sut_defteri_yogurt_dagitimlari",
  YOGURT_URETIMLERI: "sut_defteri_yogurt_uretimleri",
  GIDER_KATEGORILERI: "sut_defteri_gider_kategorileri",
  GIDERLER: "sut_defteri_giderler",
  AYLIK_KAPANISLAR: "sut_defteri_aylik_kapanislar",
};


// Başlangıç için örnek mock veriler
const DEFAULT_MUSTAHSILLER: Mustahsil[] = [
  {
    id: "m-1",
    ad: "Ahmet Yılmaz (Örnek)",
    telefon: "0532 111 22 33",
    birim_fiyat: 16.5,
    olusturma_tarihi: new Date().toISOString().split("T")[0],
  },
  {
    id: "m-2",
    ad: "Mehmet Demir (Örnek)",
    telefon: "0544 222 33 44",
    birim_fiyat: 17.0,
    olusturma_tarihi: new Date().toISOString().split("T")[0],
  },
];

const DEFAULT_YOGURT_MUSTERILERI: YogurtMusteri[] = [
  {
    id: "ym-1",
    ad: "Köşem Market (Örnek)",
    telefon: "0530 123 45 67",
    adres: "Merkez Mah. No: 12",
    buyuk_yogurt_fiyat: 200,
    kucuk_yogurt_fiyat: 120,
    iade_kova_fiyat: 30,
    bakiye: 0,
    olusturma_tarihi: new Date().toISOString().split("T")[0],
  },
  {
    id: "ym-2",
    ad: "Bereket Şarküteri (Örnek)",
    telefon: "0542 987 65 43",
    adres: "Pazar Cad. No: 5",
    buyuk_yogurt_fiyat: 210,
    kucuk_yogurt_fiyat: 130,
    iade_kova_fiyat: 35,
    bakiye: 0,
    olusturma_tarihi: new Date().toISOString().split("T")[0],
  },
];

const DEFAULT_GIDER_KATEGORILERI: GiderKategoriItem[] = [
  { id: "kat-yem", ad: "Yem & Saman", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
  { id: "kat-akaryakit", ad: "Akaryakıt / Mazot", color: "text-rose-700", bg: "bg-rose-50 border-rose-200" },
  { id: "kat-personel", ad: "Personel & İşçilik", color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
  { id: "kat-veteriner", ad: "Veteriner & İlaç", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  { id: "kat-elektrik", ad: "Elektrik & Su", color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200" },
  { id: "kat-bakim", ad: "Bakım & Onarım", color: "text-purple-700", bg: "bg-purple-50 border-purple-200" },
  { id: "kat-diger", ad: "Diğer Giderler", color: "text-slate-700", bg: "bg-slate-50 border-slate-200" },
];

const DEFAULT_GIDERLER: Gider[] = [
  {
    id: "g-1",
    baslik: "Besi Yemi Alımı (20 Çuval)",
    kategori: "Yem & Saman",
    tutar: 8400,
    tarih: new Date().toISOString().split("T")[0],
    aciklama: "Tarım kooperatifinden peşin alındı",
    olusturma_zamani: new Date().toISOString(),
  },
  {
    id: "g-2",
    baslik: "Süt Toplama Aracı Mazot",
    kategori: "Akaryakıt / Mazot",
    tutar: 1850,
    tarih: new Date().toISOString().split("T")[0],
    aciklama: "Haftalık dağıtım mazotu",
    olusturma_zamani: new Date().toISOString(),
  },
];

class LocalStorageService implements IDataService {
  private isClient(): boolean {
    return typeof window !== "undefined";
  }

  private getItem<T>(key: string, fallback: T): T {
    if (!this.isClient()) return fallback;
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  }

  private setItem<T>(key: string, data: T): void {
    if (!this.isClient()) return;
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error("LocalStorage write error:", e);
    }
  }

  // --- Müstahsil İşlemleri ---
  async getMustahsiller(): Promise<Mustahsil[]> {
    const list = this.getItem<Mustahsil[]>(STORAGE_KEYS.MUSTAHSILLER, []);
    if (list.length === 0 && this.isClient()) {
      this.setItem(STORAGE_KEYS.MUSTAHSILLER, DEFAULT_MUSTAHSILLER);
      return DEFAULT_MUSTAHSILLER;
    }
    return list;
  }

  async getMustahsilById(id: string): Promise<Mustahsil | null> {
    const list = await this.getMustahsiller();
    return list.find((m) => m.id === id) || null;
  }

  async addMustahsil(data: Omit<Mustahsil, "id" | "olusturma_tarihi">): Promise<Mustahsil> {
    const list = await this.getMustahsiller();
    const newMustahsil: Mustahsil = {
      ...data,
      id: "m-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
      olusturma_tarihi: new Date().toISOString().split("T")[0],
    };
    list.push(newMustahsil);
    this.setItem(STORAGE_KEYS.MUSTAHSILLER, list);
    return newMustahsil;
  }

  async updateMustahsil(id: string, data: Partial<Mustahsil>): Promise<Mustahsil> {
    const list = await this.getMustahsiller();
    const index = list.findIndex((m) => m.id === id);
    if (index === -1) throw new Error("Müstahsil bulunamadı");
    list[index] = { ...list[index], ...data };
    this.setItem(STORAGE_KEYS.MUSTAHSILLER, list);
    return list[index];
  }

  async deleteMustahsil(id: string): Promise<boolean> {
    let list = await this.getMustahsiller();
    list = list.filter((m) => m.id !== id);
    this.setItem(STORAGE_KEYS.MUSTAHSILLER, list);
    return true;
  }

  // --- Süt Kayıt İşlemleri ---
  async getSutKayitlari(mustahsilId?: string, durum?: "aktif" | "kapatilmis"): Promise<SutKaydi[]> {
    let list = this.getItem<SutKaydi[]>(STORAGE_KEYS.SUT_KAYITLARI, []);
    if (mustahsilId) {
      list = list.filter((k) => k.mustahsil_id === mustahsilId);
    }
    if (durum) {
      list = list.filter((k) => k.durum === durum);
    }
    return list.sort((a, b) => (a.tarih > b.tarih ? -1 : 1));
  }

  async addSutKaydi(mustahsilId: string, tarih: string, kg: number): Promise<SutKaydi> {
    const list = this.getItem<SutKaydi[]>(STORAGE_KEYS.SUT_KAYITLARI, []);
    const newKayit: SutKaydi = {
      id: "sk-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
      mustahsil_id: mustahsilId,
      tarih,
      kg: Number(kg),
      durum: "aktif",
      olusturma_zamani: new Date().toISOString(),
    };
    list.unshift(newKayit);
    this.setItem(STORAGE_KEYS.SUT_KAYITLARI, list);
    return newKayit;
  }

  async deleteSutKaydi(id: string): Promise<boolean> {
    let list = this.getItem<SutKaydi[]>(STORAGE_KEYS.SUT_KAYITLARI, []);
    list = list.filter((k) => k.id !== id);
    this.setItem(STORAGE_KEYS.SUT_KAYITLARI, list);
    return true;
  }

  // --- Hesap Kapatma & Eski Kayıtlar ---
  async hesabiKapat(mustahsilId: string): Promise<HesapKapama> {
    const mustahsil = await this.getMustahsilById(mustahsilId);
    if (!mustahsil) throw new Error("Müstahsil bulunamadı");

    const allKayitlar = this.getItem<SutKaydi[]>(STORAGE_KEYS.SUT_KAYITLARI, []);
    const aktifKayitlar = allKayitlar.filter(
      (k) => k.mustahsil_id === mustahsilId && k.durum === "aktif"
    );

    if (aktifKayitlar.length === 0) {
      throw new Error("Kapatılacak aktif süt kaydı bulunamadı.");
    }

    const toplamKg = aktifKayitlar.reduce((sum, item) => sum + item.kg, 0);
    const toplamTutar = toplamKg * mustahsil.birim_fiyat;
    const kapamaId = "hk-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7);
    const kapamaTarihi = new Date().toISOString();

    const updatedKayitlar = allKayitlar.map((k) => {
      if (k.mustahsil_id === mustahsilId && k.durum === "aktif") {
        return { ...k, durum: "kapatilmis" as const, hesap_kapama_id: kapamaId };
      }
      return k;
    });
    this.setItem(STORAGE_KEYS.SUT_KAYITLARI, updatedKayitlar);

    const kapamalar = this.getItem<HesapKapama[]>(STORAGE_KEYS.HESAP_KAPAMALAR, []);
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
    kapamalar.unshift(yeniKapama);
    this.setItem(STORAGE_KEYS.HESAP_KAPAMALAR, kapamalar);

    return yeniKapama;
  }

  async getEskiKayitlar(mustahsilId?: string): Promise<HesapKapama[]> {
    let list = this.getItem<HesapKapama[]>(STORAGE_KEYS.HESAP_KAPAMALAR, []);
    if (mustahsilId) {
      list = list.filter((hk) => hk.mustahsil_id === mustahsilId);
    }
    return list;
  }

  async getEskiKayitById(hesapKapamaId: string): Promise<HesapKapama | null> {
    const list = await this.getEskiKayitlar();
    return list.find((hk) => hk.id === hesapKapamaId) || null;
  }

  // --- Müşteri Bakiye Otomatik Yeniden Hesaplama ---
  private async recalculateMusteriBakiyeleri(): Promise<void> {
    const musteriler = this.getItem<YogurtMusteri[]>(STORAGE_KEYS.YOGURT_MUSTERILERI, []);
    const dagitimlar = this.getItem<YogurtDagitim[]>(STORAGE_KEYS.YOGURT_DAGITIMLARI, []);

    // Müşteri bazında ödenmemiş kalan tutarları topla
    const bakiyeMap: Record<string, number> = {};
    for (const d of dagitimlar) {
      const kalan = Number(d.kalan_tutar) || 0;
      bakiyeMap[d.musteri_id] = (bakiyeMap[d.musteri_id] || 0) + kalan;
    }

    let degisiklikVar = false;
    for (const m of musteriler) {
      const yeniBakiye = bakiyeMap[m.id] || 0;
      if (m.bakiye !== yeniBakiye) {
        m.bakiye = Math.max(0, yeniBakiye);
        degisiklikVar = true;
      }
    }

    if (degisiklikVar) {
      this.setItem(STORAGE_KEYS.YOGURT_MUSTERILERI, musteriler);
    }
  }

  // --- Yoğurt Müşteri İşlemleri ---
  async getYogurtMusterileri(): Promise<YogurtMusteri[]> {
    let list = this.getItem<YogurtMusteri[]>(STORAGE_KEYS.YOGURT_MUSTERILERI, []);
    if (list.length === 0 && this.isClient()) {
      this.setItem(STORAGE_KEYS.YOGURT_MUSTERILERI, DEFAULT_YOGURT_MUSTERILERI);
      return DEFAULT_YOGURT_MUSTERILERI;
    }

    // Eski şemadan kalan kayıtlar varsa varsayılan fiyatları güvenli şekilde normalize et
    let normalized = false;
    list = list.map((m) => {
      const buyuk = m.buyuk_yogurt_fiyat ?? m.varsayilan_fiyat ?? 200;
      const kucuk = m.kucuk_yogurt_fiyat ?? Math.round(buyuk * 0.6);
      const kova = m.iade_kova_fiyat ?? 30;
      if (
        m.buyuk_yogurt_fiyat !== buyuk ||
        m.kucuk_yogurt_fiyat !== kucuk ||
        m.iade_kova_fiyat !== kova
      ) {
        normalized = true;
        return {
          ...m,
          buyuk_yogurt_fiyat: buyuk,
          kucuk_yogurt_fiyat: kucuk,
          iade_kova_fiyat: kova,
        };
      }
      return m;
    });

    if (normalized) {
      this.setItem(STORAGE_KEYS.YOGURT_MUSTERILERI, list);
    }

    return list;
  }

  async getYogurtMusteriById(id: string): Promise<YogurtMusteri | null> {
    const list = await this.getYogurtMusterileri();
    return list.find((m) => m.id === id) || null;
  }

  async addYogurtMusteri(
    data: Omit<YogurtMusteri, "id" | "olusturma_tarihi" | "bakiye">
  ): Promise<YogurtMusteri> {
    const list = await this.getYogurtMusterileri();
    const newMusteri: YogurtMusteri = {
      ...data,
      id: "ym-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
      bakiye: 0,
      olusturma_tarihi: new Date().toISOString().split("T")[0],
    };
    list.push(newMusteri);
    this.setItem(STORAGE_KEYS.YOGURT_MUSTERILERI, list);
    return newMusteri;
  }

  async updateYogurtMusteri(id: string, data: Partial<YogurtMusteri>): Promise<YogurtMusteri> {
    const list = await this.getYogurtMusterileri();
    const index = list.findIndex((m) => m.id === id);
    if (index === -1) throw new Error("Müşteri bulunamadı");
    list[index] = { ...list[index], ...data };
    this.setItem(STORAGE_KEYS.YOGURT_MUSTERILERI, list);
    return list[index];
  }

  async deleteYogurtMusteri(id: string): Promise<boolean> {
    let list = await this.getYogurtMusterileri();
    list = list.filter((m) => m.id !== id);
    this.setItem(STORAGE_KEYS.YOGURT_MUSTERILERI, list);
    return true;
  }

  // --- Yoğurt Dağıtım İşlemleri ---
  async getYogurtDagitimlari(musteriId?: string, tarih?: string): Promise<YogurtDagitim[]> {
    let list = this.getItem<YogurtDagitim[]>(STORAGE_KEYS.YOGURT_DAGITIMLARI, []);
    if (musteriId) {
      list = list.filter((d) => d.musteri_id === musteriId);
    }
    if (tarih) {
      list = list.filter((d) => d.tarih === tarih);
    }
    return list.sort((a, b) => (a.tarih > b.tarih ? -1 : 1));
  }

  async getYogurtDagitimById(id: string): Promise<YogurtDagitim | null> {
    const list = this.getItem<YogurtDagitim[]>(STORAGE_KEYS.YOGURT_DAGITIMLARI, []);
    return list.find((d) => d.id === id) || null;
  }

  async addYogurtDagitim(
    data: Omit<YogurtDagitim, "id" | "olusturma_zamani">
  ): Promise<YogurtDagitim> {
    const list = this.getItem<YogurtDagitim[]>(STORAGE_KEYS.YOGURT_DAGITIMLARI, []);
    const newDagitim: YogurtDagitim = {
      ...data,
      id: "yd-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
      olusturma_zamani: new Date().toISOString(),
    };
    list.unshift(newDagitim);
    this.setItem(STORAGE_KEYS.YOGURT_DAGITIMLARI, list);

    // Müşteri cari bakiyelerini otomatik eşitle
    await this.recalculateMusteriBakiyeleri();

    return newDagitim;
  }

  async updateYogurtDagitim(id: string, data: Partial<YogurtDagitim>): Promise<YogurtDagitim> {
    const list = this.getItem<YogurtDagitim[]>(STORAGE_KEYS.YOGURT_DAGITIMLARI, []);
    const index = list.findIndex((d) => d.id === id);
    if (index === -1) throw new Error("Dağıtım kaydı bulunamadı");

    list[index] = { ...list[index], ...data };
    this.setItem(STORAGE_KEYS.YOGURT_DAGITIMLARI, list);

    // Müşteri cari bakiyelerini otomatik eşitle
    await this.recalculateMusteriBakiyeleri();

    return list[index];
  }

  async deleteYogurtDagitim(id: string): Promise<boolean> {
    let list = this.getItem<YogurtDagitim[]>(STORAGE_KEYS.YOGURT_DAGITIMLARI, []);
    list = list.filter((d) => d.id !== id);
    this.setItem(STORAGE_KEYS.YOGURT_DAGITIMLARI, list);

    await this.recalculateMusteriBakiyeleri();
    return true;
  }

  // --- Yoğurt Üretim İşlemleri (Toplam Yoğurt) ---
  async getYogurtUretimleri(tarih?: string): Promise<YogurtUretim[]> {
    let list = this.getItem<YogurtUretim[]>(STORAGE_KEYS.YOGURT_URETIMLERI, []);
    if (tarih) {
      list = list.filter((u) => u.tarih === tarih);
    }
    return list.sort((a, b) => (a.tarih > b.tarih ? -1 : 1));
  }

  async getYogurtUretimByTarih(tarih: string): Promise<YogurtUretim | null> {
    const list = await this.getYogurtUretimleri();
    return list.find((u) => u.tarih === tarih) || null;
  }

  async saveYogurtUretim(
    data: Omit<YogurtUretim, "id" | "olusturma_zamani">
  ): Promise<YogurtUretim> {
    const list = this.getItem<YogurtUretim[]>(STORAGE_KEYS.YOGURT_URETIMLERI, []);
    const existingIndex = list.findIndex((u) => u.tarih === data.tarih);

    if (existingIndex !== -1) {
      list[existingIndex] = {
        ...list[existingIndex],
        ...data,
      };
      this.setItem(STORAGE_KEYS.YOGURT_URETIMLERI, list);
      return list[existingIndex];
    } else {
      const newUretim: YogurtUretim = {
        ...data,
        id: "yu-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
        olusturma_zamani: new Date().toISOString(),
      };
      list.unshift(newUretim);
      this.setItem(STORAGE_KEYS.YOGURT_URETIMLERI, list);
      return newUretim;
    }
  }

  // --- Gider Kategorileri ---
  async getGiderKategorileri(): Promise<GiderKategoriItem[]> {
    let list = this.getItem<GiderKategoriItem[]>(STORAGE_KEYS.GIDER_KATEGORILERI, []);
    if (list.length === 0 && this.isClient()) {
      this.setItem(STORAGE_KEYS.GIDER_KATEGORILERI, DEFAULT_GIDER_KATEGORILERI);
      return DEFAULT_GIDER_KATEGORILERI;
    }
    return list;
  }

  async addGiderKategori(ad: string): Promise<GiderKategoriItem> {
    const list = await this.getGiderKategorileri();
    const cleanAd = ad.trim();
    const existing = list.find((k) => k.ad.toLowerCase() === cleanAd.toLowerCase());
    if (existing) return existing;

    const newItem: GiderKategoriItem = {
      id: "kat-" + Date.now() + "-" + Math.random().toString(36).substring(2, 5),
      ad: cleanAd,
      color: "text-indigo-700",
      bg: "bg-indigo-50 border-indigo-200",
    };
    list.push(newItem);
    this.setItem(STORAGE_KEYS.GIDER_KATEGORILERI, list);
    return newItem;
  }

  async deleteGiderKategori(id: string): Promise<boolean> {
    let list = await this.getGiderKategorileri();
    list = list.filter((k) => k.id !== id);
    this.setItem(STORAGE_KEYS.GIDER_KATEGORILERI, list);
    return true;
  }

  // --- Gider İşlemleri ---
  async getGiderler(kategori?: string, tarih?: string): Promise<Gider[]> {
    let list = this.getItem<Gider[]>(STORAGE_KEYS.GIDERLER, []);
    if (list.length === 0 && this.isClient()) {
      this.setItem(STORAGE_KEYS.GIDERLER, DEFAULT_GIDERLER);
      return DEFAULT_GIDERLER;
    }
    if (kategori && kategori !== "tumu") {
      list = list.filter((g) => g.kategori.toLowerCase() === kategori.toLowerCase());
    }
    if (tarih) {
      list = list.filter((g) => g.tarih === tarih);
    }
    return list.sort((a, b) => (a.tarih > b.tarih ? -1 : 1));
  }

  async addGider(data: Omit<Gider, "id" | "olusturma_zamani">): Promise<Gider> {
    const list = this.getItem<Gider[]>(STORAGE_KEYS.GIDERLER, []);
    const newGider: Gider = {
      ...data,
      id: "g-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
      olusturma_zamani: new Date().toISOString(),
    };
    list.unshift(newGider);
    this.setItem(STORAGE_KEYS.GIDERLER, list);
    return newGider;
  }

  async updateGider(id: string, data: Partial<Gider>): Promise<Gider> {
    const list = this.getItem<Gider[]>(STORAGE_KEYS.GIDERLER, []);
    const index = list.findIndex((g) => g.id === id);
    if (index === -1) throw new Error("Gider bulunamadı");
    list[index] = { ...list[index], ...data };
    this.setItem(STORAGE_KEYS.GIDERLER, list);
    return list[index];
  }

  async deleteGider(id: string): Promise<boolean> {
    let list = this.getItem<Gider[]>(STORAGE_KEYS.GIDERLER, []);
    list = list.filter((g) => g.id !== id);
    this.setItem(STORAGE_KEYS.GIDERLER, list);
    return true;
  }

  // --- İstatistik & Özet ---
  async getDashboardOzet(): Promise<DashboardOzet> {
    const mustahsiller = await this.getMustahsiller();
    const kayitlar = await this.getSutKayitlari(undefined, "aktif");
    const yogurtMusterileri = await this.getYogurtMusterileri();
    const yogurtDagitimlari = await this.getYogurtDagitimlari();
    const giderler = await this.getGiderler();

    const bugunStr = new Date().toISOString().split("T")[0];

    let toplamKg = 0;
    let toplamTutar = 0;
    let bugunkuKg = 0;

    const mustahsilMap = new Map(mustahsiller.map((m) => [m.id, m]));

    for (const k of kayitlar) {
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
    const list = this.getItem<AylikIstatistikKapanis[]>(STORAGE_KEYS.AYLIK_KAPANISLAR, []);
    return list.sort((a, b) => (a.kapanis_tarihi > b.kapanis_tarihi ? -1 : 1));
  }

  async createAylikKapanis(
    data: Omit<AylikIstatistikKapanis, "id" | "olusturma_zamani">
  ): Promise<AylikIstatistikKapanis> {
    const list = this.getItem<AylikIstatistikKapanis[]>(STORAGE_KEYS.AYLIK_KAPANISLAR, []);
    const newRecord: AylikIstatistikKapanis = {
      ...data,
      id: "ak-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
      olusturma_zamani: new Date().toISOString(),
    };
    list.unshift(newRecord);
    this.setItem(STORAGE_KEYS.AYLIK_KAPANISLAR, list);
    return newRecord;
  }

  async deleteAylikKapanis(id: string): Promise<boolean> {
    let list = this.getItem<AylikIstatistikKapanis[]>(STORAGE_KEYS.AYLIK_KAPANISLAR, []);
    list = list.filter((k) => k.id !== id);
    this.setItem(STORAGE_KEYS.AYLIK_KAPANISLAR, list);
    return true;
  }

  async getSonKapanisTarihi(): Promise<string | null> {
    const list = await this.getAylikKapanislar();
    return list.length > 0 ? list[0].kapanis_tarihi : null;
  }

  // --- Yedekleme & Geri Yükleme ---
  async exportSistemYedegi(): Promise<SistemYedegi> {
    return {
      versiyon: "2.0.0",
      tarih: new Date().toISOString(),
      mustahsiller: await this.getMustahsiller(),
      sut_kayitlari: this.getItem<SutKaydi[]>(STORAGE_KEYS.SUT_KAYITLARI, []),
      hesap_kapamalar: await this.getEskiKayitlar(),
      yogurt_musterileri: await this.getYogurtMusterileri(),
      yogurt_dagitimlari: await this.getYogurtDagitimlari(),
      yogurt_uretimleri: await this.getYogurtUretimleri(),
      gider_kategorileri: await this.getGiderKategorileri(),
      giderler: await this.getGiderler(),
      aylik_kapanislar: await this.getAylikKapanislar(),
    };
  }

  async importSistemYedegi(yedek: SistemYedegi): Promise<boolean> {
    if (!yedek || !yedek.versiyon) {
      throw new Error("Geçersiz yedek dosyası formatı.");
    }
    if (this.isClient()) {
      if (yedek.mustahsiller) this.setItem(STORAGE_KEYS.MUSTAHSILLER, yedek.mustahsiller);
      if (yedek.sut_kayitlari) this.setItem(STORAGE_KEYS.SUT_KAYITLARI, yedek.sut_kayitlari);
      if (yedek.hesap_kapamalar) this.setItem(STORAGE_KEYS.HESAP_KAPAMALAR, yedek.hesap_kapamalar);
      if (yedek.yogurt_musterileri) this.setItem(STORAGE_KEYS.YOGURT_MUSTERILERI, yedek.yogurt_musterileri);
      if (yedek.yogurt_dagitimlari) this.setItem(STORAGE_KEYS.YOGURT_DAGITIMLARI, yedek.yogurt_dagitimlari);
      if (yedek.yogurt_uretimleri) this.setItem(STORAGE_KEYS.YOGURT_URETIMLERI, yedek.yogurt_uretimleri);
      if (yedek.gider_kategorileri) this.setItem(STORAGE_KEYS.GIDER_KATEGORILERI, yedek.gider_kategorileri);
      if (yedek.giderler) this.setItem(STORAGE_KEYS.GIDERLER, yedek.giderler);
      if (yedek.aylik_kapanislar) this.setItem(STORAGE_KEYS.AYLIK_KAPANISLAR, yedek.aylik_kapanislar);
    }
    return true;
  }
}

export const localStorageService = new LocalStorageService();

