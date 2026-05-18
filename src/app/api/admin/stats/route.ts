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

  /* App-count based stats — no PKR sums anywhere in admin views. */
  const [users, donations, aidRequests, volunteers, applications] =
    await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase
        .from("donations")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("aid_requests")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "volunteer"),
      supabase
        .from("aid_request_applications")
        .select("id", { count: "exact", head: true }),
    ]);

  return NextResponse.json({
    totalUsers: users.count ?? 0,
    totalDonations: donations.count ?? 0,
    pendingAidRequests: aidRequests.count ?? 0,
    activeVolunteers: volunteers.count ?? 0,
    totalApplications: applications.count ?? 0,
  });
}
