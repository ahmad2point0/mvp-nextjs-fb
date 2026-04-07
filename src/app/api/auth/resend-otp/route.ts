import { createServerSupabaseClient } from "@/global/lib/supabase-server";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
  });

  if (error) {
    const isRateLimit = error.message.toLowerCase().includes("rate limit");
    return NextResponse.json(
      { error: error.message },
      { status: isRateLimit ? 429 : 400 }
    );
  }

  return NextResponse.json({ ok: true });
}
