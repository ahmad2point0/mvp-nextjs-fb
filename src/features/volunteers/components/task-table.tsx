"use client";

import { Button } from "@/global/components";
import { useVolunteerTasks, useUpdateTask } from "../hooks";

const statusColors: Record<string, string> = {
  assigned: "bg-primary/10 text-primary border-primary/30",
  in_progress: "bg-[#facc15]/10 text-[#9b6829] border-[#facc15]/30",
  completed: "bg-success/20 text-success-text border-success/40",
};

export function TaskTable() {
  const { data: tasks, isLoading } = useVolunteerTasks();
  const updateTask = useUpdateTask();

  if (isLoading) {
    return <p className="text-body text-sm">Loading tasks...</p>;
  }

  if (!tasks?.length) {
    return (
      <div className="text-center py-12 text-body">
        <p className="text-lg">No tasks assigned yet</p>
        <p className="text-sm mt-1">Tasks will appear here when assigned to you.</p>
      </div>
    );
  }

  function handleStatusChange(id: string, status: string) {
    updateTask.mutate({ id, status });
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full bg-white rounded-lg overflow-hidden shadow-elevated">
        <thead>
          <tr className="bg-brand-dark text-white text-left text-sm">
            <th className="px-4 py-3">Student</th>
            <th className="px-4 py-3">Task</th>
            <th className="px-4 py-3">Due Date</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id} className="border-t border-border">
              <td className="px-4 py-3 text-sm text-heading">{task.student_name}</td>
              <td className="px-4 py-3 text-sm text-body">{task.task_description}</td>
              <td className="px-4 py-3 text-sm text-body">
                {new Date(task.due_date).toLocaleDateString()}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-block px-3 py-1 text-xs rounded border ${statusColors[task.status] || "bg-gray-100 text-gray-600"}`}
                >
                  {task.status.replace("_", " ")}
                </span>
              </td>
              <td className="px-4 py-3 flex gap-2">
                {task.status === "assigned" && (
                  <Button
                    variant="ghost"
                    className="text-xs px-3 py-1"
                    onClick={() => handleStatusChange(task.id, "in_progress")}
                    disabled={updateTask.isPending}
                  >
                    Start
                  </Button>
                )}
                {task.status === "in_progress" && (
                  <Button
                    variant="ghost"
                    className="text-xs px-3 py-1"
                    onClick={() => handleStatusChange(task.id, "completed")}
                    disabled={updateTask.isPending}
                  >
                    Complete
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
