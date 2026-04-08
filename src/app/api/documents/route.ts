import { createServerSupabaseClient } from "@/global/lib/supabase-server";
import { NextResponse, type NextRequest } from "next/server";

const VALID_TYPES = ["cnic_front", "cnic_back", "student_doc"] as const;
const VALID_BUCKETS = ["cnic-documents", "student-documents"] as const;
const ACCEPTED_MIME = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

type DocType = (typeof VALID_TYPES)[number];
type Bucket = (typeof VALID_BUCKETS)[number];

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json(
      { error: "Content-Type must be multipart/form-data" },
      { status: 400 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid form data" },
      { status: 400 }
    );
  }

  const file = formData.get("file");
  const document_type = formData.get("document_type");
  const bucket = formData.get("bucket");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "file is required" },
      { status: 400 }
    );
  }

  if (typeof document_type !== "string" || typeof bucket !== "string") {
    return NextResponse.json(
      { error: "document_type and bucket are required" },
      { status: 400 }
    );
  }

  if (!VALID_TYPES.includes(document_type as DocType)) {
    return NextResponse.json(
      { error: `document_type must be one of ${VALID_TYPES.join(", ")}` },
      { status: 400 }
    );
  }

  if (!VALID_BUCKETS.includes(bucket as Bucket)) {
    return NextResponse.json(
      { error: `bucket must be one of ${VALID_BUCKETS.join(", ")}` },
      { status: 400 }
    );
  }

  if (!ACCEPTED_MIME.includes(file.type)) {
    return NextResponse.json(
      { error: "Only JPEG, PNG, or WebP images are allowed" },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File must be 5MB or smaller" },
      { status: 400 }
    );
  }

  // Build a deterministic-ish path under the user's own folder
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storage_path = `${user.id}/${document_type}_${timestamp}_${safeName}`;

  // Upload to Supabase Storage server-side
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(storage_path, file, {
      upsert: true,
      contentType: file.type,
    });

  if (uploadError) {
    return NextResponse.json(
      { error: `Storage upload failed: ${uploadError.message}` },
      { status: 500 }
    );
  }

  // Upsert metadata so re-uploading the same document type replaces the previous entry
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
    // Best-effort cleanup of the just-uploaded object so we don't orphan it
    await supabase.storage.from(bucket).remove([storage_path]);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Generate a short-lived signed URL the client can use immediately
  const { data: signed } = await supabase.storage
    .from(bucket)
    .createSignedUrl(storage_path, 600);

  return NextResponse.json(
    {
      ...data,
      signed_url: signed?.signedUrl ?? null,
    },
    { status: 201 }
  );
}
