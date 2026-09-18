"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";
  className?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "lg",
  className,
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ESC tuşu ile kapatma
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Modal açıkken body kaydırmayı kilitle
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const maxWidthClasses: Record<string, string> = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
  };

  const modalContent = (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-4 md:p-6 no-print overflow-y-auto">
      {/* Backdrop Blur */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-200"
        aria-hidden="true"
      />

      {/* Modal Penceresi */}
      <div
        className={cn(
          "relative bg-white dark:bg-[#101726] rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 w-full max-h-[92vh] flex flex-col overflow-hidden z-10 animate-modal-pop transition-colors my-auto",
          maxWidthClasses[maxWidth] || maxWidthClasses.lg,
          className
        )}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        {(title || description) && (
          <div className="px-5 sm:px-6 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between shrink-0 bg-slate-50/80 dark:bg-slate-900/60">
            <div>
              {title && (
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors shrink-0"
              aria-label="Pencereyi Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* İçerik (Kaydırılabilir) */}
        <div className="p-5 sm:p-6 overflow-y-auto scrollbar-thin">{children}</div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

