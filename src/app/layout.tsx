import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { NavProvider } from "@/context/NavContext";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import AppLayout from "@/components/AppLayout";

export const metadata: Metadata = {
  title: "Bademcioğlu Yoğurtları — Mandıra & Süt Takip Sistemi",
  description: "Anamur'un Yerli Markası Bademcioğlu Yoğurtları süt alımı, müstahsil ve yoğurt dağıtım takip sistemi",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Bademcioğlu",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#FFFFFF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="light" suppressHydrationWarning>
      <body
        className="bg-slate-50 dark:bg-[#090D14] min-h-screen text-slate-900 dark:text-slate-100 antialiased font-sans transition-colors duration-200"
        suppressHydrationWarning
      >
        <ThemeProvider>
          <AuthProvider>
            <NavProvider>
              <ToastProvider>
                <AppLayout>{children}</AppLayout>
              </ToastProvider>
            </NavProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
