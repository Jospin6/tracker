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
            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.42} />
            <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.04} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(214, 225, 255, 0.08)" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" stroke="var(--muted-foreground)" tick={{ fontSize: 12 }} />
        <YAxis stroke="var(--muted-foreground)" tick={{ fontSize: 12 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--surface-2)",
            borderColor: "rgba(214, 225, 255, 0.08)",
            borderRadius: "12px",
          }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke="var(--chart-1)"
          fill="url(#areaColor)"
          strokeWidth={2.2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
