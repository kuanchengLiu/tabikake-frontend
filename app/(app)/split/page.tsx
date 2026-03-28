"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useSettlement } from "@/lib/hooks/use-settlement";
import { useTrip } from "@/lib/hooks/use-trips";
import { useTripStore } from "@/store/trip-store";
import { MemberAvatar } from "@/components/member/member-avatar";
import Link from "next/link";

export default function SplitPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const storeTripId = useTripStore((s) => s.currentTripId);
  const tripId = searchParams.get("trip_id") ?? storeTripId ?? "";

  const { data: trip } = useTrip(tripId || null);
  const { data, isLoading } = useSettlement(tripId || null);

  if (!tripId) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 px-6">
        <p className="text-sm text-[#888888]">旅行が選択されていません</p>
        <button onClick={() => router.push("/trips")} className="text-amber-500 text-sm font-medium">
          旅行を選ぶ
        </button>
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

  const byMember = data?.by_member ?? [];
  const settlements = data?.settlements ?? [];
  const totalJpy = data?.total_jpy ?? 0;

  return (
    <div className="flex flex-col px-5 pt-safe pb-6 gap-5">
      <div className="py-4">
        <h1 className="text-xl font-bold text-[#f0f0f0] truncate">{trip?.name ?? "分帳"}</h1>
        <p className="text-sm text-[#888888] mt-0.5">支払い分担を確認</p>
      </div>

      {/* Total */}
      <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-2xl px-4 py-3 flex items-center justify-between">
        <span className="text-sm text-[#888888]">旅行総支出</span>
        <span className="text-lg font-bold text-amber-500">¥{totalJpy.toLocaleString()}</span>
      </div>

      {/* Per member */}
      {byMember.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-[#f0f0f0]">各自の支払い</h2>
          {byMember.map(({ member, paid_jpy, owe_jpy, diff_jpy }) => (
            <div
              key={member.id}
              className="flex items-center gap-3 bg-[#1a1a1a] border border-[#2e2e2e] rounded-2xl px-4 py-3"
            >
              <MemberAvatar member={member} size="md" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#f0f0f0]">{member.name}</p>
                <p className="text-xs text-[#888888]">
                  実払 ¥{paid_jpy.toLocaleString()} / 負担 ¥{owe_jpy.toLocaleString()}
                </p>
              </div>
              <span
                className={`text-sm font-bold flex-shrink-0 ${
                  diff_jpy > 0 ? "text-green-400" : diff_jpy < 0 ? "text-red-400" : "text-[#888888]"
                }`}
              >
                {diff_jpy > 0
                  ? `+¥${diff_jpy.toLocaleString()}`
                  : diff_jpy < 0
                  ? `-¥${Math.abs(diff_jpy).toLocaleString()}`
                  : "±0"}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Settlements */}
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

      {byMember.length === 0 && settlements.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <span className="text-4xl">💴</span>
          <p className="text-sm text-[#888888]">まだ支出がありません</p>
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
    </div>
  );
}
