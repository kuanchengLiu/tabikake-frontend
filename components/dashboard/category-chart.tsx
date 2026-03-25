"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = [
  "#F59E0B",
  "#3B82F6",
  "#10B981",
  "#8B5CF6",
  "#EF4444",
  "#F97316",
];

interface CategoryChartProps {
  data: { category: string; amount: number }[];
}

export function CategoryChart({ data }: CategoryChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-[#888888] text-sm">
        データなし
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            dataKey="amount"
            nameKey="category"
            paddingAngle={3}
          >
            {data.map((_, idx) => (
              <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "#1a1a1a",
              border: "1px solid #2e2e2e",
              borderRadius: 12,
              color: "#f0f0f0",
              fontSize: 12,
            }}
            formatter={(value) => [
              `¥${Number(value).toLocaleString()}`,
              "金額",
            ]}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2">
        {data.map((item, idx) => (
          <div key={item.category} className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ background: COLORS[idx % COLORS.length] }}
            />
            <span className="text-xs text-[#888888] truncate">
              {item.category}
            </span>
            <span className="text-xs text-[#f0f0f0] ml-auto font-medium">
              ¥{item.amount.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
