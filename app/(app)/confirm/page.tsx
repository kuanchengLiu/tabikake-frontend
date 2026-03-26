"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ParseResult } from "@/components/receipt/parse-result";
import { recordsApi, getErrorMessage } from "@/lib/api";
import type { ParsedReceipt } from "@/lib/types";
import { useAuth } from "@/lib/hooks/use-auth";
import { useTripStore } from "@/store/trip-store";

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

  const [parsed, setParsed] = useState<ParsedReceipt | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isManual) {
      // Manual mode: start with all-empty fields
      setParsed(EMPTY_RECEIPT);
      return;
    }
    // OCR mode: read from sessionStorage
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

  const handleConfirm = async (data: ParsedReceipt) => {
    setLoading(true);
    setError(null);
    try {
      await recordsApi.create({
        store_name_zh: data.store_name_zh,
        amount_jpy: data.amount_jpy,
        tax_jpy: data.tax_jpy,
        payment_method: data.payment_method,
        category: data.category,
        items: data.items,
        date: data.date,
        trip_id: tripId,
        paid_by: user?.id ?? "",
        split_with: [],
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

      <ParseResult data={parsed} onConfirm={handleConfirm} loading={loading} showRescan={!isManual} />

      {error && (
        <div className="mt-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-2xl">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
