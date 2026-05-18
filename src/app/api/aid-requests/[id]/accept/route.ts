import { createServerSupabaseClient } from "@/global/lib/supabase-server";
import { createNotification, notifyAdmins } from "@/global/lib/create-notification";
import { NextResponse, type NextRequest } from "next/server";

const PAYMENT_METHODS = ["Online Payment via Bank", "Self Payment"] as const;

/**
 * POST /api/aid-requests/[id]/accept
 *
 * Atomic donor lock: the first donor to call this wins. Uses the
 * `accept_aid_request` SQL function which performs the lock via
 * `UPDATE ... WHERE accepted_donor_id IS NULL` — preventing the race
 * where two donors accept the same broadcast at the same moment.
 */
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
      { error: "Only donors can accept aid requests" },
      { status: 403 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const payment_method = body?.payment_method;

  if (!payment_method || !PAYMENT_METHODS.includes(payment_method)) {
    return NextResponse.json(
      { error: `payment_method must be one of ${PAYMENT_METHODS.join(", ")}` },
      { status: 400 }
    );
  }

  /* Make sure the donor has an application row first — accept() flips it
     to 'accepted' and rejects all others. */
  await supabase
    .from("aid_request_applications")
    .upsert(
      {
        aid_request_id: id,
        donor_id: user.id,
        payment_method,
        status: "pending",
      },
      { onConflict: "aid_request_id,donor_id", ignoreDuplicates: false }
    );

  const { data: locked, error: lockErr } = await supabase.rpc(
    "accept_aid_request",
    { p_request_id: id, p_donor_id: user.id }
  );

  if (lockErr) {
    return NextResponse.json({ error: lockErr.message }, { status: 500 });
  }

  if (locked !== true) {
    return NextResponse.json(
      {
        error:
          "This request has already been accepted by another donor.",
      },
      { status: 409 }
    );
  }

  const { data: aidRequest } = await supabase
    .from("aid_requests")
    .select("id, student_id, category, aid_type")
    .eq("id", id)
    .single();

  if (aidRequest?.student_id) {
    await createNotification(
      supabase,
      aidRequest.student_id,
      "Your aid request was accepted",
      "A donor has accepted your request and will fulfill it shortly.",
      "check-circle"
    );
  }

  await notifyAdmins(
    supabase,
    "Aid request accepted",
    `A donor has accepted an aid request${
      aidRequest?.category ? ` (${aidRequest.category})` : ""
    }.`,
    "check-circle"
  );

  return NextResponse.json({ ok: true });
}
