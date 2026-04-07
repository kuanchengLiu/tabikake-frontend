"use client";

import { useSearchParams } from "next/navigation";
import { authApi } from "@/lib/api";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "";
  const state = next ? encodeURIComponent(next) : "";

  const handleLogin = async () => {
    const { data } = await authApi.notionUrl();
    const url = state ? `${data.url}&state=${state}` : data.url;
    window.location.href = url;
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 bg-[#0f0f0f]">
      <div className="w-full max-w-sm flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-2xl bg-amber-500 flex items-center justify-center text-3xl">
            ✈️
          </div>
          <h1 className="text-2xl font-bold text-[#f0f0f0]">Tabikake</h1>
          <p className="text-sm text-[#888888] text-center">旅の支出をかんたん管理</p>
        </div>

        <ul className="w-full flex flex-col gap-3">
          {[
            { icon: "📸", text: "レシートを撮るだけで自動記録" },
            { icon: "💴", text: "JPY / TWD 換算対応" },
            { icon: "🔗", text: "Notion と同期して共有" },
          ].map((item) => (
            <li key={item.text} className="flex items-center gap-3 text-sm text-[#888888]">
              <span className="text-xl">{item.icon}</span>
              {item.text}
            </li>
          ))}
        </ul>

        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 bg-[#f0f0f0] text-black rounded-2xl py-3.5 font-semibold text-sm active:scale-95 transition-transform"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect width="24" height="24" rx="4" fill="black" />
            <path d="M6.5 6h3.6l5.4 7.5V6H17v12h-3.4L8 10.5V18H6.5V6z" fill="white" />
          </svg>
          Notion でログイン
        </button>

        <p className="text-xs text-[#888888] text-center">
          ログインすることで利用規約に同意したものとみなします
        </p>
      </div>
    </div>
  );
}
