-- ==============================================================================
-- BADEMCİOĞLU SÜT VE SÜT ÜRÜNLERİ — SUPABASE POSTGRESQL VERİTABANI ŞEMASI
-- ==============================================================================
-- Bu betiği Supabase Dashboard -> SQL Editor alanına yapıştırıp "Run" butonuna basarak
-- tüm tabloları, ilişkileri, RLS güvenlik politikalarını ve başlangıç verilerini tek seferde kurabilirsiniz.
-- ==============================================================================

-- 1. TABLOLARIN OLUŞTURULMASI

-- 1.1 Müstahsiller (Süt Üreticileri)
CREATE TABLE IF NOT EXISTS public.mustahsiller (
    id TEXT PRIMARY KEY,
    ad TEXT NOT NULL,
    telefon TEXT,
    birim_fiyat NUMERIC(10, 2) NOT NULL DEFAULT 0,
    olusturma_tarihi DATE NOT NULL DEFAULT CURRENT_DATE
);

-- 1.2 Hesap Kapamalar (Geçmiş Dönem Hesap Dökümleri)
CREATE TABLE IF NOT EXISTS public.hesap_kapamalar (
    id TEXT PRIMARY KEY,
    mustahsil_id TEXT NOT NULL REFERENCES public.mustahsiller(id) ON DELETE CASCADE,
    mustahsil_adi TEXT NOT NULL,
    birim_fiyat NUMERIC(10, 2) NOT NULL DEFAULT 0,
    kapama_tarihi TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    toplam_kg NUMERIC(10, 2) NOT NULL DEFAULT 0,
    toplam_tutar NUMERIC(10, 2) NOT NULL DEFAULT 0,
    kayit_sayisi INTEGER NOT NULL DEFAULT 0,
    kayitlar JSONB NOT NULL DEFAULT '[]'::jsonb
);

-- 1.3 Süt Kayıtları (Günlük Süt Tartımları)
CREATE TABLE IF NOT EXISTS public.sut_kayitlari (
    id TEXT PRIMARY KEY,
    mustahsil_id TEXT NOT NULL REFERENCES public.mustahsiller(id) ON DELETE CASCADE,
    tarih DATE NOT NULL DEFAULT CURRENT_DATE,
    kg NUMERIC(10, 2) NOT NULL DEFAULT 0,
    durum TEXT NOT NULL CHECK (durum IN ('aktif', 'kapatilmis')) DEFAULT 'aktif',
    olusturma_zamani TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    hesap_kapama_id TEXT REFERENCES public.hesap_kapamalar(id) ON DELETE SET NULL
);

-- 1.4 Yoğurt Müşterileri
CREATE TABLE IF NOT EXISTS public.yogurt_musterileri (
    id TEXT PRIMARY KEY,
    ad TEXT NOT NULL,
    telefon TEXT,
    adres TEXT,
    buyuk_yogurt_fiyat NUMERIC(10, 2) NOT NULL DEFAULT 200,
    kucuk_yogurt_fiyat NUMERIC(10, 2) NOT NULL DEFAULT 120,
    iade_kova_fiyat NUMERIC(10, 2) NOT NULL DEFAULT 30,
    varsayilan_fiyat NUMERIC(10, 2),
    bakiye NUMERIC(10, 2) NOT NULL DEFAULT 0,
    olusturma_tarihi DATE NOT NULL DEFAULT CURRENT_DATE
);

