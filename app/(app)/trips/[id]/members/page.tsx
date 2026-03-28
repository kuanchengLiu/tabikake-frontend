"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useMembers, useCreateMember } from "@/lib/hooks/use-members";
import { useTrip } from "@/lib/hooks/use-trips";
import { MemberAvatar } from "@/components/member/member-avatar";
import { ColorPicker, DEFAULT_COLOR } from "@/components/member/color-picker";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export default function MembersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: tripId } = use(params);
  const router = useRouter();
  const toast = useToast();

  const { data: trip } = useTrip(tripId);
  const { data: members = [], isLoading } = useMembers(tripId);
  const createMember = useCreateMember(tripId);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState(DEFAULT_COLOR);

  const inviteLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/join?code=${trip?.invite_code ?? ""}`
      : `/join?code=${trip?.invite_code ?? ""}`;

  const handleAdd = async () => {
    if (!name.trim()) return;
    try {
      await createMember.mutateAsync({ name: name.trim(), avatar_color: color });
      toast("メンバーを追加しました", "success");
      setName("");
      setColor(DEFAULT_COLOR);
      setSheetOpen(false);
    } catch {
      toast("追加に失敗しました", "error");
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    toast("招待リンクをコピーしました", "success");
  };

  return (
    <div className="flex flex-col px-5 pt-safe pb-6 min-h-full">
      {/* Header */}
      <div className="flex items-center gap-3 py-4">
        <button onClick={() => router.back()} className="text-[#888888] active:text-[#f0f0f0] p-1 -ml-1">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-[#f0f0f0]">メンバー管理</h1>
          <p className="text-sm text-[#888888] truncate">{trip?.name}</p>
        </div>
        <button
          onClick={() => setSheetOpen(true)}
          className="flex items-center gap-1.5 bg-amber-500 text-black rounded-xl px-3 py-2 text-sm font-semibold active:scale-95 transition-transform"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          新増
        </button>
      </div>

      {/* Invite code */}
      {trip?.invite_code && (
        <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-2xl p-4 flex flex-col gap-3 mb-4">
          <p className="text-xs text-[#888888] font-medium uppercase tracking-wide">招待コード</p>
          <p className="text-3xl font-bold text-amber-500 tracking-widest text-center">
            {trip.invite_code}
          </p>
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center justify-center gap-2 bg-[#242424] border border-[#2e2e2e] rounded-xl py-2.5 text-sm text-[#f0f0f0] font-medium active:scale-95 transition-transform"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
            招待リンクをコピー
          </button>
        </div>
      )}

      {/* Members list */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <svg className="animate-spin h-6 w-6 text-amber-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : members.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-12">
          <span className="text-4xl">👥</span>
          <p className="text-sm text-[#888888]">まだメンバーがいません</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-3 bg-[#1a1a1a] border border-[#2e2e2e] rounded-2xl px-4 py-3"
            >
              <MemberAvatar member={member} size="md" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#f0f0f0]">{member.name}</p>
                {member.is_owner && (
                  <p className="text-xs text-amber-500">オーナー</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add member sheet */}
      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="メンバーを追加">
        <div className="flex flex-col gap-5 p-5">
          <Input
            label="名前"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="旅仲間の名前"
          />
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-[#888888] uppercase tracking-wide">アバターカラー</span>
            <div className="flex items-center gap-3">
              <MemberAvatar member={{ id: "", trip_id: "", name: name || "?", avatar_color: color, is_owner: false, created_at: "" }} size="lg" />
              <ColorPicker value={color} onChange={setColor} />
            </div>
          </div>
          <Button
            variant="primary"
            size="lg"
            loading={createMember.isPending}
            disabled={!name.trim()}
            onClick={handleAdd}
          >
            追加する
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
}
