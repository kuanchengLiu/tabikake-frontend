"use client";

import { use, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMembers, useRemoveMember } from "@/lib/hooks/use-members";
import { useTrip } from "@/lib/hooks/use-trips";
import { useAuth } from "@/lib/hooks/use-auth";
import { MemberAvatar } from "@/components/member/member-avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("zh-TW", {
    month: "numeric",
    day: "numeric",
  });
}

export default function MembersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: tripId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();

  const { data: trip } = useTrip(tripId);
  const { data: members = [], isLoading } = useMembers(tripId);
  const { data: me } = useAuth();
  const removeMember = useRemoveMember(tripId);
  const inviteMode = searchParams.get("invite") === "1";

  const currentMember = members.find((m) => m.user_id === me?.id);
  const isOwner = currentMember?.is_owner ?? false;

  const inviteLink = useMemo(() => {
    if (!trip?.invite_code) return "";
    if (typeof window === "undefined") return `/join?code=${trip.invite_code}`;
    return `${window.location.origin}/join?code=${trip.invite_code}`;
  }, [trip?.invite_code]);

  const copyInviteLink = async () => {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    toast("邀請連結已複製", "success");
  };

  const shareInviteLink = async () => {
    if (!inviteLink || !trip) return;
    const shareData = {
      title: `加入 ${trip.name}`,
      text: `一起加入 ${trip.name} 的旅費紀錄`,
      url: inviteLink,
    };

    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }

    await navigator.clipboard.writeText(inviteLink);
    toast("此裝置不支援分享，已改為複製連結", "info");
  };

  const handleRemove = async (userId: string, name: string) => {
    if (!window.confirm(`確定要將 ${name} 移出這趟旅行嗎？`)) return;
    try {
      await removeMember.mutateAsync(userId);
      toast("成員已移除", "success");
    } catch {
      toast("移除失敗，請稍後再試", "error");
    }
  };

  return (
    <div className="flex min-h-full flex-col px-5 pb-6 pt-safe">
      <div className="flex items-center gap-3 py-4">
        <button
          onClick={() => router.back()}
          className="p-1 -ml-1 text-[#888888] active:text-[#f0f0f0]"
          aria-label="返回"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold text-[#f0f0f0]">
            {inviteMode ? "邀請旅伴" : "成員管理"}
          </h1>
          <p className="truncate text-sm text-[#888888]">{trip?.name ?? "旅行"}</p>
        </div>
      </div>

      {trip?.invite_code && (
        <section className="mb-5 flex flex-col gap-4 rounded-2xl border border-[#2e2e2e] bg-[#1a1a1a] p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-[#f0f0f0]">邀請連結</h2>
              <p className="mt-1 text-sm leading-5 text-[#888888]">
                分享給旅伴，他們登入 Notion 後就能加入這趟旅行。
              </p>
            </div>
            <div className="rounded-xl bg-amber-500/10 px-3 py-2 text-center">
              <p className="text-[10px] font-semibold uppercase text-amber-500">Code</p>
              <p className="font-mono text-lg font-bold tracking-widest text-amber-500">
                {trip.invite_code}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-[#2e2e2e] bg-[#0f0f0f] px-3 py-2.5">
            <span className="min-w-0 flex-1 truncate text-xs text-[#b8b8b8]">
              {inviteLink}
            </span>
            <button
              onClick={copyInviteLink}
              className="flex-shrink-0 text-sm font-semibold text-amber-500 active:opacity-70"
            >
              複製
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button type="button" variant="primary" onClick={copyInviteLink}>
              複製連結
            </Button>
            <Button type="button" variant="secondary" onClick={shareInviteLink}>
              分享
            </Button>
          </div>
        </section>
      )}

      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#f0f0f0]">目前成員</h2>
        <span className="text-xs text-[#888888]">{members.length} 人</span>
      </div>

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <svg className="h-6 w-6 animate-spin text-amber-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : members.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-12">
          <p className="text-sm text-[#888888]">目前還沒有成員資料</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-3 rounded-2xl border border-[#2e2e2e] bg-[#1a1a1a] px-4 py-3"
            >
              <MemberAvatar user={member.user} size="md" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold text-[#f0f0f0]">
                    {member.user.name}
                  </p>
                  {member.user_id === me?.id && (
                    <span className="rounded-full bg-[#242424] px-2 py-0.5 text-[10px] text-[#888888]">
                      你
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#888888]">
                  {member.is_owner ? (
                    <span className="text-amber-500">主揪</span>
                  ) : (
                    `${formatDate(member.joined_at)} 加入`
                  )}
                </p>
              </div>
              {isOwner && member.user_id !== me?.id && (
                <button
                  onClick={() => handleRemove(member.user_id, member.user.name)}
                  disabled={removeMember.isPending}
                  className="rounded-xl p-2 text-[#888888] transition-colors active:text-red-400 disabled:opacity-40"
                  aria-label={`移除 ${member.user.name}`}
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
