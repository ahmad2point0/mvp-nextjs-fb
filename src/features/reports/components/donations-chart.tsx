"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Props {
  data: { month: string; amount: number; count: number }[];
}

export function DonationsChart({ data }: Props) {
  return (
    <div>
      <h4 className="text-heading text-sm font-normal mb-3">
        Donations Over Time
      </h4>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#533afd"
              fill="#533afd"
              fillOpacity={0.15}
              name="Amount (Rs)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
