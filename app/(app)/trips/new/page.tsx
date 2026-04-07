"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateTrip } from "@/lib/hooks/use-trips";
import { useTripStore } from "@/store/trip-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/api";

export default function NewTripPage() {
  const router = useRouter();
  const { mutateAsync: createTrip, isPending } = useCreateTrip();
  const { setCurrentTripId } = useTripStore();
  const today = new Date().toISOString().slice(0, 10);

  const [form, setForm] = useState({
    name: "",
    start_date: today,
    end_date: "",
    budget_jpy: "",
    budget_suica: "",
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError("旅行名を入力してください"); return; }
    setError(null);

    try {
      const trip = await createTrip({
        name: form.name.trim(),
        start_date: form.start_date,
        end_date: form.end_date,
        budget_jpy: form.budget_jpy ? Number(form.budget_jpy) : undefined,
        budget_suica: form.budget_suica ? Number(form.budget_suica) : undefined,
      });
      setCurrentTripId(trip.id);
      router.replace("/trips");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="flex flex-col px-5 pt-safe min-h-full">
      <div className="flex items-center gap-3 py-4">
        <button onClick={() => router.back()} className="text-[#888888] active:text-[#f0f0f0] p-1 -ml-1">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-[#f0f0f0]">新しい旅行</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 pb-6">
        <Input
          label="旅行名 *"
          placeholder="例：2026 日本旅行"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          disabled={isPending}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="開始日"
            type="date"
            value={form.start_date}
            onChange={(e) => setForm((p) => ({ ...p, start_date: e.target.value }))}
            disabled={isPending}
          />
          <Input
            label="終了日"
            type="date"
            value={form.end_date}
            onChange={(e) => setForm((p) => ({ ...p, end_date: e.target.value }))}
            disabled={isPending}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="予算 (JPY)"
            type="number"
            placeholder="150000"
            value={form.budget_jpy}
            onChange={(e) => setForm((p) => ({ ...p, budget_jpy: e.target.value }))}
            disabled={isPending}
          />
          <Input
            label="Suica 予算"
            type="number"
            placeholder="10000"
            value={form.budget_suica}
            onChange={(e) => setForm((p) => ({ ...p, budget_suica: e.target.value }))}
            disabled={isPending}
          />
        </div>

        <div className="flex gap-3 bg-[#1a1a1a] border border-[#2e2e2e] rounded-2xl p-4">
          <span className="text-xl flex-shrink-0">🔗</span>
          <p className="text-sm text-[#888888] leading-relaxed">
            送信後、Notion に旅行ページと記帳データベースが自動作成されます。
          </p>
        </div>

        {isPending && (
          <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl px-4 py-3">
            <svg className="animate-spin h-4 w-4 text-amber-500 flex-shrink-0" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-sm text-amber-500">Notion ページを作成中...</p>
          </div>
        )}

        {error && (
          <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-2xl">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <Button type="submit" variant="primary" size="lg" loading={isPending}>
          旅行を作成
        </Button>
      </form>
    </div>
  );
}
