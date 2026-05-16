import { createServerSupabaseClient } from "@/global/lib/supabase-server";
import { withRateLimitRetry } from "@/global/lib/supabase-retry";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const { email, token } = await request.json();

  if (!email || !token) {
    return NextResponse.json(
      { error: "Email and token are required" },
      { status: 400 }
    );
  }

  const supabase = await createServerSupabaseClient();

  const { data, error } = await withRateLimitRetry(() =>
    supabase.auth.verifyOtp({ email, token, type: "signup" })
  );

  if (error) {
    const msg = (error.message || "").toLowerCase();
    const isRateLimit =
      msg.includes("rate limit") ||
      msg.includes("too many") ||
      msg.includes("for security purposes");
    if (isRateLimit) {
      return NextResponse.json(
        {
          error: "Please wait a moment and try again.",
          code: "rate_limited",
        },
        { status: 429 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  return NextResponse.json({
    user: data.user,
    session: data.session,
  });
}
