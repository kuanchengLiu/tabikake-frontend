"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

export default function AuthCallbackPage() {
  const searchParams = useSearchParams();
  const called = useRef(false);

  const code = searchParams.get("code");
  const oauthError = searchParams.get("error");

  useEffect(() => {
    if (called.current || oauthError || !code) return;
    called.current = true;
    window.location.href = `/api/auth/callback?code=${encodeURIComponent(code)}`;
  }, [code, oauthError]);

  if (oauthError || !code) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#0f0f0f] px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-red-400">
            認証エラー: {oauthError ?? "code が見つかりません"}
          </p>
          <a href="/login" className="text-amber-500 text-sm font-medium">
            ログインに戻る
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-[#0f0f0f]">
      <div className="flex flex-col items-center gap-4">
        <svg
          className="animate-spin h-8 w-8 text-amber-500"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
        <p className="text-sm text-[#888888]">ログイン中...</p>
      </div>
    </div>
  );
}
