import type { Record as ExpenseRecord } from "@/lib/types";
import { Avatar } from "@/components/ui/avatar";

const CATEGORY_ICONS: { [key: string]: string } = {
  餐飲: "🍜",
  交通: "🚃",
  購物: "🛍️",
  住宿: "🏨",
  其他: "📦",
};

interface RecordCardProps {
  record: ExpenseRecord;
}

export function RecordCard({ record }: RecordCardProps) {
  return (
    <div className="flex items-center gap-3 py-3 px-4 bg-[#1a1a1a] rounded-2xl border border-[#2e2e2e]">
      {/* Category icon */}
      <div className="w-10 h-10 rounded-xl bg-[#242424] flex items-center justify-center text-xl flex-shrink-0">
        {CATEGORY_ICONS[record.category] ?? "📦"}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#f0f0f0] truncate">
          {record.store}
        </p>
        <p className="text-xs text-[#888888] mt-0.5">
          {record.payment} · {record.category}
        </p>
      </div>

      {/* Amount & paid by */}
      <div className="flex flex-col items-end gap-1">
        <span className="text-sm font-bold text-[#f0f0f0]">
          ¥{record.amount_jpy.toLocaleString()}
        </span>
        <Avatar
          src={undefined}
          name={record.paid_by_name}
          size="sm"
        />
      </div>
    </div>
  );
}
