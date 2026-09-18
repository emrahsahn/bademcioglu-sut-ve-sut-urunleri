"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import { useAuth } from "@/context/AuthContext";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const isLoginPage = pathname === "/login";

  // Kimlik doğrulaması yapılmamışsa doğrudan /login sayfasına yönlendir
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isLoginPage) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, isLoginPage, router]);

  // Login sayfası ise sidebar/mobilenav olmadan tam ekran göster
  if (isLoginPage) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-[#090D14] text-slate-900 dark:text-slate-100 transition-colors duration-300">
        {children}
      </main>
    );
  }

  // Oturum durumu henüz yükleniyorsa veya kullanıcı giriş yapmamışsa yükleme ekranı göster
  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#090D14] text-slate-500 dark:text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold">Oturum Kontrol Ediliyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 dark:bg-[#090D14] text-slate-900 dark:text-slate-100 antialiased overflow-x-hidden transition-colors duration-300">
      {/* Yan Menü (Masaüstünde sabit, mobilde açılır çekmece) */}
      <Sidebar />

      {/* Ana İçerik Alanı */}
      <div className="flex-1 ml-0 md:ml-64 flex flex-col min-h-screen bg-slate-50/60 dark:bg-[#090D14]/80 pb-20 md:pb-6">
        <main className="flex-1 p-3 sm:p-5 md:p-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobilde Alttan Erişilebilen Hızlı Menü */}
      <MobileNav />
    </div>
  );
}
