"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useRecords, useDeleteRecord } from "@/lib/hooks/use-records";
import { useTrip } from "@/lib/hooks/use-trips";
import { useTripStore } from "@/store/trip-store";
import { RecordCard } from "@/components/receipt/record-card";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import type { Record as ExpenseRecord } from "@/lib/types";

function groupByDate(records: ExpenseRecord[]): Map<string, ExpenseRecord[]> {
  const groups = new Map<string, ExpenseRecord[]>();
  for (const r of records) {
    const date = r.date.slice(0, 10);
    if (!groups.has(date)) groups.set(date, []);
    groups.get(date)!.push(r);
  }
  return groups;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("ja-JP", {
    month: "long", day: "numeric", weekday: "short",
  });
}

export default function RecordsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const storeTripId = useTripStore((s) => s.currentTripId);
  const tripId = searchParams.get("trip_id") ?? storeTripId ?? "";

  const { data: trip } = useTrip(tripId || null);
  const { data: records, isLoading, error, refetch } = useRecords(tripId);
  const deleteRecord = useDeleteRecord(tripId);

  const [deleteTarget, setDeleteTarget] = useState<ExpenseRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleEdit = (record: ExpenseRecord) => {
    sessionStorage.setItem("editing_record", JSON.stringify(record));
    router.push(`/confirm?mode=edit&record_id=${record.id}&trip_id=${tripId}`);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteRecord.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 px-6">
        <p className="text-sm text-[#888888]">読み込み失敗</p>
        <button onClick={() => refetch()} className="text-amber-500 text-sm font-medium">再読み込み</button>
      </div>
    );
  }

  const grouped = groupByDate(records ?? []);
  const dates = Array.from(grouped.keys()).sort((a, b) => b.localeCompare(a));

  return (
    <div className="flex flex-col px-5 pt-safe">
      <div className="py-4 flex items-center gap-3">
        <button onClick={() => router.push("/trips")} className="text-[#888888] active:text-[#f0f0f0] p-1 -ml-1">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-[#f0f0f0] truncate">{trip?.name ?? "明細"}</h1>
          {trip && (
            <p className="text-xs text-[#888888] mt-0.5">
              {new Date(trip.start_date).toLocaleDateString("zh-TW")} –{" "}
              {new Date(trip.end_date).toLocaleDateString("zh-TW")}
            </p>
          )}
        </div>
        <span className="text-sm text-[#888888] flex-shrink-0">{records?.length ?? 0}件</span>
      </div>

      {dates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <span className="text-4xl">🧾</span>
          <p className="text-sm text-[#888888]">記録がありません</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6 pb-6">
          {dates.map((date) => (
            <div key={date}>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xs font-semibold text-[#888888] uppercase tracking-wide">
                  {formatDate(date)}
                </h2>
                <span className="text-xs text-amber-500 font-medium">
                  ¥{grouped.get(date)!.reduce((s, r) => s + r.amount_jpy, 0).toLocaleString()}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {grouped.get(date)!.map((record) => (
                  <RecordCard
                    key={record.id}
                    record={record}
                    onEdit={() => handleEdit(record)}
                    onDelete={() => setDeleteTarget(record)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation sheet */}
      <BottomSheet
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="記録を削除"
      >
        <div className="flex flex-col gap-4 p-5">
          <p className="text-sm text-[#888888]">
            <span className="text-[#f0f0f0] font-semibold">「{deleteTarget?.store}」</span>
            の記録を削除しますか？この操作は取り消せません。
          </p>
          <Button variant="primary" size="lg" loading={deleting} onClick={handleDeleteConfirm}
            className="bg-red-500 active:bg-red-600">
            削除する
          </Button>
          <button
            onClick={() => setDeleteTarget(null)}
            className="text-sm text-[#888888] text-center py-2 active:opacity-70"
          >
            キャンセル
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}
