import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    // İsteği yapan kullanıcının gerçek IP adresini tespit et
    const forwarded = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const detectedIp = forwarded ? forwarded.split(",")[0].trim() : realIp || "127.0.0.1";

    const headerUa = request.headers.get("user-agent") || "";

    const watchUrl = (
      process.env.VERCEL_WATCH_URL ||
      process.env.NEXT_PUBLIC_VERCEL_WATCH_URL ||
      "https://vercel-website-security.vercel.app"
    ).replace(/\/+$/, "");

    const apiKey =
      process.env.VERCEL_WATCH_API_KEY ||
      process.env.WATCH_API_KEY ||
      "vw_live_sec_7c4f19b6a03e82d1";

    const finalPayload = {
      projectId: body.projectId || process.env.NEXT_PUBLIC_VERCEL_WATCH_PROJECT_ID || "bademcioglu-sut-ve-sut-urunleri",
      projectName: body.projectName || "bademcioglu-sut-ve-sut-urunleri",
      projectUrl: body.projectUrl || "https://bademcioglu-sut-ve-sut-urunleri.vercel.app",
      event: body.event || "LOGIN_SUCCESS",
      username: body.username || "admin",
      ip: body.ip && body.ip !== "127.0.0.1" ? body.ip : detectedIp,
      userAgent: body.userAgent || headerUa,
      details: body.details || "",
      notifyTelegram: body.notifyTelegram ?? true,
      timestamp: new Date().toISOString(),
    };

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (apiKey) {
      headers["x-api-key"] = apiKey;
    }

    const res = await fetch(`${watchUrl}/api/ingest`, {
      method: "POST",
      headers,
      body: JSON.stringify(finalPayload),
      signal: AbortSignal.timeout(4500),
    });

    const resData = await res.json().catch(() => ({}));
    return NextResponse.json(resData, { status: res.status });
  } catch (error: any) {
    // Projenin akışını etkilememesi için sessizce hata döner
    return NextResponse.json(
      { error: error?.message || "Log iletiminde hata oluştu." },
      { status: 500 }
    );
  }
}
