import { createServerSupabaseClient } from "@/global/lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, full_name, phone, is_blocked, created_at")
    .eq("id", user.id)
    .single();

  return NextResponse.json({
    id: user.id,
    email: user.email,
    is_verified: !!user.email_confirmed_at,
    ...profile,
  });
}
