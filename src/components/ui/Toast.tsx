"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, title?: string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "info", title?: string) => {
      const id = "toast-" + Date.now() + "-" + Math.random().toString(36).substring(2, 5);
      const newToast: Toast = { id, type, message, title };
      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast]
  );

  const success = useCallback(
    (message: string, title: string = "İşlem Başarılı") => {
      showToast(message, "success", title);
    },
    [showToast]
  );

  const error = useCallback(
    (message: string, title: string = "Hata Oluştu") => {
      showToast(message, "error", title);
    },
    [showToast]
  );

  const info = useCallback(
    (message: string, title: string = "Bilgi") => {
      showToast(message, "info", title);
    },
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, success, error, info }}>
      {children}
      {/* Toast Render Alanı */}
      <div
        role="region"
        aria-live="polite"
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none no-print"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto p-4 rounded-xl shadow-xl border flex items-start gap-3 backdrop-blur-md animate-toast transition-all",
              toast.type === "success" &&
                "bg-white border-emerald-300 text-emerald-950 shadow-emerald-900/10",
              toast.type === "error" &&
                "bg-white border-rose-300 text-rose-950 shadow-rose-900/10",
              toast.type === "info" &&
                "bg-white border-slate-200 text-slate-900 shadow-slate-900/10"
            )}
          >
            <div className="mt-0.5 flex-shrink-0">
              {toast.type === "success" && (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              )}
              {toast.type === "error" && (
                <AlertCircle className="w-5 h-5 text-rose-600" />
              )}
              {toast.type === "info" && (
                <Info className="w-5 h-5 text-sky-600" />
              )}
            </div>

            <div className="flex-1">
              {toast.title && (
                <h4 className="text-xs font-bold uppercase tracking-wider opacity-90">
                  {toast.title}
                </h4>
              )}
              <p className="text-sm mt-0.5 leading-snug">{toast.message}</p>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Kapat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast ToastProvider içinde kullanılmalıdır.");
  }
  return context;
}
