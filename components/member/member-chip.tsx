"use client";

import type { Member } from "@/lib/types";
import { MemberAvatar } from "./member-avatar";

interface MemberChipProps {
  member: Member;
  selected: boolean;
  onToggle: () => void;
}

export function MemberChip({ member, selected, onToggle }: MemberChipProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex items-center gap-2 px-3 py-2 rounded-2xl border transition-all active:scale-95 ${
        selected
          ? "border-amber-500 bg-amber-500/10"
          : "border-[#2e2e2e] bg-[#1a1a1a]"
      }`}
    >
      <MemberAvatar member={member} size="sm" />
      <span className={`text-sm font-medium ${selected ? "text-amber-500" : "text-[#888888]"}`}>
        {member.name}
      </span>
    </button>
  );
}
