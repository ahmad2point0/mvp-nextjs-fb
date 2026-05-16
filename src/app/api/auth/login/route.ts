import { createServerSupabaseClient } from "@/global/lib/supabase-server";
import { withRateLimitRetry } from "@/global/lib/supabase-retry";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  const supabase = await createServerSupabaseClient();

  const { data, error } = await withRateLimitRetry(() =>
    supabase.auth.signInWithPassword({ email, password })
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

  // Email not yet verified → route user to OTP screen
  if (!data.user?.email_confirmed_at) {
    return NextResponse.json(
      {
        error: "Please verify your email address to continue.",
        code: "unverified",
        email: data.user?.email,
      },
      { status: 401 }
    );
  }

  // Check if the user is blocked
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_blocked")
    .eq("id", data.user.id)
    .single();

  if (profile?.is_blocked) {
    await supabase.auth.signOut();
    return NextResponse.json(
      {
        error: "Your account has been blocked. Please contact support.",
        code: "blocked",
      },
      { status: 403 }
    );
  }

  return NextResponse.json({
    user: data.user,
    session: data.session,
  });
}
