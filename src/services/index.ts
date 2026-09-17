import { IDataService } from "./storageInterface";
import { localStorageService } from "./localStorageService";
// import { supabaseService } from "./supabaseService"; // Gelecekte Supabase aktif edildiğinde açılabilir

// Uygulamanın kullandığı aktif veri servisi
export const dataService: IDataService = localStorageService;

export * from "./storageInterface";
export * from "./localStorageService";
export * from "./supabaseService";
