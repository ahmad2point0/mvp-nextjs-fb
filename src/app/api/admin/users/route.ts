import { createServerSupabaseClient } from "@/global/lib/supabase-server";
import { NextResponse, type NextRequest } from "next/server";

async function requireAdmin(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") return null;

  return user;
}

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const admin = await requireAdmin(supabase);

  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const role = request.nextUrl.searchParams.get("role");
  const verifiedParam = request.nextUrl.searchParams.get("verified");
  const blockedParam = request.nextUrl.searchParams.get("blocked");

  const verified =
    verifiedParam === null ? null : verifiedParam === "true";
  const blocked = blockedParam === null ? null : blockedParam === "true";

  const { data, error } = await supabase.rpc("admin_get_users", {
    p_role: role,
    p_verified: verified,
    p_blocked: blocked,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
