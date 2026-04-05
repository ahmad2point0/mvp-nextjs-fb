import { createServerSupabaseClient } from "@/global/lib/supabase-server";
import { notifyAdmins } from "@/global/lib/create-notification";
import { NextResponse, type NextRequest } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  // Fetch the task to check ownership
  const { data: task } = await supabase
    .from("volunteer_tasks")
    .select("volunteer_id, task_description, status")
    .eq("id", id)
    .single();

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  // Only the assigned volunteer or admin can update
  const isAdmin = profile?.role === "admin";
  const isOwner = task.volunteer_id === user.id;

  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { status } = body;

  // Volunteers can only update status with valid transitions
  if (!isAdmin && status) {
    const validTransitions: Record<string, string[]> = {
      assigned: ["in-progress"],
      "in-progress": ["completed"],
    };

    const allowed = validTransitions[task.status ?? ""] ?? [];
    if (!allowed.includes(status)) {
      return NextResponse.json(
        { error: `Cannot transition from "${task.status}" to "${status}"` },
        { status: 400 }
      );
    }
  }

  const { data, error } = await supabase
    .from("volunteer_tasks")
    .update(body)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Notify admins when a volunteer updates task status
  if (status && !isAdmin) {
    await notifyAdmins(
      supabase,
      "Task status updated",
      `Task "${task.task_description}" has been updated to "${status}".`,
      "check-circle"
    );
  }

  return NextResponse.json(data);
}
