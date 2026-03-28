"use client";

const COLORS = [
  "#F59E0B", "#3B82F6", "#10B981", "#EF4444",
  "#8B5CF6", "#EC4899", "#F97316", "#06B6D4",
];

export const DEFAULT_COLOR = COLORS[0];

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="flex gap-3 flex-wrap">
      {COLORS.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          className="w-8 h-8 rounded-full transition-all active:scale-90 flex-shrink-0"
          style={{
            backgroundColor: color,
            boxShadow: value === color ? `0 0 0 2px #1a1a1a, 0 0 0 4px ${color}` : "none",
          }}
        />
      ))}
    </div>
  );
}
