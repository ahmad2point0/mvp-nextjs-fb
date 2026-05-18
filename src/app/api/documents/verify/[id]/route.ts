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

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { verification_status, verification_notes } = body;

  if (
    verification_status !== "approved" &&
    verification_status !== "rejected"
  ) {
    return NextResponse.json(
      { error: "verification_status must be 'approved' or 'rejected'" },
      { status: 400 }
    );
  }

  const { data: doc, error } = await supabase
    .from("documents")
    .update({
      verification_status,
      verification_notes: verification_notes ?? null,
      verified_by: user.id,
      verified_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("id, user_id, aid_request_id, verification_status")
    .single();

  if (error || !doc) {
    return NextResponse.json(
      { error: error?.message ?? "Document not found" },
      { status: 500 }
    );
  }

  /* If all docs on an aid request are approved, flip documents_verified on the request. */
  if (doc.aid_request_id) {
    const { data: docs } = await supabase
      .from("documents")
      .select("verification_status")
      .eq("aid_request_id", doc.aid_request_id);

    const allApproved =
      Array.isArray(docs) &&
      docs.length > 0 &&
      docs.every((d) => d.verification_status === "approved");

    if (allApproved) {
      await supabase
        .from("aid_requests")
        .update({ documents_verified: true })
        .eq("id", doc.aid_request_id);
    } else {
      await supabase
        .from("aid_requests")
        .update({ documents_verified: false })
        .eq("id", doc.aid_request_id);
    }
  }

  await createNotification(
    supabase,
    doc.user_id,
    `Document ${verification_status}`,
    verification_status === "approved"
      ? "An admin approved one of your supporting documents."
      : `An admin rejected one of your documents${
          verification_notes ? `: ${verification_notes}` : "."
        }`,
    verification_status === "approved" ? "check-circle" : "x-circle"
  );

  return NextResponse.json(doc);
}
