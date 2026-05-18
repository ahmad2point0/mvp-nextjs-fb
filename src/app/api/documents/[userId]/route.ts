import { createServerSupabaseClient } from "@/global/lib/supabase-server";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
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

  const isSelf = user.id === userId;
  const isAdmin = profile?.role === "admin";
  const isDonor = profile?.role === "donor";

  // Donors may view a student's docs only when scoped to an aid request they can see.
  const aidRequestId = request.nextUrl.searchParams.get("aid_request_id");

  if (!isSelf && !isAdmin && !(isDonor && aidRequestId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let query = supabase
    .from("documents")
    .select(
      "id, document_type, storage_path, bucket, uploaded_at, verification_status, verification_notes, aid_request_id"
    )
    .eq("user_id", userId);

  if (aidRequestId) {
    query = query.eq("aid_request_id", aidRequestId);
  }

  const { data: docs, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const signed = await Promise.all(
    (docs ?? []).map(async (doc) => {
      const { data: sig } = await supabase.storage
        .from(doc.bucket)
        .createSignedUrl(doc.storage_path, 600);
      return {
        id: doc.id,
        document_type: doc.document_type,
        uploaded_at: doc.uploaded_at,
        verification_status: doc.verification_status,
        verification_notes: doc.verification_notes,
        aid_request_id: doc.aid_request_id,
        signed_url: sig?.signedUrl ?? null,
      };
    })
  );

  return NextResponse.json(signed);
}
