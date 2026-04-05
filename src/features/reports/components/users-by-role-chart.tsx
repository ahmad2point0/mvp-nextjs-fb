"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Props {
  data: { role: string; count: number }[];
}

export function UsersByRoleChart({ data }: Props) {
  return (
    <div>
      <h4 className="text-heading text-sm font-normal mb-3">
        Users by Role
      </h4>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="role" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#533afd" radius={[4, 4, 0, 0]} name="Users" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
