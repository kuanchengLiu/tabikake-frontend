"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTrips } from "@/lib/hooks/use-trips";
import { useMembers } from "@/lib/hooks/use-members";
import { useTripStore } from "@/store/trip-store";
import { MemberAvatar } from "@/components/member/member-avatar";
import type { Trip } from "@/lib/types";

function formatDateRange(start: string, end: string): string {
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("zh-TW", { month: "numeric", day: "numeric" });
  return `${fmt(start)} – ${fmt(end)}`;
}

function TripCard({ trip, onSelect }: { trip: Trip; onSelect: (id: string) => void }) {
  const { data: members = [] } = useMembers(trip.id);
  const visible = members.slice(0, 5);
  const overflow = members.length - 5;

  return (
    <div className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-2xl p-4">
      <div className="flex items-start justify-between gap-3">
        <button
          onClick={() => onSelect(trip.id)}
          className="flex-1 text-left min-w-0"
        >
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-[#f0f0f0] truncate">{trip.name}</h2>
            {!trip.is_owner && (
              <span className="flex-shrink-0 text-[10px] font-semibold text-blue-400 border border-blue-400/40 bg-blue-400/10 rounded-full px-1.5 py-0.5">
                参加中
              </span>
            )}
          </div>
          <p className="text-sm text-[#888888] mt-0.5">
            {formatDateRange(trip.start_date, trip.end_date)}
          </p>
        </button>
        <Link
          href={`/trips/${trip.id}/members`}
          className="flex-shrink-0 w-8 h-8 rounded-xl bg-[#242424] flex items-center justify-center text-[#888888] active:text-[#f0f0f0]"
          onClick={(e) => e.stopPropagation()}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 00-3-3.87" />
            <path d="M16 3.13a4 4 0 010 7.75" />
          </svg>
        </Link>
      </div>

      {members.length > 0 && (
        <div className="flex items-center mt-3">
          {visible.map((m, i) => (
            <div key={m.id} style={{ zIndex: visible.length - i, marginLeft: i === 0 ? 0 : -6 }}>
              <MemberAvatar member={m} size="sm" />
            </div>
          ))}
          {overflow > 0 && (
            <span className="text-xs text-[#888888] ml-2">+{overflow}</span>
          )}
        </div>
      )}
    </div>
  );
}

export default function TripsPage() {
  const router = useRouter();
  const { data: trips, isLoading, error } = useTrips();
  const setCurrentTripId = useTripStore((s) => s.setCurrentTripId);

  const handleSelect = (id: string) => {
    setCurrentTripId(id);
    router.push(`/records?trip_id=${id}`);
  };

  return (
    <div className="flex flex-col px-5 pt-safe min-h-full">
      <div className="flex items-center justify-between py-4">
        <h1 className="text-xl font-bold text-[#f0f0f0]">旅行を選ぶ</h1>
        <Link
          href="/trips/new"
          className="flex items-center gap-1.5 bg-amber-500 text-black rounded-xl px-3 py-2 text-sm font-semibold active:scale-95 transition-transform"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          新増
        </Link>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <svg className="animate-spin h-6 w-6 text-amber-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center text-[#888888] text-sm">
          読み込み失敗
        </div>
      ) : !trips || trips.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 py-16">
          <span className="text-5xl">✈️</span>
          <p className="text-sm text-[#888888] text-center">
            旅行がまだありません
            <br />
            「新増」から最初の旅行を作りましょう
          </p>
          <Link
            href="/trips/new"
            className="mt-2 bg-amber-500 text-black rounded-2xl px-6 py-3 text-sm font-semibold active:scale-95 transition-transform"
          >
            旅行を作成
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3 pb-6">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} onSelect={handleSelect} />
          ))}
        </div>
      )}
    </div>
  );
}
