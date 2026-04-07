"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useMembers, useRemoveMember } from "@/lib/hooks/use-members";
import { useTrip } from "@/lib/hooks/use-trips";
import { useAuth } from "@/lib/hooks/use-auth";
import { MemberAvatar } from "@/components/member/member-avatar";
import { useToast } from "@/components/ui/toast";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("zh-TW", { month: "numeric", day: "numeric" });
}

export default function MembersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: tripId } = use(params);
  const router = useRouter();
  const toast = useToast();

  const { data: trip } = useTrip(tripId);
  const { data: members = [], isLoading } = useMembers(tripId);
  const { data: me } = useAuth();
  const removeMember = useRemoveMember(tripId);

  const currentMember = members.find((m) => m.user_id === me?.id);
  const isOwner = currentMember?.is_owner ?? false;

  const [removingId, setRemovingId] = useState<string | null>(null);

  const inviteLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/join?code=${trip?.invite_code ?? ""}`
      : `/join?code=${trip?.invite_code ?? ""}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    toast("招待リンクをコピーしました", "success");
  };

  const handleRemove = async (userId: string) => {
    setRemovingId(userId);
    try {
      await removeMember.mutateAsync(userId);
      toast("メンバーを削除しました", "success");
    } catch {
      toast("削除に失敗しました", "error");
    } finally {
      setRemovingId(null);
    }
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
              <MemberAvatar user={member.user} size="md" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#f0f0f0]">{member.user.name}</p>
                <p className="text-xs text-[#888888]">
                  {member.is_owner ? (
                    <span className="text-amber-500">オーナー</span>
                  ) : (
                    formatDate(member.joined_at) + " 参加"
                  )}
                </p>
              </div>
              {isOwner && member.user_id !== me?.id && (
                <button
                  onClick={() => handleRemove(member.user_id)}
                  disabled={removingId === member.user_id}
                  className="p-2 text-[#888888] active:text-red-400 transition-colors disabled:opacity-50"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                    <path d="M10 11v6M14 11v6" />
                    <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
