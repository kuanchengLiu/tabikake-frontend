"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ParseResult } from "@/components/receipt/parse-result";
import { recordsApi, getErrorMessage } from "@/lib/api";
import type { ParsedReceipt, Record as ExpenseRecord } from "@/lib/types";
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
  const { currentTripId: storeTripId, currentMemberID } = useTripStore();

  const mode = searchParams.get("mode") ?? "ocr";
  const isManual = mode === "manual";
  const isEdit = mode === "edit";
  const recordId = searchParams.get("record_id") ?? "";

  const tripId =
    searchParams.get("trip_id") ??
    (typeof sessionStorage !== "undefined" ? sessionStorage.getItem("current_trip_id") : null) ??
    storeTripId ??
    "";

  const { data: members = [] } = useMembers(tripId || null);

  const [parsed, setParsed] = useState<ParsedReceipt | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paidByMemberId, setPaidByMemberId] = useState<string>("");
  const [splitMode, setSplitMode] = useState<"aa" | "custom">("aa");
  const [splitWith, setSplitWith] = useState<string[]>([]);

  // Set defaults when members load
  useEffect(() => {
    if (members.length === 0) return;
    if (!paidByMemberId) {
      setPaidByMemberId(currentMemberID ?? members[0].id);
    }
    if (splitWith.length === 0) {
      setSplitWith(members.map((m) => m.id));
    }
  }, [members]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (splitMode === "aa") setSplitWith(members.map((m) => m.id));
  }, [splitMode, members]);

  useEffect(() => {
    if (isEdit) {
      const stored = sessionStorage.getItem("editing_record");
      if (!stored) { router.replace(`/records${tripId ? `?trip_id=${tripId}` : ""}`); return; }
      try {
        const rec = JSON.parse(stored) as ExpenseRecord;
        setParsed({
          store_name_jp: "",
          store_name_zh: rec.store,
          amount_jpy: rec.amount_jpy,
          tax_jpy: rec.tax_jpy ?? 0,
          payment_method: rec.payment as ParsedReceipt["payment_method"],
          category: rec.category as ParsedReceipt["category"],
          items: rec.items.map((i) => ({ name_jp: i.name_jp ?? "", name_zh: i.name_zh, price: i.price })),
          date: rec.date.slice(0, 10),
        });
        if (rec.paid_by_member_id) setPaidByMemberId(rec.paid_by_member_id);
        if (rec.split_with?.length > 0) {
          setSplitWith(rec.split_with);
          setSplitMode("custom");
        }
      } catch {
        router.replace(`/records${tripId ? `?trip_id=${tripId}` : ""}`);
      }
      return;
    }
    if (isManual) { setParsed(EMPTY_RECEIPT); return; }
    const stored = sessionStorage.getItem("parsed_receipt");
    if (!stored) { router.replace(`/upload${tripId ? `?trip_id=${tripId}` : ""}`); return; }
    try {
      setParsed(JSON.parse(stored) as ParsedReceipt);
    } catch {
      router.replace(`/upload${tripId ? `?trip_id=${tripId}` : ""}`);
    }
  }, [isManual, isEdit, router, tripId]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleSplitMember = (id: string) => {
    setSplitWith((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleConfirm = async (data: ParsedReceipt) => {
    setLoading(true);
    setError(null);
    const finalSplitWith = splitMode === "aa" ? members.map((m) => m.id) : splitWith;
    try {
      if (isEdit && recordId) {
        await recordsApi.update(recordId, {
          store: data.store_name_zh || data.store_name_jp,
          amount_jpy: data.amount_jpy,
          tax_jpy: data.tax_jpy,
          payment: data.payment_method,
          category: data.category,
          items: data.items,
          date: data.date,
          paid_by_member_id: paidByMemberId,
          split_with: finalSplitWith,
        });
        sessionStorage.removeItem("editing_record");
      } else {
        await recordsApi.create({
          store: data.store_name_zh || data.store_name_jp,
          amount_jpy: data.amount_jpy,
          tax_jpy: data.tax_jpy,
          payment: data.payment_method,
          category: data.category,
          items: data.items,
          date: data.date,
          trip_id: tripId,
          paid_by_member_id: paidByMemberId || (currentMemberID ?? ""),
          split_with: finalSplitWith,
        });
        sessionStorage.removeItem("parsed_receipt");
        sessionStorage.removeItem("current_trip_id");
      }
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
      <div className="flex items-center gap-3 py-4">
        <button onClick={() => router.back()} className="text-[#888888] active:text-[#f0f0f0] p-1 -ml-1">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-[#f0f0f0]">
            {isEdit ? "記録を編集" : isManual ? "手動入力" : "内容を確認"}
          </h1>
          <p className="text-sm text-[#888888]">
            {isEdit ? "内容を修正してください" : isManual ? "支出の内容を入力してください" : "必要に応じて修正してください"}
          </p>
        </div>
        {!isManual && !isEdit && (
          <button onClick={() => router.back()} className="text-xs text-amber-500 font-medium active:opacity-70 flex-shrink-0">
            再スキャン
          </button>
        )}
      </div>

      <ParseResult data={parsed} onConfirm={handleConfirm} loading={loading}>
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
                      selected ? "border-amber-500 bg-amber-500/10" : "border-[#2e2e2e] bg-[#1a1a1a]"
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

        {members.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-[#888888] uppercase tracking-wide">割り勘</span>
            <div className="flex gap-1 bg-[#1a1a1a] rounded-xl p-1 border border-[#2e2e2e]">
              {(["aa", "custom"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setSplitMode(m)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    splitMode === m ? "bg-amber-500 text-black" : "text-[#888888]"
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
