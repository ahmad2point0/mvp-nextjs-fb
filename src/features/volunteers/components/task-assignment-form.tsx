"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/global/components";
import { useActiveVolunteers, useCreateTask } from "../hooks";

export function TaskAssignmentForm() {
  const { data: volunteers, isLoading: loadingVolunteers } = useActiveVolunteers();
  const createTask = useCreateTask();

  const [volunteerId, setVolunteerId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!volunteerId || !studentName || !description || !dueDate) {
      toast.error("All fields are required");
      return;
    }

    createTask.mutate(
      {
        volunteer_id: volunteerId,
        student_name: studentName,
        task_description: description,
        due_date: dueDate,
      },
      {
        onSuccess: () => {
          toast.success("Task assigned successfully!");
          setVolunteerId("");
          setStudentName("");
          setDescription("");
          setDueDate("");
        },
        onError: (err) => toast.error(err.message),
      }
    );
  }

  return (
    <div>
      <h3 className="text-heading text-lg font-light tracking-tight mb-4">
        Assign New Task
      </h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
        <div className="sm:col-span-2">
          <label className="block text-xs text-body mb-1">Assign to Volunteer</label>
          <select
            value={volunteerId}
            onChange={(e) => setVolunteerId(e.target.value)}
            className="w-full px-3 py-2.5 rounded border border-border text-sm text-heading focus:border-primary focus:outline-none bg-white"
          >
            <option value="">
              {loadingVolunteers ? "Loading..." : "Select a volunteer"}
            </option>
            {volunteers?.map((v) => (
              <option key={v.id} value={v.id}>
                {v.full_name} ({v.email})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-body mb-1">Student Name</label>
          <input
            type="text"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="Student name"
            className="w-full px-3 py-2.5 rounded border border-border text-sm text-heading placeholder:text-body focus:border-primary focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs text-body mb-1">Due Date</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-3 py-2.5 rounded border border-border text-sm text-heading focus:border-primary focus:outline-none"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs text-body mb-1">Task Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the task..."
            rows={3}
            className="w-full px-3 py-2.5 rounded border border-border text-sm text-heading placeholder:text-body focus:border-primary focus:outline-none resize-none"
          />
        </div>

        <div className="sm:col-span-2">
          <Button type="submit" disabled={createTask.isPending}>
            {createTask.isPending ? "Assigning..." : "Assign Task"}
          </Button>
        </div>
      </form>
    </div>
  );
}
