import { IDataService } from "./storageInterface";
import { localStorageService } from "./localStorageService";
import { supabaseService, SupabaseService } from "./supabaseService";
import { isSupabaseConfigured } from "../lib/supabaseClient";

/**
 * Dinamik Veri Servis Seçici:
 * NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_ANON_KEY tanımlıysa Supabase servisi kullanılır,
 * tanımlı değilse kesintisiz çalışma için LocalStorage servisi kullanılır.
 */
export function getActiveDataService(): IDataService {
  if (isSupabaseConfigured()) {
    return supabaseService;
  }
  return localStorageService;
}

export function isUsingSupabase(): boolean {
  return isSupabaseConfigured();
}

// Proxy üzerinden her çağrıda doğru aktif servise yönlendirme (Hot Switch desteği)
export const dataService: IDataService = new Proxy({} as IDataService, {
  get(_target, prop: keyof IDataService) {
    const activeService = getActiveDataService();
    const val = activeService[prop];
    if (typeof val === "function") {
      return val.bind(activeService);
    }
    return val;
  },
});

export * from "./storageInterface";
export * from "./localStorageService";
export * from "./supabaseService";
export { isSupabaseConfigured } from "../lib/supabaseClient";
