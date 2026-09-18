import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

export function isSupabaseConfigured(): boolean {
  if (!supabaseUrl || !supabaseAnonKey) return false;
  // Basit şablon / placeholder kontrolü
  if (
    supabaseUrl.includes("proje-id.supabase.co") ||
    supabaseUrl === "" ||
    supabaseAnonKey.startsWith("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
  ) {
    return false;
  }
  return supabaseUrl.startsWith("http://") || supabaseUrl.startsWith("https://");
}

let _supabase: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (_supabase) return _supabase;

  if (!isSupabaseConfigured()) {
    console.warn(
      "Supabase yapılandırılmamış. Lütfen .env.local dosyasına NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_ANON_KEY ekleyin."
    );
  }

  _supabase = createClient(
    supabaseUrl || "https://placeholder.supabase.co",
    supabaseAnonKey || "placeholder-key",
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );

  return _supabase;
}

export const supabase = getSupabaseClient();
