"use client";

import React from "react";
import Modal from "./Modal";
import { AlertTriangle, Lock, Trash2 } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose?: () => void;
  onCancel?: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
  loading?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onCancel,
  onConfirm,
  title,
  message,
  confirmText = "Evet, Onayla",
  cancelText = "Vazgeç",
  type = "warning",
  loading = false,
}: ConfirmDialogProps) {
  const handleClose = onClose || onCancel || (() => {});

  return (
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth="sm">
      <div className="text-center space-y-4 py-2">
        {/* İkon */}
        <div
          className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center border shadow-sm ${
            type === "danger"
              ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/60"
              : type === "warning"
              ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/60"
              : "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/60"
          }`}
        >
          {type === "danger" ? (
            <Trash2 className="w-6 h-6" />
          ) : type === "warning" ? (
            <Lock className="w-6 h-6" />
          ) : (
            <AlertTriangle className="w-6 h-6" />
          )}
        </div>

        {/* Başlık ve Açıklama */}
        <div className="space-y-1.5">
          <h3 className="text-base font-serif font-bold text-slate-900 dark:text-white tracking-tight">{title}</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
            {message}
          </p>
        </div>

        {/* Butonlar */}
        <div className="flex items-center gap-3 pt-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 px-4 py-2.5 rounded-xl text-white text-xs font-bold shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50 ${
              type === "danger"
                ? "bg-rose-600 hover:bg-rose-700 shadow-rose-200"
                : type === "warning"
                ? "bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-200"
                : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"
            }`}
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}

