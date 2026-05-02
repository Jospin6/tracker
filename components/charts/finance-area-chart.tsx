"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface FinanceAreaChartProps {
  data: Array<{ name: string; value: number }>;
}

export function FinanceAreaChart({ data }: FinanceAreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="areaColor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.2} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#334155" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} />
        <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
        <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155" }} />
        <Area type="monotone" dataKey="value" stroke="#60a5fa" fill="url(#areaColor)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
