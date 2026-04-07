import { createServerSupabaseClient } from "@/global/lib/supabase-server";
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

  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "signup",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  return NextResponse.json({
    user: data.user,
    session: data.session,
  });
}
