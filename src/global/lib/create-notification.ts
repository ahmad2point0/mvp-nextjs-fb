import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Insert a notification row. Works with any server-side Supabase client.
 * The Realtime subscription on the client will pick it up automatically.
 */
export async function createNotification(
  supabase: SupabaseClient,
  userId: string,
  title: string,
  message: string,
  icon = "bell"
) {
  await supabase.from("notifications").insert({
    user_id: userId,
    title,
    message,
    icon,
  });
}

/** Notify every user with role = 'admin'. */
export async function notifyAdmins(
  supabase: SupabaseClient,
  title: string,
  message: string,
  icon = "bell"
) {
  const { data: admins } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "admin");

  if (!admins?.length) return;

  await supabase.from("notifications").insert(
    admins.map((a) => ({
      user_id: a.id,
      title,
      message,
      icon,
    }))
  );
}
