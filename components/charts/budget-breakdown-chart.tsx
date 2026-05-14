"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatCurrency } from "@/lib/utils/format";

export function BudgetBreakdownChart({
  data,
}: {
  data: Array<{ name: string; value: number }>;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout="vertical"
        margin={{ left: 24, right: 12, top: 8, bottom: 0 }}
      >
        <CartesianGrid stroke="#27272a" strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" stroke="#71717a" tick={{ fontSize: 12 }} />
        <YAxis
          type="category"
          dataKey="name"
          stroke="#71717a"
          width={110}
          tick={{ fontSize: 12 }}
        />
        <Tooltip
          formatter={(value) => formatCurrency(Number(value ?? 0))}
          contentStyle={{
            backgroundColor: "#000000",
            borderColor: "rgba(255,255,255,0.08)",
            borderRadius: "12px",
          }}
        />
        <Bar dataKey="value" fill="#ffffff" radius={[0, 8, 8, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
