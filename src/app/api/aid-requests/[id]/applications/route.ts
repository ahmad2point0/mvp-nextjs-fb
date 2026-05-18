import { createServerSupabaseClient } from "@/global/lib/supabase-server";
import { createNotification, notifyAdmins } from "@/global/lib/create-notification";
import { NextResponse, type NextRequest } from "next/server";

const PAYMENT_METHODS = ["Online Payment via Bank", "Self Payment"] as const;

export async function GET(
  _request: NextRequest,
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const { data: request } = await supabase
    .from("aid_requests")
    .select("student_id, accepted_donor_id")
    .eq("id", id)
    .single();

  if (!request) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  const isAdmin = profile?.role === "admin";
  const isOwner = request.student_id === user.id;

  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("aid_request_applications")
    .select(
      "id, donor_id, status, payment_method, message, created_at, profiles:donor_id(full_name, email)"
    )
    .eq("aid_request_id", id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "donor") {
    return NextResponse.json(
      { error: "Only donors can apply for aid requests" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { payment_method, message } = body;

  if (
    !payment_method ||
    !PAYMENT_METHODS.includes(payment_method)
  ) {
    return NextResponse.json(
      {
        error: `payment_method must be one of ${PAYMENT_METHODS.join(", ")}`,
      },
      { status: 400 }
    );
  }

  // Ensure the request is still open
  const { data: aidRequest } = await supabase
    .from("aid_requests")
    .select("id, student_id, accepted_donor_id, status, documents_verified")
    .eq("id", id)
    .single();

  if (!aidRequest) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  if (aidRequest.accepted_donor_id) {
    return NextResponse.json(
      { error: "This request has already been accepted by another donor." },
      { status: 409 }
    );
  }

  const { data: application, error } = await supabase
    .from("aid_request_applications")
    .insert({
      aid_request_id: id,
      donor_id: user.id,
      payment_method,
      message: message ?? null,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "You have already applied to this request." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await createNotification(
    supabase,
    aidRequest.student_id,
    "Donor applied to your request",
    "A donor has expressed interest in funding your aid request.",
    "users"
  );
  await notifyAdmins(
    supabase,
    "New donor application",
    "A donor has applied to an aid request.",
    "users"
  );

  return NextResponse.json(application, { status: 201 });
}
