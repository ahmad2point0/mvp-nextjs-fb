import { createServerSupabaseClient } from "@/global/lib/supabase-server";
import { withRateLimitRetry } from "@/global/lib/supabase-retry";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();

  const { error } = await withRateLimitRetry(() =>
    supabase.auth.resend({ type: "signup", email })
  );

  if (error) {
    const msg = (error.message || "").toLowerCase();
    const isRateLimit =
      msg.includes("rate limit") ||
      msg.includes("too many") ||
      msg.includes("for security purposes");
    if (isRateLimit) {
      return NextResponse.json(
        { error: "Please wait a moment and try again.", code: "rate_limited" },
        { status: 429 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
