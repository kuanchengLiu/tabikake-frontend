interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
}

export function StatCard({ label, value, sub }: StatCardProps) {
  return (
    <div className="bg-[#1a1a1a] rounded-2xl p-4 border border-[#2e2e2e] flex flex-col gap-1">
      <span className="text-xs text-[#888888] font-medium uppercase tracking-wide">
        {label}
      </span>
      <span className="text-2xl font-bold text-[#f0f0f0]">{value}</span>
      {sub && <span className="text-xs text-[#888888]">{sub}</span>}
    </div>
  );
}
