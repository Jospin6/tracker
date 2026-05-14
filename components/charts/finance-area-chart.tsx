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
            <stop offset="0%" stopColor="#ffffff" stopOpacity={0.45} />
            <stop offset="100%" stopColor="#ffffff" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" stroke="#71717a" tick={{ fontSize: 12 }} />
        <YAxis stroke="#71717a" tick={{ fontSize: 12 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#111214",
            borderColor: "rgba(255,255,255,0.08)",
            borderRadius: "12px",
          }}
        />
        <Area type="monotone" dataKey="value" stroke="#ffffff" fill="url(#areaColor)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
