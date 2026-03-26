"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import type { Trip } from "@/lib/types";

interface TripSelectorProps {
  trips: Trip[];
  currentTripId: string | null;
  onSelect: (tripId: string) => void;
}

function formatDateRange(start: string, end: string): string {
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("zh-TW", { month: "numeric", day: "numeric" });
  return `${fmt(start)} – ${fmt(end)}`;
}

export function TripSelector({ trips, currentTripId, onSelect }: TripSelectorProps) {
  const [open, setOpen] = useState(false);
  const current = trips.find((t) => t.id === currentTripId);

  const handleSelect = (id: string) => {
    onSelect(id);
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-[#242424] border border-[#2e2e2e] rounded-2xl px-3 py-2 active:scale-95 transition-transform max-w-full"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
          <path d="M3 17l4-8 4 4 4-6 4 6" />
          <line x1="3" y1="21" x2="21" y2="21" />
        </svg>
        <span className="text-sm font-medium text-[#f0f0f0] truncate max-w-[160px]">
          {current?.name ?? "旅行を選択"}
        </span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#888888" strokeWidth="2" className="flex-shrink-0">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      <BottomSheet open={open} onClose={() => setOpen(false)} title="旅行を切り替え">
        <div className="flex flex-col gap-1 p-4">
          {trips.map((trip) => {
            const selected = trip.id === currentTripId;
            return (
              <button
                key={trip.id}
                onClick={() => handleSelect(trip.id)}
                className={`flex items-center justify-between px-4 py-3 rounded-2xl transition-colors active:opacity-70 ${
                  selected
                    ? "bg-amber-500/10 border border-amber-500/40"
                    : "hover:bg-[#242424]"
                }`}
              >
                <div className="flex flex-col items-start gap-0.5">
                  <span className={`text-sm font-semibold ${selected ? "text-amber-500" : "text-[#f0f0f0]"}`}>
                    {trip.name}
                  </span>
                  <span className="text-xs text-[#888888]">
                    {formatDateRange(trip.start_date, trip.end_date)}
                  </span>
                </div>
                {selected && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </BottomSheet>
    </>
  );
}
