"use client";

import React, { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App Error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-black text-slate-800">Bir Hata Oluştu</h2>
      <p className="text-xs text-slate-500 max-w-sm">
        Sayfa yüklenirken beklenmeyen bir durum oluştu. Yeniden deneyebilirsiniz.
      </p>
      <button
        onClick={() => reset()}
        className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors inline-flex items-center gap-2"
      >
        <RefreshCw className="w-4 h-4" />
        <span>Yeniden Dene</span>
      </button>
    </div>
  );
}
