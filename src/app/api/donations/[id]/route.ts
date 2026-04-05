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

  // Only admin can update donation status
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

  if (!status || !["approved", "declined"].includes(status)) {
    return NextResponse.json(
      { error: "Status must be 'approved' or 'declined'" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("donations")
    .update({ status })
    .eq("id", id)
    .select("*, profiles!donations_donor_id_fkey(full_name)")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Notify the donor
  await createNotification(
    supabase,
    data.donor_id,
    `Donation ${status}`,
    status === "approved"
      ? `Your donation of Rs. ${Number(data.amount).toLocaleString()} has been approved. Thank you!`
      : `Your donation of Rs. ${Number(data.amount).toLocaleString()} has been declined.`,
    status === "approved" ? "check-circle" : "x-circle"
  );

  return NextResponse.json(data);
}
