"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

export interface AuthUser {
  username: string;
  name: string;
  role: string;
}

export interface SecurityState {
  failedAttempts: number;
  maxFreeAttempts: number;
  isLocked: boolean;
  lockRemainingSeconds: number;
  attemptsUntilLock: number;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  securityState: SecurityState;
  login: (username: string, pin: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  resetSecurityLock: () => void; // Acil durum / geliştirici sıfırlama
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "bademcioglu_user_session";
const SECURITY_STORAGE_KEY = "bademcioglu_auth_security";

const MAX_FREE_ATTEMPTS = 3;
const COOLDOWN_RESET_MS = 30 * 60 * 1000; // 30 dakika işlem yapılmazsa deneme sayısını sıfırla

// Artan bekleme süreleri (Saniye cinsinden)
const LOCKOUT_TIERS: Record<number, number> = {
  3: 30,    // 3. hatalı deneme -> 30 saniye
  4: 60,    // 4. hatalı deneme -> 60 saniye (1 dakika)
  5: 300,   // 5. hatalı deneme -> 300 saniye (5 dakika)
  6: 900,   // 6. ve üzeri hatalı deneme -> 900 saniye (15 dakika)
};

function getLockoutDuration(attempts: number): number {
  if (attempts < MAX_FREE_ATTEMPTS) return 0;
  if (attempts >= 6) return 900;
  return LOCKOUT_TIERS[attempts] || 30;
}

interface StoredSecurity {
  failedAttempts: number;
  lockedUntil: number | null;
  lastAttemptTime: number;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [lockRemainingSeconds, setLockRemainingSeconds] = useState(0);

  const router = useRouter();

  // Güvenlik durumunu yerel depolamadan yükle
  useEffect(() => {
    try {
      // Oturum yükle
      const savedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.username) {
          setUser(parsed);
        }
      }

      // Güvenlik & kilit durumunu yükle
      const savedSec = localStorage.getItem(SECURITY_STORAGE_KEY);
      if (savedSec) {
        const sec: StoredSecurity = JSON.parse(savedSec);
        const now = Date.now();

        // Eğer son denemenin üzerinden 30 dakika geçtiyse ve kilit süresi dolduysa sıfırla
        if (sec.lastAttemptTime && now - sec.lastAttemptTime > COOLDOWN_RESET_MS && (!sec.lockedUntil || now > sec.lockedUntil)) {
          localStorage.removeItem(SECURITY_STORAGE_KEY);
          setFailedAttempts(0);
          setLockedUntil(null);
        } else {
          setFailedAttempts(sec.failedAttempts || 0);
          if (sec.lockedUntil && sec.lockedUntil > now) {
            setLockedUntil(sec.lockedUntil);
            setLockRemainingSeconds(Math.ceil((sec.lockedUntil - now) / 1000));
          } else {
            setLockedUntil(null);
            setLockRemainingSeconds(0);
          }
        }
      }
    } catch (e) {
      console.error("Failed to load auth or security session", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Kilit geri sayım sayacı
  useEffect(() => {
    if (!lockedUntil) {
      setLockRemainingSeconds(0);
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.ceil((lockedUntil - now) / 1000);
      if (diff <= 0) {
        setLockedUntil(null);
        setLockRemainingSeconds(0);
        clearInterval(interval);
      } else {
        setLockRemainingSeconds(diff);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockedUntil]);

  // Güvenlik durumunu güncelleme ve kaydetme
  const recordFailedAttempt = useCallback(() => {
    const now = Date.now();
    const newAttempts = failedAttempts + 1;
    let newLockUntil: number | null = null;

    if (newAttempts >= MAX_FREE_ATTEMPTS) {
      const durationSeconds = getLockoutDuration(newAttempts);
      newLockUntil = now + durationSeconds * 1000;
      setLockedUntil(newLockUntil);
      setLockRemainingSeconds(durationSeconds);
    }

    setFailedAttempts(newAttempts);

    try {
      const secData: StoredSecurity = {
        failedAttempts: newAttempts,
        lockedUntil: newLockUntil,
        lastAttemptTime: now,
      };
      localStorage.setItem(SECURITY_STORAGE_KEY, JSON.stringify(secData));
    } catch (e) {
      console.error("Failed to save security state", e);
    }

    return {
      newAttempts,
      isLockedNow: !!newLockUntil,
      durationSeconds: newLockUntil ? Math.ceil((newLockUntil - now) / 1000) : 0,
    };
  }, [failedAttempts]);

  const clearSecurityState = useCallback(() => {
    setFailedAttempts(0);
    setLockedUntil(null);
    setLockRemainingSeconds(0);
    try {
      localStorage.removeItem(SECURITY_STORAGE_KEY);
    } catch (e) {
      // ignore
    }
  }, []);

  const login = async (username: string, pin: string, rememberMe = true) => {
    // 1. Kilit kontrolü (Brute-Force Lockout)
    const now = Date.now();
    if (lockedUntil && lockedUntil > now) {
      const remaining = Math.ceil((lockedUntil - now) / 1000);
      return {
        success: false,
        error: `Çok sayıda hatalı deneme yapıldı. Lütfen ${remaining} saniye bekleyiniz.`,
      };
    }

    const cleanUser = username.trim();
    const cleanPin = pin.trim();

    if (!cleanUser) {
      return { success: false, error: "Lütfen kullanıcı adınızı giriniz." };
    }
    if (!cleanPin) {
      return { success: false, error: "Lütfen şifre veya PIN kodunuzu giriniz." };
    }

    if (cleanPin.length < 3) {
      return { success: false, error: "Şifre en az 3 karakter olmalıdır." };
    }

    // Timing attack ve bot hızını yavaşlatmak için yapay güvenlik gecikmesi (300ms)
    await new Promise((resolve) => setTimeout(resolve, 300));

    // .env ortam değişkenlerinden yönetici kimlik bilgilerini oku
    const envUsername = process.env.NEXT_PUBLIC_ADMIN_USERNAME;
    const envPin = process.env.NEXT_PUBLIC_ADMIN_PIN;

    if (!envUsername || !envPin) {
      return {
        success: false,
        error: "Yönetici kimlik bilgileri ortam değişkenlerinde (.env) tanımlı değil. Lütfen sistem yöneticinizle görüşün.",
      };
    }

    // KESİN YETKİLENDİRME KONTROLÜ
    const isUserValid = cleanUser.toLowerCase() === envUsername.toLowerCase();
    const isPinValid = cleanPin === envPin;

    if (!isUserValid || !isPinValid) {
      const { isLockedNow, durationSeconds } = recordFailedAttempt();

      if (isLockedNow) {
        return {
          success: false,
          error: `Hatalı kullanıcı adı veya şifre! Lütfen ${durationSeconds} saniye bekleyiniz.`,
        };
      }

      const remainingAttempts = MAX_FREE_ATTEMPTS - (failedAttempts + 1);
      return {
        success: false,
        error: `Hatalı kullanıcı adı veya şifre! (Kalan deneme hakkı: ${remainingAttempts})`,
      };
    }

    // Başarılı giriş: Güvenlik sayacını sıfırla
    clearSecurityState();

    const authData: AuthUser = {
      username: cleanUser,
      name: "Sistem Yöneticisi",
      role: "Yönetici",
    };

    setUser(authData);
    if (rememberMe) {
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
      } catch (err) {
        console.error("Storage error", err);
      }
    }

    return { success: true };
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {
      // ignore
    }
    router.push("/login");
  };

  const isLocked = !!lockedUntil && lockRemainingSeconds > 0;
  const attemptsUntilLock = Math.max(0, MAX_FREE_ATTEMPTS - failedAttempts);

  const securityState: SecurityState = {
    failedAttempts,
    maxFreeAttempts: MAX_FREE_ATTEMPTS,
    isLocked,
    lockRemainingSeconds,
    attemptsUntilLock,
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        securityState,
        login,
        logout,
        resetSecurityLock: clearSecurityState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