-- 1.5 Yoğurt Dağıtımları
CREATE TABLE IF NOT EXISTS public.yogurt_dagitimlari (
    id TEXT PRIMARY KEY,
    musteri_id TEXT NOT NULL REFERENCES public.yogurt_musterileri(id) ON DELETE CASCADE,
    musteri_adi TEXT NOT NULL,
    tarih DATE NOT NULL DEFAULT CURRENT_DATE,
    buyuk_adet INTEGER NOT NULL DEFAULT 0,
    kucuk_adet INTEGER NOT NULL DEFAULT 0,
    iade_kova_adet INTEGER NOT NULL DEFAULT 0,
    iade_buyuk_adet INTEGER NOT NULL DEFAULT 0,
    iade_kucuk_adet INTEGER NOT NULL DEFAULT 0,
    buyuk_birim_fiyat NUMERIC(10, 2) NOT NULL DEFAULT 0,
    kucuk_birim_fiyat NUMERIC(10, 2) NOT NULL DEFAULT 0,
    iade_kova_birim_fiyat NUMERIC(10, 2) NOT NULL DEFAULT 0,
    toplam_tutar NUMERIC(10, 2) NOT NULL DEFAULT 0,
    odeme_durumu TEXT NOT NULL CHECK (odeme_durumu IN ('odendi', 'odenmedi', 'kismi')) DEFAULT 'odenmedi',
    odenen_tutar NUMERIC(10, 2) NOT NULL DEFAULT 0,
    kalan_tutar NUMERIC(10, 2) NOT NULL DEFAULT 0,
    fatura_kesildi BOOLEAN NOT NULL DEFAULT FALSE,
    fatura_tarihi DATE,
    kova_adedi INTEGER,
    kova_tipi TEXT,
    birim_fiyat NUMERIC(10, 2),
    tahsil_edilen NUMERIC(10, 2),
    notlar TEXT,
    olusturma_zamani TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1.6 Yoğurt Üretimleri (Toplam İmalat & Maya Takibi)
CREATE TABLE IF NOT EXISTS public.yogurt_uretimleri (
    id TEXT PRIMARY KEY,
    tarih DATE NOT NULL UNIQUE,
    buyuk_uretim INTEGER NOT NULL DEFAULT 0,
    kucuk_uretim INTEGER NOT NULL DEFAULT 0,
    maya_kg NUMERIC(10, 2) NOT NULL DEFAULT 0,
    zayiat_adet INTEGER NOT NULL DEFAULT 0,
    olusturma_zamani TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1.7 Gider Kategorileri
CREATE TABLE IF NOT EXISTS public.gider_kategorileri (
    id TEXT PRIMARY KEY,
    ad TEXT NOT NULL UNIQUE,
    iconName TEXT,
    color TEXT,
    bg TEXT
);

-- 1.8 Giderler (İşletme Harcamaları)
CREATE TABLE IF NOT EXISTS public.giderler (
    id TEXT PRIMARY KEY,
    baslik TEXT NOT NULL,
    kategori TEXT NOT NULL,
    tutar NUMERIC(10, 2) NOT NULL DEFAULT 0,
    tarih DATE NOT NULL DEFAULT CURRENT_DATE,
    aciklama TEXT,
    olusturma_zamani TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1.9 Kullanıcılar (Sistem Giriş Yetkileri)
CREATE TABLE IF NOT EXISTS public.kullanicilar (
    id TEXT PRIMARY KEY,
    kullanici_adi TEXT NOT NULL UNIQUE,
    sifre TEXT NOT NULL,
    ad_soyad TEXT NOT NULL,
    rol TEXT NOT NULL DEFAULT 'Yönetici',
    aktif BOOLEAN NOT NULL DEFAULT TRUE,
    olusturma_tarihi TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1.10 Aylık İstatistik Kapanışları & Dönem Arşivi
CREATE TABLE IF NOT EXISTS public.aylik_istatistikler (
    id TEXT PRIMARY KEY,
    donem_adi TEXT NOT NULL,
    baslangic_tarihi DATE NOT NULL,
    kapanis_tarihi TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    toplam_yogurt_ciro NUMERIC(12, 2) NOT NULL DEFAULT 0,
    toplam_yogurt_tahsilat NUMERIC(12, 2) NOT NULL DEFAULT 0,
    toplam_veresiye_alacak NUMERIC(12, 2) NOT NULL DEFAULT 0,
    toplam_sut_kg NUMERIC(12, 2) NOT NULL DEFAULT 0,
    toplam_sut_maliyeti NUMERIC(12, 2) NOT NULL DEFAULT 0,
    toplam_gider NUMERIC(12, 2) NOT NULL DEFAULT 0,
    net_kar_zarar NUMERIC(12, 2) NOT NULL DEFAULT 0,
    teslimat_sayisi INTEGER NOT NULL DEFAULT 0,
    gider_sayisi INTEGER NOT NULL DEFAULT 0,
    notlar TEXT,
    detay_json JSONB DEFAULT '{}'::jsonb,
    olusturma_zamani TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 2. İNDEKS TANIMLARI (Sorgu Performansı İçin)
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_sut_kayitlari_mustahsil_durum ON public.sut_kayitlari(mustahsil_id, durum);
CREATE INDEX IF NOT EXISTS idx_sut_kayitlari_tarih ON public.sut_kayitlari(tarih DESC);
CREATE INDEX IF NOT EXISTS idx_hesap_kapamalar_mustahsil ON public.hesap_kapamalar(mustahsil_id);
CREATE INDEX IF NOT EXISTS idx_hesap_kapamalar_tarih ON public.hesap_kapamalar(kapama_tarihi DESC);
CREATE INDEX IF NOT EXISTS idx_yogurt_dagitimlari_musteri ON public.yogurt_dagitimlari(musteri_id);
CREATE INDEX IF NOT EXISTS idx_yogurt_dagitimlari_tarih ON public.yogurt_dagitimlari(tarih DESC);
CREATE INDEX IF NOT EXISTS idx_giderler_tarih ON public.giderler(tarih DESC);
CREATE INDEX IF NOT EXISTS idx_giderler_kategori ON public.giderler(kategori);
CREATE INDEX IF NOT EXISTS idx_aylik_istatistikler_tarih ON public.aylik_istatistikler(kapanis_tarihi DESC);

-- ==============================================================================
-- 3. GÜVENLİK (ROW LEVEL SECURITY - RLS)
-- ==============================================================================
-- Uygulama Anon Key ile doğrudan güvenli şekilde çalıştığı için tam yetki politikaları tanımlanır.

ALTER TABLE public.mustahsiller ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sut_kayitlari ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hesap_kapamalar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.yogurt_musterileri ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.yogurt_dagitimlari ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.yogurt_uretimleri ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gider_kategorileri ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.giderler ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kullanicilar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aylik_istatistikler ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    -- mustahsiller
    DROP POLICY IF EXISTS "Anon public access for mustahsiller" ON public.mustahsiller;
    CREATE POLICY "Anon public access for mustahsiller" ON public.mustahsiller FOR ALL USING (true) WITH CHECK (true);

    -- sut_kayitlari
    DROP POLICY IF EXISTS "Anon public access for sut_kayitlari" ON public.sut_kayitlari;
    CREATE POLICY "Anon public access for sut_kayitlari" ON public.sut_kayitlari FOR ALL USING (true) WITH CHECK (true);

    -- hesap_kapamalar
    DROP POLICY IF EXISTS "Anon public access for hesap_kapamalar" ON public.hesap_kapamalar;
    CREATE POLICY "Anon public access for hesap_kapamalar" ON public.hesap_kapamalar FOR ALL USING (true) WITH CHECK (true);

    -- yogurt_musterileri
    DROP POLICY IF EXISTS "Anon public access for yogurt_musterileri" ON public.yogurt_musterileri;
    CREATE POLICY "Anon public access for yogurt_musterileri" ON public.yogurt_musterileri FOR ALL USING (true) WITH CHECK (true);

    -- yogurt_dagitimlari
    DROP POLICY IF EXISTS "Anon public access for yogurt_dagitimlari" ON public.yogurt_dagitimlari;
    CREATE POLICY "Anon public access for yogurt_dagitimlari" ON public.yogurt_dagitimlari FOR ALL USING (true) WITH CHECK (true);

    -- yogurt_uretimleri
    DROP POLICY IF EXISTS "Anon public access for yogurt_uretimleri" ON public.yogurt_uretimleri;
    CREATE POLICY "Anon public access for yogurt_uretimleri" ON public.yogurt_uretimleri FOR ALL USING (true) WITH CHECK (true);

    -- gider_kategorileri
    DROP POLICY IF EXISTS "Anon public access for gider_kategorileri" ON public.gider_kategorileri;
    CREATE POLICY "Anon public access for gider_kategorileri" ON public.gider_kategorileri FOR ALL USING (true) WITH CHECK (true);

    -- giderler
    DROP POLICY IF EXISTS "Anon public access for giderler" ON public.giderler;
    CREATE POLICY "Anon public access for giderler" ON public.giderler FOR ALL USING (true) WITH CHECK (true);

    -- kullanicilar
    DROP POLICY IF EXISTS "Anon public access for kullanicilar" ON public.kullanicilar;
    CREATE POLICY "Anon public access for kullanicilar" ON public.kullanicilar FOR ALL USING (true) WITH CHECK (true);

    -- aylik_istatistikler
    DROP POLICY IF EXISTS "Anon public access for aylik_istatistikler" ON public.aylik_istatistikler;
    CREATE POLICY "Anon public access for aylik_istatistikler" ON public.aylik_istatistikler FOR ALL USING (true) WITH CHECK (true);
END $$;

-- ==============================================================================
-- 4. OTOMATİK CARİ BAKİYE HESAPLAMA TETİKLEYİCİSİ (TRIGGER)
-- ==============================================================================
-- Bir yoğurt dağıtım kaydı eklendiğinde, güncellendiğinde veya silindiğinde
-- ilgili müşterinin veresiye bakiyesini (kalan_tutar toplamı) otomatik hesaplar.

CREATE OR REPLACE FUNCTION public.fn_sync_musteri_bakiye()
RETURNS TRIGGER AS $$
DECLARE
    target_musteri_id TEXT;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        target_musteri_id := OLD.musteri_id;
    ELSE
        target_musteri_id := NEW.musteri_id;
    END IF;

    -- Müşterinin toplam kalan bakiyesini hesapla ve güncelle
    UPDATE public.yogurt_musterileri
    SET bakiye = COALESCE((
        SELECT SUM(kalan_tutar)
        FROM public.yogurt_dagitimlari
        WHERE musteri_id = target_musteri_id
    ), 0)
    WHERE id = target_musteri_id;

    -- Eğer müşteri değiştirildiyse eski müşteriyi de güncelle
    IF (TG_OP = 'UPDATE' AND OLD.musteri_id IS DISTINCT FROM NEW.musteri_id) THEN
        UPDATE public.yogurt_musterileri
        SET bakiye = COALESCE((
            SELECT SUM(kalan_tutar)
            FROM public.yogurt_dagitimlari
            WHERE musteri_id = OLD.musteri_id
        ), 0)
        WHERE id = OLD.musteri_id;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_yogurt_dagitim_bakiye ON public.yogurt_dagitimlari;
CREATE TRIGGER trg_sync_yogurt_dagitim_bakiye
AFTER INSERT OR UPDATE OR DELETE ON public.yogurt_dagitimlari
FOR EACH ROW EXECUTE FUNCTION public.fn_sync_musteri_bakiye();

-- ==============================================================================
-- 5. BAŞLANGIÇ SEED MOCK VERİLERİ (Örnek Veriler)
-- ==============================================================================

-- Müstahsil Örnekleri
INSERT INTO public.mustahsiller (id, ad, telefon, birim_fiyat, olusturma_tarihi)
VALUES
    ('m-1', 'Ahmet Yılmaz (Örnek)', '0532 111 22 33', 16.50, CURRENT_DATE),
    ('m-2', 'Mehmet Demir (Örnek)', '0544 222 33 44', 17.00, CURRENT_DATE)
ON CONFLICT (id) DO NOTHING;

-- Yoğurt Müşterileri Örnekleri
INSERT INTO public.yogurt_musterileri (id, ad, telefon, adres, buyuk_yogurt_fiyat, kucuk_yogurt_fiyat, iade_kova_fiyat, varsayilan_fiyat, bakiye, olusturma_tarihi)
VALUES
    ('ym-1', 'Köşem Market (Örnek)', '0530 123 45 67', 'Merkez Mah. No: 12', 200.00, 120.00, 30.00, 200.00, 0, CURRENT_DATE),
    ('ym-2', 'Bereket Şarküteri (Örnek)', '0542 987 65 43', 'Pazar Cad. No: 5', 210.00, 130.00, 35.00, 210.00, 0, CURRENT_DATE)
ON CONFLICT (id) DO NOTHING;

-- Gider Kategorileri
INSERT INTO public.gider_kategorileri (id, ad, color, bg)
VALUES
    ('kat-yem', 'Yem & Saman', 'text-amber-700', 'bg-amber-50 border-amber-200'),
    ('kat-akaryakit', 'Akaryakıt / Mazot', 'text-rose-700', 'bg-rose-50 border-rose-200'),
    ('kat-personel', 'Personel & İşçilik', 'text-blue-700', 'bg-blue-50 border-blue-200'),
    ('kat-veteriner', 'Veteriner & İlaç', 'text-emerald-700', 'bg-emerald-50 border-emerald-200'),
    ('kat-elektrik', 'Elektrik & Su', 'text-yellow-700', 'bg-yellow-50 border-yellow-200'),
    ('kat-bakim', 'Bakım & Onarım', 'text-purple-700', 'bg-purple-50 border-purple-200'),
    ('kat-diger', 'Diğer Giderler', 'text-slate-700', 'bg-slate-50 border-slate-200')
ON CONFLICT (id) DO UPDATE 
SET ad = EXCLUDED.ad, color = EXCLUDED.color, bg = EXCLUDED.bg;

-- Örnek Giderler
INSERT INTO public.giderler (id, baslik, kategori, tutar, tarih, aciklama, olusturma_zamani)
VALUES
    ('g-1', 'Besi Yemi Alımı (20 Çuval)', 'Yem & Saman', 8400.00, CURRENT_DATE, 'Tarım kooperatifinden peşin alındı', NOW()),
    ('g-2', 'Süt Toplama Aracı Mazot', 'Akaryakıt / Mazot', 1850.00, CURRENT_DATE, 'Haftalık dağıtım mazotu', NOW())
ON CONFLICT (id) DO NOTHING;

-- Varsayılan Yönetici Kullanıcısı
INSERT INTO public.kullanicilar (id, kullanici_adi, sifre, ad_soyad, rol, aktif)
VALUES
    ('usr-admin', 'bademcioglu_yonetim', 'Bademcioglu.33*Mandira!', 'Sistem Yöneticisi', 'Yönetici', TRUE)
ON CONFLICT (kullanici_adi) DO NOTHING;

