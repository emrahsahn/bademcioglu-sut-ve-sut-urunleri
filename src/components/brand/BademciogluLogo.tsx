"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface BademciogluLogoProps {
  size?: "sm" | "md" | "lg" | "xl" | "sidebar" | "receipt";
  className?: string;
  showSubtitle?: boolean;
}

export default function BademciogluLogo({
  size = "md",
  className,
  showSubtitle = true,
}: BademciogluLogoProps) {
  if (size === "receipt") {
    return (
      <div className={cn("text-center py-2 flex flex-col items-center", className)}>
        <img
          src="/bademcioglu-logo.jpg"
          alt="Bademcioğlu Yoğurtları"
          className="h-16 w-auto max-w-full object-contain rounded-xl contrast-125 brightness-95"
        />
        {showSubtitle && (
          <div className="text-[10px] tracking-widest font-extrabold border-t border-b border-black py-0.5 mt-1.5 uppercase font-sans">
            ★ ANAMUR'UN YERLİ MARKASI ★
          </div>
        )}
      </div>
    );
  }

  if (size === "sidebar") {
    return (
      <div
        className={cn(
          "w-full relative flex flex-col items-center justify-center select-none group transition-all duration-200",
          className
        )}
      >
        <div className="w-full relative overflow-hidden rounded-2xl bg-black border border-amber-500/40 shadow-lg shadow-black/20 transition-transform duration-200 group-hover:scale-[1.01] ring-2 ring-amber-500/10 p-1.5 flex items-center justify-center">
          <img
            src="/bademcioglu-logo.jpg"
            alt="Bademcioğlu Yoğurtları — Anamur'un Yerli Markası"
            className="w-full h-auto max-h-28 object-contain rounded-xl drop-shadow-md transition-opacity duration-200"
            loading="eager"
          />
        </div>

        {showSubtitle && (
          <span className="text-[10px] tracking-widest uppercase font-black text-amber-900 dark:text-amber-300 bg-amber-500/10 dark:bg-amber-950/60 border border-amber-500/20 dark:border-amber-700/50 px-3 py-0.5 rounded-full mt-2 shadow-sm">
            Anamur'un Yerli Markası
          </span>
        )}
      </div>
    );
  }

  const dimensions = {
    sm: "h-14 sm:h-16 max-w-[180px]",
    md: "h-20 sm:h-24 max-w-[270px]",
    lg: "h-28 sm:h-36 max-w-[380px]",
    xl: "h-36 sm:h-44 max-w-[480px]",
  }[size];

  return (
    <div
      className={cn(
        "relative inline-flex flex-col items-center justify-center select-none group transition-all duration-200",
        className
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl bg-black border border-amber-500/30 shadow-md transition-transform duration-200 group-hover:scale-[1.02]",
          "ring-2 ring-black/5 p-0.5"
        )}
      >
        <img
          src="/bademcioglu-logo.jpg"
          alt="Bademcioğlu Yoğurtları — Anamur'un Yerli Markası"
          className={cn(
            "object-contain w-auto rounded-xl drop-shadow-sm transition-opacity duration-200",
            dimensions
          )}
          loading="eager"
        />
      </div>

      {showSubtitle && size !== "sm" && (
        <span className="text-[10px] tracking-widest uppercase font-extrabold text-amber-800 dark:text-amber-300 bg-amber-500/10 dark:bg-amber-950/50 border border-amber-500/20 dark:border-amber-700/50 px-2.5 py-0.5 rounded-full mt-1.5 shadow-sm">
          Anamur'un Yerli Markası
        </span>
      )}
    </div>
  );
}
