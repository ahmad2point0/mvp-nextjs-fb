import { createServerSupabaseClient } from "@/global/lib/supabase-server";
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

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
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
