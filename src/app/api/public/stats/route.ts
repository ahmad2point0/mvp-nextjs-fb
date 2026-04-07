import { createServerSupabaseClient } from "@/global/lib/supabase-server";
import { NextResponse } from "next/server";

/**
 * Public homepage impact stats. Returns aggregated platform metrics
 * with no auth required. Cached for 60s on the edge.
 */
export async function GET() {
  const supabase = await createServerSupabaseClient();

  const [donations, students, volunteers, tasks] = await Promise.all([
    supabase
      .from("donations")
      .select("amount")
      .eq("status", "approved"),
    supabase
      .from("aid_requests")
      .select("student_id")
      .in("status", ["approved", "fulfilled"]),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "volunteer")
      .eq("is_blocked", false),
    supabase
      .from("volunteer_tasks")
      .select("id", { count: "exact", head: true })
      .eq("status", "completed"),
  ]);

  const totalDonations =
    donations.data?.reduce((sum, d) => sum + Number(d.amount || 0), 0) ?? 0;

  const studentsSupported = new Set(
    (students.data ?? []).map((r) => r.student_id).filter(Boolean)
  ).size;

  return NextResponse.json(
    {
      totalDonations,
      studentsSupported,
      activeVolunteers: volunteers.count ?? 0,
      tasksCompleted: tasks.count ?? 0,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    }
  );
}
