"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSettlement } from "@/lib/hooks/use-settlement";
import { useTripStore } from "@/store/trip-store";
import { MemberAvatar } from "@/components/member/member-avatar";
import { Button } from "@/components/ui/button";
import { splitApi, getErrorMessage } from "@/lib/api";

export default function SplitExportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const storeTripId = useTripStore((s) => s.currentTripId);
  const tripId = searchParams.get("trip_id") ?? storeTripId ?? "";

  const { data } = useSettlement(tripId || null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [notionUrl, setNotionUrl] = useState<string | null>(null);

  const settlements = data?.settlements ?? [];

  const handleExport = async () => {
    setLoading(true);
    setStatus("idle");
    try {
      const res = await splitApi.export(tripId);
      setStatus("success");
      const url = (res.data as { url?: string })?.url;
      if (url) setNotionUrl(url);
    } catch (err) {
      setErrorMsg(getErrorMessage(err));
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (notionUrl) navigator.clipboard.writeText(notionUrl);
  };

  return (
    <div className="flex flex-col px-5 pt-safe pb-6 gap-5">
      <div className="flex items-center gap-3 py-4">
        <button onClick={() => router.back()} className="text-[#888888] active:text-[#f0f0f0] p-1 -ml-1">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <div>
          <h1 className="text-xl font-bold text-[#f0f0f0]">Notion に書き出す</h1>
          <p className="text-sm text-[#888888]">各メンバーの精算ページを作成</p>
        </div>
      </div>

      {/* Settlement preview */}
      {settlements.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-[#f0f0f0]">精算内容</h2>
          {settlements.map((s, i) => (
            <div
              key={i}
              className="flex items-center gap-3 bg-[#1a1a1a] border border-[#2e2e2e] rounded-2xl px-4 py-3"
            >
              <MemberAvatar member={s.from} size="md" />
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888888" strokeWidth="2" strokeLinecap="round" className="flex-shrink-0">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
              <MemberAvatar member={s.to} size="md" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#f0f0f0]">
                  <span className="font-semibold">{s.from.name}</span>
                  <span className="text-[#888888]"> → </span>
                  <span className="font-semibold">{s.to.name}</span>
                </p>
              </div>
              <span className="text-base font-bold text-amber-500 flex-shrink-0">
                ¥{s.amount_jpy.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}

      {status === "success" && (
        <div className="flex flex-col gap-3">
          <div className="px-4 py-3 bg-green-500/10 border border-green-500/30 rounded-2xl">
            <p className="text-sm text-green-400">✓ 結算ページを作成しました！</p>
          </div>
          {notionUrl && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-4 py-3">
                <span className="flex-1 text-xs text-[#888888] truncate">{notionUrl}</span>
                <button onClick={handleCopy} className="text-amber-500 text-xs font-medium flex-shrink-0 active:opacity-70">
                  コピー
                </button>
              </div>
              <p className="text-xs text-[#888888] text-center px-2">
                旅仲間にリンクを共有して結算結果を確認してもらいましょう
              </p>
            </div>
          )}
        </div>
      )}

      {status === "error" && (
        <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-2xl">
          <p className="text-sm text-red-400">{errorMsg}</p>
        </div>
      )}

      <Button
        variant="primary"
        size="lg"
        loading={loading}
        disabled={status === "success"}
        onClick={handleExport}
      >
        {status === "success" ? "書き出し済み" : "Notion に書き出す"}
      </Button>
    </div>
  );
}
