import { createServerSupabaseClient } from "@/global/lib/supabase-server";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(
  _request: NextRequest,
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

  // Allow self or admin
  if (user.id !== userId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const { data: docs, error } = await supabase
    .from("documents")
    .select("id, document_type, storage_path, bucket, uploaded_at")
    .eq("user_id", userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Generate a signed URL for each document (10 min expiry)
  const signed = await Promise.all(
    (docs ?? []).map(async (doc) => {
      const { data: sig } = await supabase.storage
        .from(doc.bucket)
        .createSignedUrl(doc.storage_path, 600);
      return {
        id: doc.id,
        document_type: doc.document_type,
        uploaded_at: doc.uploaded_at,
        signed_url: sig?.signedUrl ?? null,
      };
    })
  );

  return NextResponse.json(signed);
}
