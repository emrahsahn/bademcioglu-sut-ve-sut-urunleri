import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

/**
 * Supabase Keep-Alive Ping API Route
 * 
 * Supabase ücretsiz planında 7 gün işlem yapılmazsa veritabanı duraklatılır (pause).
 * Bu uç nokta (endpoint), veritabanına hafif bir sorgu göndererek veritabanının
 * uyku moduna geçmesini (inactivity pause) engeller.
 */
export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      {
        success: false,
        message: "Supabase ortam değişkenleri yapılandırılmamış.",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }

  try {
    const startTime = Date.now();

    // Veritabanını uyandırmak/aktif tutmak için en hafif sorgu
    const { data, error } = await supabase
      .from("kullanicilar")
      .select("id")
      .limit(1);

    const durationMs = Date.now() - startTime;

    if (error) {
      console.error("[Keep-Alive] Supabase sorgu hatası:", error);
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: error.code,
          durationMs,
          timestamp: new Date().toISOString(),
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Supabase veritabanı aktif, ping başarılı!",
      durationMs,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Bilinmeyen hata";
    console.error("[Keep-Alive] İstek hatası:", err);
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
