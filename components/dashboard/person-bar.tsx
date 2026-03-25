interface PersonBarProps {
  name: string;
  amount: number;
  max: number;
}

export function PersonBar({ name, amount, max }: PersonBarProps) {
  const pct = max > 0 ? (amount / max) * 100 : 0;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-[#f0f0f0]">{name}</span>
        <span className="text-sm font-semibold text-amber-500">
          ¥{amount.toLocaleString()}
        </span>
      </div>
      <div className="h-2 bg-[#242424] rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
