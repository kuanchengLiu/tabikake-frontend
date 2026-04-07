"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { joinApi, getErrorMessage } from "@/lib/api";
import { useTripStore } from "@/store/trip-store";
import { Button } from "@/components/ui/button";
import type { JoinInfo } from "@/lib/types";


export default function JoinPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code") ?? "";
  const { setCurrentTripId, setCurrentMemberID } = useTripStore();

  const [info, setInfo] = useState<JoinInfo | null>(null);
  const [infoLoading, setInfoLoading] = useState(true);
  const [infoError, setInfoError] = useState<string | null>(null);
  const [authed, setAuthed] = useState<boolean | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check trip info (public endpoint)
  useEffect(() => {
    if (!code) { setInfoError("招待コードが見つかりません"); setInfoLoading(false); return; }
    fetch(`/api/join-info?code=${encodeURIComponent(code)}`)
      .then((r) => r.ok ? r.json() : r.json().then((d) => Promise.reject(d.message || "取得失敗")))
      .then((data: JoinInfo) => setInfo(data))
      .catch((err) => setInfoError(typeof err === "string" ? err : "旅行情報の取得に失敗しました"))
      .finally(() => setInfoLoading(false));
  }, [code]);

  // Check auth status
  useEffect(() => {
    fetch("/api/auth/status")
      .then((r) => r.json())
      .then(({ authenticated }: { authenticated: boolean }) => setAuthed(authenticated))
      .catch(() => setAuthed(false));
  }, []);

  // After OAuth redirect back here: auto-join if pending_join is in localStorage
  useEffect(() => {
    if (!authed) return;
    const pending = localStorage.getItem("pending_join");
    if (!pending) return;
    try {
      const { invite_code } = JSON.parse(pending) as { invite_code: string };
      if (invite_code !== code) return;
      localStorage.removeItem("pending_join");
      setLoading(true);
      joinApi.join({ invite_code })
        .then(({ data }) => {
          setCurrentTripId(data.trip.id);
          setCurrentMemberID(data.member.id);
          router.replace(`/records?trip_id=${data.trip.id}`);
        })
        .catch((err) => {
          setError(getErrorMessage(err));
          setLoading(false);
        });
    } catch {
      localStorage.removeItem("pending_join");
    }
  }, [authed, code]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleJoin = async () => {
    if (!code) return;
    if (!authed) {
      localStorage.setItem("pending_join", JSON.stringify({ invite_code: code }));
      router.push(`/login?next=${encodeURIComponent(`/join?code=${code}`)}`);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data } = await joinApi.join({ invite_code: code });
      setCurrentTripId(data.trip.id);
      setCurrentMemberID(data.member.id);
      router.replace(`/records?trip_id=${data.trip.id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (infoLoading || authed === null) {
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
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-dvh bg-[#0f0f0f] px-6 pb-8" style={{ paddingTop: "env(safe-area-inset-top, 24px)" }}>
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
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {error && (
          <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-2xl">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <Button
          variant="primary"
          size="lg"
          loading={loading}
          onClick={handleJoin}
        >
          {authed ? (
            "旅行に参加する"
          ) : (
            <span className="flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect width="24" height="24" rx="4" fill="black" />
                <path d="M6.5 6h3.6l5.4 7.5V6H17v12h-3.4L8 10.5V18H6.5V6z" fill="white" />
              </svg>
              Notion でログインして参加
            </span>
          )}
        </Button>

        {!authed && (
          <p className="text-xs text-[#888888] text-center">
            Notion アカウントでログイン後、自動的に旅行に参加します
          </p>
        )}
      </div>
    </div>
  );
}
