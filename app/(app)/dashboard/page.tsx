"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useDashboard } from "@/lib/hooks/use-dashboard";
import { useTrip } from "@/lib/hooks/use-trips";
import { useTripStore } from "@/store/trip-store";
import { StatCard } from "@/components/dashboard/stat-card";
import { PersonBar } from "@/components/dashboard/person-bar";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { RecordCard } from "@/components/receipt/record-card";

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const storeTripId = useTripStore((s) => s.currentTripId);
  const tripId = searchParams.get("trip_id") ?? storeTripId ?? "";

  const { data: trip } = useTrip(tripId || null);
  const { data, isLoading, error } = useDashboard(tripId);

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

  if (error || !data) {
    return <div className="flex items-center justify-center h-full text-[#888888] text-sm">読み込み失敗</div>;
  }

  const totalJpy = data.total_jpy ?? 0;
  const totalTwd = data.total_twd ?? 0;
  const byPerson = data.by_person ?? [];
  const byCategory = data.by_category ?? [];
  const records = data.records ?? [];
  const maxPersonAmount = Math.max(...byPerson.map((p) => p.amount), 0);
  const today = new Date().toISOString().slice(0, 10);
  const todayRecords = records.filter((r) => r.date.startsWith(today));

  return (
    <div className="flex flex-col px-5 pt-safe pb-6 gap-6">
      {/* Header */}
      <div className="py-4">
        <h1 className="text-xl font-bold text-[#f0f0f0] truncate">{trip?.name ?? "統計"}</h1>
        {trip && (
          <p className="text-xs text-[#888888] mt-0.5">
            {new Date(trip.start_date).toLocaleDateString("zh-TW")} –{" "}
            {new Date(trip.end_date).toLocaleDateString("zh-TW")}
          </p>
        )}
      </div>

      {/* Totals */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="合計 (JPY)" value={`¥${totalJpy.toLocaleString()}`} />
        <StatCard label="合計 (TWD)" value={`NT$${totalTwd.toLocaleString()}`} />
      </div>

      {/* Per person */}
      {byPerson.length > 0 && (
        <div className="bg-[#1a1a1a] rounded-2xl p-4 border border-[#2e2e2e] flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-[#f0f0f0]">メンバー別</h2>
          {byPerson.map((p) => (
            <PersonBar key={p.user_id} name={p.name} amount={p.amount} max={maxPersonAmount} />
          ))}
        </div>
      )}

      {/* Category chart */}
      {byCategory.length > 0 && (
        <div className="bg-[#1a1a1a] rounded-2xl p-4 border border-[#2e2e2e]">
          <h2 className="text-sm font-semibold text-[#f0f0f0] mb-4">カテゴリ別</h2>
          <CategoryChart data={byCategory} />
        </div>
      )}

      {/* Today's records */}
      {todayRecords.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-[#f0f0f0]">今日の支出</h2>
          {todayRecords.map((r) => <RecordCard key={r.id} record={r} />)}

        </div>
      )}
    </div>
  );
}
