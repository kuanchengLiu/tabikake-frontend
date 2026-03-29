"use client";

import { useRef, useState } from "react";
import type { Record as ExpenseRecord } from "@/lib/types";
import { MemberAvatar } from "@/components/member/member-avatar";

const CATEGORY_ICONS: { [key: string]: string } = {
  餐飲: "🍜",
  交通: "🚃",
  購物: "🛍️",
  住宿: "🏨",
  其他: "📦",
};

const REVEAL_WIDTH = 128; // px — width of the two action buttons
const SWIPE_THRESHOLD = 48;

interface RecordCardProps {
  record: ExpenseRecord;
  onEdit: () => void;
  onDelete: () => void;
}

export function RecordCard({ record, onEdit, onDelete }: RecordCardProps) {
  const [offset, setOffset] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const startXRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startXRef.current === null) return;
    const delta = e.touches[0].clientX - startXRef.current;
    if (delta > 0 && !revealed) return; // no right-swipe
    const base = revealed ? -REVEAL_WIDTH : 0;
    const raw = base + delta;
    setOffset(Math.max(-REVEAL_WIDTH, Math.min(0, raw)));
  };

  const handleTouchEnd = () => {
    if (startXRef.current === null) return;
    if (!revealed && offset < -SWIPE_THRESHOLD) {
      setRevealed(true);
      setOffset(-REVEAL_WIDTH);
    } else if (revealed && offset > -REVEAL_WIDTH + SWIPE_THRESHOLD) {
      setRevealed(false);
      setOffset(0);
    } else {
      setOffset(revealed ? -REVEAL_WIDTH : 0);
    }
    startXRef.current = null;
  };

  const close = () => { setRevealed(false); setOffset(0); };

  const paidByMember = record.paid_by_member;

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Action buttons behind the card */}
      <div
        className="absolute inset-y-0 right-0 flex"
        style={{ width: REVEAL_WIDTH }}
      >
        <button
          onClick={() => { close(); onEdit(); }}
          className="flex-1 flex flex-col items-center justify-center bg-blue-500 active:opacity-80 gap-1"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          <span className="text-[10px] text-white font-medium">編集</span>
        </button>
        <button
          onClick={() => { close(); onDelete(); }}
          className="flex-1 flex flex-col items-center justify-center bg-red-500 active:opacity-80 gap-1"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
          </svg>
          <span className="text-[10px] text-white font-medium">削除</span>
        </button>
      </div>

      {/* Card */}
      <div
        className="flex items-center gap-3 py-3 px-4 bg-[#1a1a1a] border border-[#2e2e2e] rounded-2xl relative"
        style={{
          transform: `translateX(${offset}px)`,
          transition: startXRef.current !== null ? "none" : "transform 0.2s ease",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="w-10 h-10 rounded-xl bg-[#242424] flex items-center justify-center text-xl flex-shrink-0">
          {CATEGORY_ICONS[record.category] ?? "📦"}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#f0f0f0] truncate">{record.store}</p>
          <p className="text-xs text-[#888888] mt-0.5">{record.payment} · {record.category}</p>
        </div>

        <div className="flex flex-col items-end gap-1">
          <span className="text-sm font-bold text-[#f0f0f0]">¥{record.amount_jpy.toLocaleString()}</span>
          {paidByMember ? (
            <MemberAvatar member={paidByMember} size="sm" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-[#2e2e2e] flex-shrink-0" />
          )}
        </div>
      </div>
    </div>
  );
}
