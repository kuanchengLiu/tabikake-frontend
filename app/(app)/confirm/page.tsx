"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ParseResult } from "@/components/receipt/parse-result";
import { recordsApi, getErrorMessage } from "@/lib/api";
import type { ParsedReceipt } from "@/lib/types";
import { useAuth } from "@/lib/hooks/use-auth";
import { useTripStore } from "@/store/trip-store";
import { useMembers } from "@/lib/hooks/use-members";
import { MemberAvatar } from "@/components/member/member-avatar";
import { MemberChip } from "@/components/member/member-chip";

const EMPTY_RECEIPT: ParsedReceipt = {
  store_name_jp: "",
  store_name_zh: "",
  amount_jpy: 0,
  tax_jpy: 0,
  payment_method: "現金",
  category: "其他",
  items: [],
  date: new Date().toISOString().slice(0, 10),
};

export default function ConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: user } = useAuth();
  const storeTripId = useTripStore((s) => s.currentTripId);

  const mode = searchParams.get("mode") ?? "ocr";
  const isManual = mode === "manual";
  const tripId =
    searchParams.get("trip_id") ??
    sessionStorage.getItem("current_trip_id") ??
    storeTripId ??
    "";

  const { data: members = [] } = useMembers(tripId || null);

  const [parsed, setParsed] = useState<ParsedReceipt | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // paid_by defaults to current user's member id (matched by user id), fallback first member
  const [paidByMemberId, setPaidByMemberId] = useState<string>("");
  const [splitMode, setSplitMode] = useState<"aa" | "custom">("aa");
  const [splitWith, setSplitWith] = useState<string[]>([]);

  // When members load, set defaults
  useEffect(() => {
    if (members.length === 0) return;
    if (!paidByMemberId) {
      setPaidByMemberId(members[0].id);
    }
    if (splitWith.length === 0) {
      setSplitWith(members.map((m) => m.id));
    }
  }, [members]); // eslint-disable-line react-hooks/exhaustive-deps

  // When split mode changes to AA, select all
  useEffect(() => {
    if (splitMode === "aa") {
      setSplitWith(members.map((m) => m.id));
    }
  }, [splitMode, members]);

  useEffect(() => {
    if (isManual) {
      setParsed(EMPTY_RECEIPT);
      return;
    }
    const stored = sessionStorage.getItem("parsed_receipt");
    if (!stored) {
      router.replace(`/upload${tripId ? `?trip_id=${tripId}` : ""}`);
      return;
    }
    try {
      setParsed(JSON.parse(stored) as ParsedReceipt);
    } catch {
      router.replace(`/upload${tripId ? `?trip_id=${tripId}` : ""}`);
    }
  }, [isManual, router, tripId]);

  const toggleSplitMember = (id: string) => {
    setSplitWith((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleConfirm = async (data: ParsedReceipt) => {
    setLoading(true);
    setError(null);
    const paidByMember = members.find((m) => m.id === paidByMemberId);
    try {
      await recordsApi.create({
        store: data.store_name_zh || data.store_name_jp,
        amount_jpy: data.amount_jpy,
        tax_jpy: data.tax_jpy,
        payment: data.payment_method,
        category: data.category,
        items: data.items,
        date: data.date,
        trip_id: tripId,
        paid_by: user?.id ?? "",
        paid_by_name: paidByMember?.name ?? user?.name ?? "",
        split_with: splitMode === "aa" ? members.map((m) => m.id) : splitWith,
      });
      sessionStorage.removeItem("parsed_receipt");
      sessionStorage.removeItem("current_trip_id");
      router.push(`/records?trip_id=${tripId}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (!parsed) {
    return (
      <div className="flex items-center justify-center h-full">
        <svg className="animate-spin h-6 w-6 text-amber-500" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full px-5 pb-6 pt-safe">
      {/* Header */}
      <div className="flex items-center gap-3 py-4">
        <button onClick={() => router.back()} className="text-[#888888] active:text-[#f0f0f0] p-1 -ml-1">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-[#f0f0f0]">
            {isManual ? "手動入力" : "内容を確認"}
          </h1>
          <p className="text-sm text-[#888888]">
            {isManual ? "支出の内容を入力してください" : "必要に応じて修正してください"}
          </p>
        </div>
        {!isManual && (
          <button
            onClick={() => router.back()}
            className="text-xs text-amber-500 font-medium active:opacity-70 flex-shrink-0"
          >
            再スキャン
          </button>
        )}
      </div>

      <ParseResult data={parsed} onConfirm={handleConfirm} loading={loading} showRescan={!isManual}>
        {/* Paid by selector */}
        {members.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-[#888888] uppercase tracking-wide">支払った人</span>
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              {members.map((member) => {
                const selected = member.id === paidByMemberId;
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => setPaidByMemberId(member.id)}
                    className={`flex flex-col items-center gap-1.5 px-3 py-2 rounded-2xl border transition-all active:scale-95 flex-shrink-0 ${
                      selected
                        ? "border-amber-500 bg-amber-500/10"
                        : "border-[#2e2e2e] bg-[#1a1a1a]"
                    }`}
                  >
                    <MemberAvatar member={member} size="md" />
                    <span className={`text-xs font-medium ${selected ? "text-amber-500" : "text-[#888888]"}`}>
                      {member.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Split with selector */}
        {members.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-[#888888] uppercase tracking-wide">割り勘</span>
            {/* Tab */}
            <div className="flex gap-1 bg-[#1a1a1a] rounded-xl p-1 border border-[#2e2e2e]">
              {(["aa", "custom"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setSplitMode(m)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    splitMode === m
                      ? "bg-amber-500 text-black"
                      : "text-[#888888]"
                  }`}
                >
                  {m === "aa" ? "AA（全員）" : "自選"}
                </button>
              ))}
            </div>
            {splitMode === "custom" && (
              <div className="flex flex-wrap gap-2">
                {members.map((member) => (
                  <MemberChip
                    key={member.id}
                    member={member}
                    selected={splitWith.includes(member.id)}
                    onToggle={() => toggleSplitMember(member.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </ParseResult>

      {error && (
        <div className="mt-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-2xl">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
