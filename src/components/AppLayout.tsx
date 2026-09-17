"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return <main className="min-h-screen bg-slate-50 dark:bg-[#090D14] text-slate-900 dark:text-slate-100 transition-colors duration-300">{children}</main>;
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
