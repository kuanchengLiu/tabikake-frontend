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

  useEffect(() => {
    if (!code) {
      setInfoError("邀請連結缺少邀請碼");
      setInfoLoading(false);
      return;
    }

    fetch(`/api/join-info?code=${encodeURIComponent(code)}`)
      .then((r) =>
        r.ok ? r.json() : r.json().then((d) => Promise.reject(d.message || "讀取邀請失敗"))
      )
      .then((data: JoinInfo) => setInfo(data))
      .catch((err) => setInfoError(typeof err === "string" ? err : "找不到這個邀請"))
      .finally(() => setInfoLoading(false));
  }, [code]);

  useEffect(() => {
    fetch("/api/auth/status")
      .then((r) => r.json())
      .then(({ authenticated }: { authenticated: boolean }) => setAuthed(authenticated))
      .catch(() => setAuthed(false));
  }, []);

  useEffect(() => {
    if (!authed) return;
    const pending = localStorage.getItem("pending_join");
    if (!pending) return;

    try {
      const { invite_code } = JSON.parse(pending) as { invite_code: string };
      if (invite_code !== code) return;
      localStorage.removeItem("pending_join");
      setLoading(true);
      joinApi
        .join({ invite_code })
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
  }, [authed, code, router, setCurrentMemberID, setCurrentTripId]);

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
      <div className="flex min-h-dvh items-center justify-center bg-[#0f0f0f]">
        <svg className="h-6 w-6 animate-spin text-amber-500" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (infoError) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[#0f0f0f] px-6">
        <div className="rounded-2xl bg-red-500/10 px-4 py-3 text-center text-sm text-red-400">
          {infoError}
        </div>
        <button onClick={() => router.push("/login")} className="text-sm font-medium text-amber-500">
          回到登入頁
        </button>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-dvh flex-col bg-[#0f0f0f] px-6 pb-8"
      style={{ paddingTop: "env(safe-area-inset-top, 24px)" }}
    >
      <div className="flex flex-col items-center gap-2 py-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500 text-2xl font-bold text-black">
          旅
        </div>
        <h1 className="mt-2 text-xl font-bold text-[#f0f0f0]">加入旅行</h1>
        <p className="text-center text-sm text-[#888888]">
          你收到了一個 Tabikake 旅費紀錄邀請
        </p>
      </div>

      {info && (
        <section className="mb-6 flex flex-col gap-3 rounded-2xl border border-[#2e2e2e] bg-[#1a1a1a] p-4">
          <div>
            <p className="text-xs font-semibold uppercase text-[#888888]">旅行</p>
            <h2 className="mt-1 text-lg font-bold text-amber-500">{info.trip_name}</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-[#242424] px-3 py-2">
              <p className="text-xs text-[#888888]">主揪</p>
              <p className="mt-0.5 truncate font-semibold text-[#f0f0f0]">{info.owner_name}</p>
            </div>
            <div className="rounded-xl bg-[#242424] px-3 py-2">
              <p className="text-xs text-[#888888]">目前成員</p>
              <p className="mt-0.5 font-semibold text-[#f0f0f0]">{info.member_count} 人</p>
            </div>
          </div>
        </section>
      )}

      <div className="flex flex-col gap-4">
        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <Button variant="primary" size="lg" loading={loading} onClick={handleJoin}>
          {authed ? "加入這趟旅行" : "用 Notion 登入後加入"}
        </Button>

        {!authed && (
          <p className="px-2 text-center text-xs leading-5 text-[#888888]">
            登入完成後會自動回到這個邀請，並加入旅行。
          </p>
        )}
      </div>
    </div>
  );
}
