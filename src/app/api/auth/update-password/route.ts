import { createServerSupabaseClient } from "@/global/lib/supabase-server";
import { validatePassword } from "@/global/lib/password-validation";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  const passwordError = validatePassword(password);
  if (passwordError) {
    return NextResponse.json({ error: passwordError }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ message: "Password updated successfully" });
}
