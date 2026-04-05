import { Card } from "@/global/components";

interface StatsCardProps {
  title: string;
  value: string;
}

export function StatsCard({ title, value }: StatsCardProps) {
  return (
    <Card bordered className="text-center">
      <h3 className="text-primary text-sm font-normal">{title}</h3>
      <p className="text-heading text-2xl font-light tracking-tight mt-2">{value}</p>
    </Card>
  );
}
