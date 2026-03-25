"use client";

interface SplitSelectorProps {
  mode: "equal" | "custom";
  onChange: (mode: "equal" | "custom") => void;
}

export function SplitSelector({ mode, onChange }: SplitSelectorProps) {
  return (
    <div className="flex bg-[#242424] rounded-2xl p-1 gap-1">
      {(["equal", "custom"] as const).map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95 ${
            mode === m
              ? "bg-amber-500 text-black"
              : "text-[#888888] hover:text-[#f0f0f0]"
          }`}
        >
          {m === "equal" ? "AA 割り" : "個別指定"}
        </button>
      ))}
    </div>
  );
}
