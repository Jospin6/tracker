"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatCurrency } from "@/lib/utils/format";

export function BudgetEvolutionChart({
  data,
}: {
  data: Array<{ expense: number; income: number; name: string; net: number }>;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ left: 0, right: 12, top: 8, bottom: 0 }}>
        <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" stroke="#71717a" tick={{ fontSize: 12 }} />
        <YAxis stroke="#71717a" tick={{ fontSize: 12 }} />
        <Tooltip
          formatter={(value) => formatCurrency(Number(value ?? 0))}
          contentStyle={{
            backgroundColor: "#000000",
            borderColor: "rgba(255,255,255,0.08)",
            borderRadius: "12px",
          }}
        />
        <Legend wrapperStyle={{ color: "#a1a1aa", fontSize: 12 }} />
        <Line
          type="monotone"
          dataKey="income"
          name="Revenus"
          stroke="#ffffff"
          strokeWidth={2.4}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="expense"
          name="Sorties"
          stroke="#a1a1aa"
          strokeWidth={2.1}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="net"
          name="Net"
          stroke="#52525b"
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
