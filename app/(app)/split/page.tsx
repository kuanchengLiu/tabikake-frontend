"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDashboard } from "@/lib/hooks/use-dashboard";
import { useTrip } from "@/lib/hooks/use-trips";
import { useTripStore } from "@/store/trip-store";
import { SplitSelector } from "@/components/split/split-selector";
import { SettlementCard } from "@/components/split/settlement-card";
import { PersonBar } from "@/components/dashboard/person-bar";
import Link from "next/link";

export default function SplitPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const storeTripId = useTripStore((s) => s.currentTripId);
  const tripId = searchParams.get("trip_id") ?? storeTripId ?? "";

  const [mode, setMode] = useState<"equal" | "custom">("equal");
  const { data: trip } = useTrip(tripId || null);
  const { data, isLoading } = useDashboard(tripId);

  if (!tripId) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 px-6">
        <p className="text-sm text-[#888888]">旅行が選択されていません</p>
        <button onClick={() => router.push("/trips")} className="text-amber-500 text-sm font-medium">旅行を選ぶ</button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <svg className="animate-spin h-6 w-6 text-amber-500" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  const maxPersonAmount = Math.max(...(data?.by_person?.map((p) => p.amount) ?? [0]), 0);

  return (
    <div className="flex flex-col px-5 pt-safe pb-6 gap-5">
      <div className="py-4">
        <h1 className="text-xl font-bold text-[#f0f0f0] truncate">{trip?.name ?? "分帳"}</h1>
        <p className="text-sm text-[#888888] mt-0.5">支払い分担を確認</p>
      </div>

      <SplitSelector mode={mode} onChange={setMode} />

      {mode === "equal" ? (
        <>
          {data && (data.by_person?.length ?? 0) > 0 && (
            <div className="bg-[#1a1a1a] rounded-2xl p-4 border border-[#2e2e2e] flex flex-col gap-4">
              <h2 className="text-sm font-semibold text-[#f0f0f0]">各自の支払い</h2>
              {data.by_person?.map((p) => (
                <PersonBar key={p.user_id} name={p.name} amount={p.amount} max={maxPersonAmount} />
              ))}
            </div>
          )}
          {data && (data.settlements?.length ?? 0) > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold text-[#f0f0f0]">精算内容</h2>
              {data.settlements?.map((s, i) => (
                <SettlementCard key={i} fromName={s.from_name} toName={s.to_name} amount={s.amount} />
              ))}
            </div>
          )}
          <Link
            href={`/split/export?trip_id=${tripId}`}
            className="w-full flex items-center justify-center gap-2 bg-[#242424] text-[#f0f0f0] border border-[#2e2e2e] rounded-2xl py-3.5 font-semibold text-sm active:scale-95 transition-transform mt-2"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Notion に精算を書き出す
          </Link>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <span className="text-4xl">🚧</span>
          <p className="text-sm text-[#888888]">個別指定は近日実装予定</p>
        </div>
      )}
    </div>
  );
}
