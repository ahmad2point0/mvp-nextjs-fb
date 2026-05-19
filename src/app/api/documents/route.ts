import { createServerSupabaseClient } from "@/global/lib/supabase-server";
import { NextResponse, type NextRequest } from "next/server";

const VALID_TYPES = ["cnic_front", "cnic_back", "student_doc"] as const;
const VALID_BUCKETS = ["cnic-documents", "student-documents"] as const;
const ACCEPTED_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];
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
  const aid_request_id = formData.get("aid_request_id");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
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
      { error: "Only JPEG, PNG, WebP, or PDF files are allowed" },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File must be 5MB or smaller" },
      { status: 400 }
    );
  }

  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storage_path = `${user.id}/${document_type}_${timestamp}_${safeName}`;

  /* CNIC slots are 1-per-type (partial unique). A re-upload should REPLACE
     the previous row + file, not collide. For student_doc we insert freely
     so multiple supporting docs can accompany aid requests. */
  const isCnic =
    document_type === "cnic_front" || document_type === "cnic_back";

  if (isCnic) {
    const { data: prior } = await supabase
      .from("documents")
      .select("id, storage_path, bucket")
      .eq("user_id", user.id)
      .eq("document_type", document_type);

    if (prior && prior.length > 0) {
      const pathsByBucket = new Map<string, string[]>();
      for (const row of prior) {
        const list = pathsByBucket.get(row.bucket) ?? [];
        list.push(row.storage_path);
        pathsByBucket.set(row.bucket, list);
      }
      await Promise.all(
        Array.from(pathsByBucket.entries()).map(([b, paths]) =>
          supabase.storage.from(b).remove(paths)
        )
      );
      await supabase
        .from("documents")
        .delete()
        .in(
          "id",
          prior.map((r) => r.id)
        );
    }
  }

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

  const insertRow: Record<string, unknown> = {
    user_id: user.id,
    document_type,
    storage_path,
    bucket,
  };
  if (typeof aid_request_id === "string" && aid_request_id.length > 0) {
    insertRow.aid_request_id = aid_request_id;
  }

  const { data, error } = await supabase
    .from("documents")
    .insert(insertRow)
    .select()
    .single();

  if (error) {
    await supabase.storage.from(bucket).remove([storage_path]);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

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
