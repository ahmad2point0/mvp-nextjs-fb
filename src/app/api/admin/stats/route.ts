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

  const [users, donations, aidRequests, volunteers] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("donations").select("amount"),
    supabase
      .from("aid_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "volunteer"),
  ]);

  const totalDonations = donations.data?.reduce(
    (sum, d) => sum + (d.amount || 0),
    0
  );

  return NextResponse.json({
    totalUsers: users.count ?? 0,
    totalDonations: totalDonations ?? 0,
    pendingAidRequests: aidRequests.count ?? 0,
    activeVolunteers: volunteers.count ?? 0,
  });
}
