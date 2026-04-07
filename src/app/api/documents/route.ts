import { createServerSupabaseClient } from "@/global/lib/supabase-server";
import { NextResponse, type NextRequest } from "next/server";

const VALID_TYPES = ["cnic_front", "cnic_back", "student_doc"] as const;
const VALID_BUCKETS = ["cnic-documents", "student-documents"] as const;

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { document_type, storage_path, bucket } = body;

  if (!document_type || !storage_path || !bucket) {
    return NextResponse.json(
      { error: "document_type, storage_path, and bucket are required" },
      { status: 400 }
    );
  }

  if (!VALID_TYPES.includes(document_type)) {
    return NextResponse.json(
      { error: `document_type must be one of ${VALID_TYPES.join(", ")}` },
      { status: 400 }
    );
  }

  if (!VALID_BUCKETS.includes(bucket)) {
    return NextResponse.json(
      { error: `bucket must be one of ${VALID_BUCKETS.join(", ")}` },
      { status: 400 }
    );
  }

  // Enforce that storage_path lives under the caller's own folder
  if (!storage_path.startsWith(`${user.id}/`)) {
    return NextResponse.json(
      { error: "storage_path must live under your own user folder" },
      { status: 403 }
    );
  }

  // Upsert so re-uploading the same document type replaces the previous entry
  const { data, error } = await supabase
    .from("documents")
    .upsert(
      {
        user_id: user.id,
        document_type,
        storage_path,
        bucket,
      },
      { onConflict: "user_id,document_type" }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
