"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS: Record<string, string> = {
  pending: "#facc15",
  approved: "#22c55e",
  rejected: "#ea2261",
  fulfilled: "#533afd",
};

interface Props {
  data: { status: string; count: number }[];
}

export function AidStatusChart({ data }: Props) {
  return (
    <div>
      <h4 className="text-heading text-sm font-normal mb-3">
        Aid Requests by Status
      </h4>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="status"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={({ name }) => name}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.status}
                  fill={COLORS[entry.status] || "#94a3b8"}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
