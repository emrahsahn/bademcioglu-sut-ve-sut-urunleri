"use client";

import React from "react";
import Modal from "./Modal";
import { SutKaydi, Mustahsil } from "@/types/database";
import { formatDate, formatDateTime, formatCurrency } from "@/lib/utils";
import { Printer } from "lucide-react";
import BademciogluLogo from "@/components/brand/BademciogluLogo";

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  mustahsil: Mustahsil | { ad: string; birim_fiyat: number };
  kayitlar: SutKaydi[];
  kapamaTarihi?: string;
  isArchive?: boolean;
}

export default function ReceiptModal({
  isOpen,
  onClose,
  mustahsil,
  kayitlar,
  kapamaTarihi,
  isArchive = false,
}: ReceiptModalProps) {
  const toplamKg = kayitlar.reduce((sum, k) => sum + k.kg, 0);
  const toplamTutar = toplamKg * mustahsil.birim_fiyat;

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        maxWidth="md"
        title="Termal Fiş & Rapor Önizleme"
        description="58mm / 80mm fiş yazıcı formatında yazdırma önizlemesi"
      >
        <div className="space-y-5">
          {/* Termal Fiş Önizleme Kartı */}
          <div className="bg-slate-100 dark:bg-slate-900/70 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-center">
            <div className="bg-white w-[280px] sm:w-[320px] p-4 shadow-md rounded-md border border-slate-300 font-mono text-xs text-black leading-tight select-none">
              {/* Fiş Başlığı */}
              <div className="text-center pb-2 border-b border-dashed border-black space-y-1">
                <BademciogluLogo size="receipt" />
                <p className="text-[10px] font-bold">MANDIRA & SÜT TOPLAMA FİŞİ</p>
                <p className="text-[9px] text-slate-600">
                  {kapamaTarihi ? formatDateTime(kapamaTarihi) : formatDateTime(new Date().toISOString())}
                </p>
              </div>

              {/* Müstahsil Bilgileri */}
              <div className="py-2 border-b border-dashed border-black space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="font-semibold">Müstahsil:</span>
                  <span className="font-bold uppercase">{mustahsil.ad}</span>
                </div>
                <div className="flex justify-between">
                  <span>Birim Fiyat:</span>
                  <span className="font-semibold">{formatCurrency(mustahsil.birim_fiyat)} / kg</span>
                </div>
                {isArchive && (
                  <div className="text-[9px] bg-slate-200 text-center py-0.5 mt-1 font-bold rounded">
                    [ GEÇMİŞ DÖNEM HESAP KAPAMA ]
                  </div>
                )}
              </div>

              {/* Satırlar */}
              <div className="py-2 border-b border-dashed border-black">
                <div className="flex justify-between font-bold pb-1 text-[10px] uppercase border-b border-slate-300">
                  <span>Tarih</span>
                  <span className="text-right">Miktar (Kg)</span>
                </div>
                <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto py-1">
                  {kayitlar.map((k, index) => (
                    <div key={k.id || index} className="flex justify-between py-0.5 text-[11px]">
                      <span>{formatDate(k.tarih)}</span>
                      <span className="font-medium">{k.kg.toFixed(1)} kg</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alt Toplamlar */}
              <div className="pt-2 pb-3 border-b border-dashed border-black space-y-1 text-[11px]">
                <div className="flex justify-between font-semibold">
                  <span>Toplam Teslimat:</span>
                  <span>{kayitlar.length} Gün / Giriş</span>
                </div>
                <div className="flex justify-between font-bold text-sm">
                  <span>TOPLAM SÜT:</span>
                  <span>{toplamKg.toFixed(1)} KG</span>
                </div>
                <div className="flex justify-between font-extrabold text-sm pt-1 border-t border-slate-300">
                  <span>TOPLAM TUTAR:</span>
                  <span>{formatCurrency(toplamTutar)}</span>
                </div>
              </div>

              {/* İmza / Dipnot */}
              <div className="pt-4 text-center text-[9px] space-y-3">
                <div className="flex justify-between pt-2">
                  <span>Teslim Eden</span>
                  <span>Teslim Alan</span>
                </div>
                <p className="text-[8px] text-slate-500 pt-2">
                  *** Bilgi amaçlı düzenlenmiştir ***
                </p>
              </div>
            </div>
          </div>

          {/* Modal Butonları */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Kapat
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-emerald-900/20 flex items-center gap-2 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Yazdır (Fiş Çıkar)</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* Yalnızca Yazdırma Esnasında Görünen Saf Termal Fiş Layoutu */}
      <div className="print-only receipt-container">
        <div className="text-center pb-2 border-b border-dashed border-black">
          <div style={{ fontSize: "16px", fontWeight: "bold" }}>SÜT DEFTERİ</div>
          <div style={{ fontSize: "10px" }}>MANDIRA VE SÜT TOPLAMA</div>
          <div style={{ fontSize: "9px" }}>
            {kapamaTarihi ? formatDateTime(kapamaTarihi) : formatDateTime(new Date().toISOString())}
          </div>
        </div>

        <div className="py-2 border-b border-dashed border-black" style={{ fontSize: "11px" }}>
          <div>Müstahsil: <strong>{mustahsil.ad}</strong></div>
          <div>Birim Fiyat: <strong>{formatCurrency(mustahsil.birim_fiyat)} / kg</strong></div>
          {isArchive && <div>[ KAPATILMIŞ HESAP ARŞİVİ ]</div>}
        </div>

        <div className="py-2 border-b border-dashed border-black">
          <div className="flex justify-between" style={{ fontWeight: "bold", borderBottom: "1px solid #000" }}>
            <span>Tarih</span>
            <span>Kg</span>
          </div>
          {kayitlar.map((k, index) => (
            <div key={k.id || index} className="flex justify-between" style={{ fontSize: "11px", padding: "2px 0" }}>
              <span>{formatDate(k.tarih)}</span>
              <span>{k.kg.toFixed(1)} kg</span>
            </div>
          ))}
        </div>

        <div className="pt-2 pb-2 border-b border-dashed border-black" style={{ fontSize: "12px" }}>
          <div className="flex justify-between">
            <span>Toplam Süt:</span>
            <strong>{toplamKg.toFixed(1)} KG</strong>
          </div>
          <div className="flex justify-between" style={{ fontSize: "14px", fontWeight: "bold" }}>
            <span>Toplam Tutar:</span>
            <span>{formatCurrency(toplamTutar)}</span>
          </div>
        </div>

        <div className="pt-4 text-center" style={{ fontSize: "9px" }}>
          <div className="flex justify-between" style={{ paddingBottom: "20px" }}>
            <span>Teslim Eden</span>
            <span>Teslim Alan</span>
          </div>
          <div>*** Bilgi fişidir ***</div>
        </div>
      </div>
    </>
  );
}
