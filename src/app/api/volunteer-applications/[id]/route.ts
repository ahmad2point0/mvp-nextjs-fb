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

  // Only admin can update applications
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

  if (!status || !["approved", "rejected"].includes(status)) {
    return NextResponse.json(
      { error: "Status must be 'approved' or 'rejected'" },
      { status: 400 }
    );
  }

  // Update the application
  const { data, error } = await supabase
    .from("volunteer_applications")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // If approved, promote the user to the "volunteer" role
  if (status === "approved") {
    await supabase
      .from("profiles")
      .update({ role: "volunteer" })
      .eq("id", data.user_id);
  }

  // Notify the applicant
  await createNotification(
    supabase,
    data.user_id,
    status === "approved"
      ? "Volunteer application approved!"
      : "Volunteer application rejected",
    status === "approved"
      ? "Congratulations! You are now a volunteer. Log in again to access your volunteer dashboard."
      : "Your volunteer application has been reviewed and was not approved at this time.",
    status === "approved" ? "check-circle" : "x-circle"
  );

  return NextResponse.json(data);
}
