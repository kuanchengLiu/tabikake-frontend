import { Avatar } from "@/components/ui/avatar";

interface SettlementCardProps {
  fromName: string;
  toName: string;
  amount: number;
}

export function SettlementCard({ fromName, toName, amount }: SettlementCardProps) {
  return (
    <div className="flex items-center gap-3 bg-[#1a1a1a] rounded-2xl p-4 border border-[#2e2e2e]">
      <Avatar name={fromName} size="md" />
      <div className="flex-1 flex flex-col">
        <span className="text-sm text-[#f0f0f0]">
          <span className="font-semibold">{fromName}</span>
          <span className="text-[#888888]"> → </span>
          <span className="font-semibold">{toName}</span>
        </span>
        <span className="text-xs text-[#888888] mt-0.5">支払い要</span>
      </div>
      <span className="text-base font-bold text-amber-500">
        ¥{amount.toLocaleString()}
      </span>
    </div>
  );
}
