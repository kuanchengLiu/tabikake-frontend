import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    console.error("[auth/callback] missing code or error:", error);
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error ?? "no_code")}`, request.url));
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}/auth/notion/callback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
  } catch (err) {
    console.error("[auth/callback] fetch to backend failed:", err);
    return NextResponse.redirect(new URL("/login?error=backend_unreachable", request.url));
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "(unreadable)");
    console.error(`[auth/callback] backend returned ${res.status}:`, body);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(`backend_${res.status}: ${body}`)}`, request.url)
    );
  }

  const json = await res.json() as Record<string, unknown>;
  console.log("[auth/callback] backend response keys:", Object.keys(json));

  // Support both { token } and { access_token } response shapes
  const token = (json.token ?? json.access_token) as string | undefined;

  if (!token) {
    console.error("[auth/callback] no token in response:", JSON.stringify(json));
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent("no_token_in_response")}`, request.url)
    );
  }

  const response = NextResponse.redirect(new URL("/upload", request.url));
  response.cookies.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}
