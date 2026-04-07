import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

// Public endpoint — no auth required
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.json({ message: "code is required" }, { status: 400 });
  }

  try {
    const res = await fetch(`${API_URL}/trips/join-info?code=${encodeURIComponent(code)}`);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ message: "backend unreachable" }, { status: 502 });
  }
}
