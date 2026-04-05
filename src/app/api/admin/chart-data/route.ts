import { createServerSupabaseClient } from "@/global/lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Fetch all data and aggregate in JS
  const [donations, aidRequests, profiles] = await Promise.all([
    supabase
      .from("donations")
      .select("amount, created_at")
      .order("created_at", { ascending: true }),
    supabase.from("aid_requests").select("status"),
    supabase.from("profiles").select("role"),
  ]);

  // Donations by month (last 6 months)
  const now = new Date();
  const months: { month: string; amount: number; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    const matching = donations.data?.filter((don) => {
      const created = new Date(don.created_at);
      return (
        created.getFullYear() === d.getFullYear() &&
        created.getMonth() === d.getMonth()
      );
    });
    months.push({
      month: label,
      amount: matching?.reduce((sum, don) => sum + Number(don.amount || 0), 0) ?? 0,
      count: matching?.length ?? 0,
    });
  }

  // Aid requests by status
  const aidCounts: Record<string, number> = {};
  aidRequests.data?.forEach((r) => {
    aidCounts[r.status] = (aidCounts[r.status] || 0) + 1;
  });
  const aidByStatus = Object.entries(aidCounts).map(([status, count]) => ({
    status,
    count,
  }));

  // Users by role
  const roleCounts: Record<string, number> = {};
  profiles.data?.forEach((r) => {
    roleCounts[r.role] = (roleCounts[r.role] || 0) + 1;
  });
  const usersByRole = Object.entries(roleCounts).map(([role, count]) => ({
    role,
    count,
  }));

  return NextResponse.json({
    donationsByMonth: months,
    aidByStatus,
    usersByRole,
  });
}
