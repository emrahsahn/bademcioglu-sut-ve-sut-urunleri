"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/Toast";
import BademciogluLogo from "@/components/brand/BademciogluLogo";
import { User, Lock, ArrowRight, Eye, EyeOff, Clock } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const { login, securityState, isAuthenticated, isLoading } = useAuth();
  const { success, error } = useToast();
  const router = useRouter();

  // Zaten giriş yapmışsa ana sayfaya yönlendir
  React.useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, isLoading, router]);

  const isLocked = securityState.isLocked;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) {
      error(`Lütfen bekleyiniz: ${securityState.lockRemainingSeconds} saniye kaldı.`);
      return;
    }

    setLoading(true);
    const res = await login(username, pin, rememberMe);
    setLoading(false);

    if (res.success) {
      success("Giriş başarılı. Yönlendiriliyorsunuz...");
      router.push("/");
    } else {
      error(res.error || "Giriş yapılamadı.");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-slate-100 via-white to-amber-50/40 dark:from-[#070A10] dark:via-[#090D14] dark:to-[#0F172A] relative overflow-hidden font-sans transition-colors duration-300">
      {/* Arka Plan Süt Damlası / Artisan Işıltıları */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-amber-400/10 dark:bg-amber-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-emerald-400/10 dark:bg-emerald-500/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Bento Giriş Kartı */}
        <div className="bg-white dark:bg-[#101726] border border-slate-200/90 dark:border-slate-800 shadow-2xl shadow-slate-300/40 dark:shadow-black/70 rounded-3xl p-6 sm:p-10 space-y-6 transition-colors duration-300">
          {/* Logo & Marka Başlığı */}
          <div className="flex flex-col items-center text-center space-y-3">
            <BademciogluLogo size="lg" showSubtitle={false} />
            <div className="space-y-1 mt-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Bademcioğlu Süt ve Süt Ürünleri
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                Mandıra, Süt Alımı ve Yoğurt Takip Programı
              </p>
            </div>
          </div>

          {/* Giriş Formu */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Kullanıcı Adı */}
            <div className="space-y-1.5">
              <label htmlFor="username-input" className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Kullanıcı Adı / Yetkili
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  id="username-input"
                  type="text"
                  required
                  disabled={isLocked || loading}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Kullanıcı adınızı giriniz"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Şifre / PIN */}
            <div className="space-y-1.5">
              <label htmlFor="password-input" className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Şifre veya Giriş PIN'i
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  id="password-input"
                  type={showPassword ? "text" : "password"}
                  required
                  disabled={isLocked || loading}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 text-sm font-mono font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded transition-colors"
                  title={showPassword ? "Şifreyi Gizle" : "Şifreyi Göster"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Beni Hatırla */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  disabled={isLocked || loading}
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Beni Hatırla</span>
              </label>
            </div>

            {/* Giriş Butonu */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={isLocked || loading}
              className={`w-full py-3 rounded-xl text-xs font-black tracking-wide uppercase shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:cursor-not-allowed mt-2 ${
                isLocked
                  ? "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shadow-none border border-slate-300 dark:border-slate-700"
                  : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-amber-500/20 disabled:opacity-50"
              }`}
            >
              {isLocked ? (
                <>
                  <Clock className="w-4 h-4 animate-spin text-amber-600 dark:text-amber-400" />
                  <span>Lütfen Bekleyiniz ({securityState.lockRemainingSeconds}s)</span>
                </>
              ) : loading ? (
                <span>Giriş Kontrol Ediliyor...</span>
              ) : (
                <>
                  <span>Giriş Yap</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Alt Telif / Konum */}
        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-4">
          © {new Date().getFullYear()} Bademcioğlu Yoğurtları • Sağlık Mah. Anamur/MERSİN
        </p>
      </div>
    </div>
  );
}
