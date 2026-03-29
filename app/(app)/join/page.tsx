"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { joinApi, getErrorMessage } from "@/lib/api";
import { useTripStore } from "@/store/trip-store";
import { ColorPicker, DEFAULT_COLOR } from "@/components/member/color-picker";
import { MemberAvatar } from "@/components/member/member-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { JoinInfo, Member } from "@/lib/types";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("zh-TW", { month: "numeric", day: "numeric" });
}

export default function JoinPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code") ?? "";
  const { setCurrentTripId, setCurrentMemberID } = useTripStore();

  const [info, setInfo] = useState<JoinInfo | null>(null);
  const [infoLoading, setInfoLoading] = useState(true);
  const [infoError, setInfoError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previewMember: Member = {
    id: "", trip_id: "", name: name || "?",
    avatar_color: color, is_owner: false, created_at: "",
  };

  useEffect(() => {
    if (!code) {
      setInfoError("招待コードが見つかりません");
      setInfoLoading(false);
      return;
    }
    joinApi.info(code)
      .then(({ data }) => setInfo(data))
      .catch((err) => setInfoError(getErrorMessage(err)))
      .finally(() => setInfoLoading(false));
  }, [code]);

  const handleJoin = async () => {
    if (!name.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await joinApi.join({ invite_code: code, name: name.trim(), avatar_color: color });
      setCurrentTripId(data.trip.id);
      setCurrentMemberID(data.member.id);
      router.replace(`/records?trip_id=${data.trip.id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (infoLoading) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-[#0f0f0f]">
        <svg className="animate-spin h-6 w-6 text-amber-500" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (infoError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh bg-[#0f0f0f] px-6 gap-4">
        <span className="text-4xl">😕</span>
        <p className="text-sm text-red-400 text-center">{infoError}</p>
        <button onClick={() => router.replace("/trips")} className="text-amber-500 text-sm font-medium">
          トップへ戻る
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-dvh bg-[#0f0f0f] px-6 pt-safe pb-8">
      <div className="flex flex-col items-center gap-2 py-8">
        <div className="w-16 h-16 rounded-2xl bg-amber-500 flex items-center justify-center text-3xl">
          ✈️
        </div>
        <h1 className="text-xl font-bold text-[#f0f0f0] mt-2">旅行に参加する</h1>
      </div>

      {/* Trip info card */}
      {info && (
        <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-2xl p-4 flex flex-col gap-2 mb-6">
          <h2 className="text-base font-bold text-amber-500">{info.trip_name}</h2>
          <div className="flex flex-col gap-1">
            <p className="text-xs text-[#888888]">
              建立者：<span className="text-[#f0f0f0]">{info.owner_name}</span>
            </p>
            <p className="text-xs text-[#888888]">
              目前メンバー：<span className="text-[#f0f0f0]">{info.member_count} 人</span>
            </p>
            <p className="text-xs text-[#888888]">
              旅行日：<span className="text-[#f0f0f0]">{formatDate(info.start_date)} – {formatDate(info.end_date)}</span>
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-5">
        <Input
          label="あなたの名前"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="名前を入力"
        />

        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-[#888888] uppercase tracking-wide">アバターカラー</span>
          <div className="flex items-center gap-4">
            <MemberAvatar member={previewMember} size="lg" />
            <ColorPicker value={color} onChange={setColor} />
          </div>
        </div>

        {error && (
          <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-2xl">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <Button variant="primary" size="lg" loading={loading} disabled={!name.trim()} onClick={handleJoin}>
          旅行に参加する
        </Button>
      </div>
    </div>
  );
}
