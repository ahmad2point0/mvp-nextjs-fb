import { createServerSupabaseClient } from "@/global/lib/supabase-server";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, password, full_name, phone, role } = body;

  if (!email || !password || !full_name || !role) {
    return NextResponse.json(
      { error: "Email, password, full name, and role are required" },
      { status: 400 }
    );
  }

  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name, phone, role },
    },
  });

  if (error) {
    const message = error.message.includes("rate limit")
      ? "Too many sign-up attempts. Please wait a few minutes and try again."
      : error.message;
    return NextResponse.json({ error: message }, { status: 429 });
  }

  // Create profile row
  if (data.user) {
    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      full_name,
      phone: phone || null,
      role,
      approved: role === "donor" || role === "student",
    });

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ user: data.user }, { status: 201 });
}
