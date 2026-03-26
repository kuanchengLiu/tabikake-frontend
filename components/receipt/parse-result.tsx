"use client";

import { useState } from "react";
import type { ParsedReceipt } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const CATEGORY_OPTIONS = [
  { value: "餐飲", label: "🍜 餐飲" },
  { value: "交通", label: "🚃 交通" },
  { value: "購物", label: "🛍️ 購物" },
  { value: "住宿", label: "🏨 住宿" },
  { value: "其他", label: "📦 其他" },
];

const PAYMENT_OPTIONS = [
  { value: "現金", label: "💴 現金" },
  { value: "Suica", label: "🚇 Suica" },
  { value: "PayPay", label: "📱 PayPay" },
  { value: "信用卡", label: "💳 信用卡" },
];

interface ParseResultProps {
  data: ParsedReceipt;
  onConfirm: (data: ParsedReceipt) => void;
  loading?: boolean;
  showRescan?: boolean;
}

export function ParseResult({ data, onConfirm, loading = false, showRescan = true }: ParseResultProps) {
  const [form, setForm] = useState<ParsedReceipt>(data);

  const updateField = <K extends keyof ParsedReceipt>(
    key: K,
    value: ParsedReceipt[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateItem = (
    idx: number,
    field: "name_jp" | "name_zh" | "price",
    value: string | number
  ) => {
    setForm((prev) => {
      const items = [...prev.items];
      items[idx] = { ...items[idx], [field]: value };
      return { ...prev, items };
    });
  };

  const addItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { name_jp: "", name_zh: "", price: 0 }],
    }));
  };

  const removeItem = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx),
    }));
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Store name */}
      <div className="flex flex-col gap-3">
        <Input
          label="店名 (中文)"
          value={form.store_name_zh}
          onChange={(e) => updateField("store_name_zh", e.target.value)}
        />
        <Input
          label="店名 (日本語)"
          value={form.store_name_jp}
          onChange={(e) => updateField("store_name_jp", e.target.value)}
        />
      </div>

      {/* Amount & Tax */}
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="金額 (¥)"
          type="number"
          inputMode="numeric"
          value={form.amount_jpy}
          onChange={(e) =>
            updateField("amount_jpy", parseInt(e.target.value) || 0)
          }
        />
        <Input
          label="消費税 (¥)"
          type="number"
          inputMode="numeric"
          value={form.tax_jpy}
          onChange={(e) =>
            updateField("tax_jpy", parseInt(e.target.value) || 0)
          }
        />
      </div>

      {/* Category & Payment */}
      <div className="grid grid-cols-2 gap-3">
        <Select
          label="カテゴリ"
          value={form.category}
          options={CATEGORY_OPTIONS}
          onChange={(e) =>
            updateField("category", e.target.value as ParsedReceipt["category"])
          }
        />
        <Select
          label="支払方法"
          value={form.payment_method}
          options={PAYMENT_OPTIONS}
          onChange={(e) =>
            updateField(
              "payment_method",
              e.target.value as ParsedReceipt["payment_method"]
            )
          }
        />
      </div>

      {/* Date */}
      <Input
        label="日付"
        type="date"
        value={form.date}
        onChange={(e) => updateField("date", e.target.value)}
      />

      {/* Items */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-[#888888] uppercase tracking-wide">
            明細
          </span>
          <button
            type="button"
            onClick={addItem}
            className="text-amber-500 text-sm font-medium active:opacity-70"
          >
            + 追加
          </button>
        </div>

        {form.items.length === 0 ? (
          <p className="text-sm text-[#888888] py-2">明細なし</p>
        ) : (
          <div className="flex flex-col gap-2">
            {form.items.map((item, idx) => (
              <div
                key={idx}
                className="flex gap-2 items-center bg-[#1a1a1a] rounded-xl p-3 border border-[#2e2e2e]"
              >
                <div className="flex-1 flex flex-col gap-1.5">
                  <input
                    type="text"
                    value={item.name_zh}
                    onChange={(e) => updateItem(idx, "name_zh", e.target.value)}
                    placeholder="商品名 (中文)"
                    className="bg-transparent text-sm text-[#f0f0f0] outline-none placeholder:text-[#888888]"
                  />
                  <input
                    type="number"
                    inputMode="numeric"
                    value={item.price}
                    onChange={(e) =>
                      updateItem(idx, "price", parseInt(e.target.value) || 0)
                    }
                    placeholder="価格"
                    className="bg-transparent text-sm text-amber-500 outline-none placeholder:text-[#888888] w-24"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="text-[#888888] active:text-red-400 p-1"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirm button */}
      <Button
        variant="primary"
        size="lg"
        loading={loading}
        onClick={() => onConfirm(form)}
      >
        記録を保存
      </Button>
    </div>
  );
}
