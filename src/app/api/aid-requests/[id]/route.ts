import { createServerSupabaseClient } from "@/global/lib/supabase-server";
import { createNotification } from "@/global/lib/create-notification";
import { NextResponse, type NextRequest } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only admin can update aid request status
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { status } = body;

  const validStatuses = ["approved", "rejected", "fulfilled"];
  if (!status || !validStatuses.includes(status)) {
    return NextResponse.json(
      { error: `Status must be one of: ${validStatuses.join(", ")}` },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("aid_requests")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Notify the student
  const messages: Record<string, string> = {
    approved: `Your aid request for Rs. ${Number(data.amount).toLocaleString()} has been approved.`,
    rejected: `Your aid request for Rs. ${Number(data.amount).toLocaleString()} has been rejected.`,
    fulfilled: `Your aid request for Rs. ${Number(data.amount).toLocaleString()} has been fulfilled!`,
  };

  const icons: Record<string, string> = {
    approved: "check-circle",
    rejected: "x-circle",
    fulfilled: "gift",
  };

  await createNotification(
    supabase,
    data.student_id,
    `Aid request ${status}`,
    messages[status],
    icons[status]
  );

  return NextResponse.json(data);
}
