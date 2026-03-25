import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

async function proxyRequest(request: NextRequest): Promise<NextResponse> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  // Strip the /api/proxy prefix to get the real backend path
  const backendPath = request.nextUrl.pathname.replace(/^\/api\/proxy/, "");
  const backendUrl = new URL(
    backendPath + request.nextUrl.search,
    API_URL
  );

  const headers = new Headers(request.headers);
  headers.delete("host");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const isFormData =
    request.headers.get("content-type")?.includes("multipart/form-data");

  const body =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : isFormData
      ? await request.formData()
      : await request.text();

  const res = await fetch(backendUrl, {
    method: request.method,
    headers,
    body: body as BodyInit | undefined,
    // @ts-expect-error - Node.js fetch option
    duplex: "half",
  });

  const responseHeaders = new Headers(res.headers);
  responseHeaders.delete("content-encoding"); // avoid double-decompression

  return new NextResponse(res.body, {
    status: res.status,
    headers: responseHeaders,
  });
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
