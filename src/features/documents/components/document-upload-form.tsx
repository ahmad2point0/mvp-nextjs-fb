"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, CheckCircle2, X } from "lucide-react";
import { toast } from "sonner";
import { Card, Button } from "@/global/components";
import { useAuthStore } from "@/global/stores/auth-store";
import {
  useUploadDocument,
  type DocumentType,
  type DocumentBucket,
} from "../hooks";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED = "image/jpeg,image/png,image/webp";

interface Slot {
  type: DocumentType;
  bucket: DocumentBucket;
  label: string;
  hint: string;
}

function slotsForRole(role: string | undefined): Slot[] {
  if (role === "student") {
    return [
      {
        type: "student_doc",
        bucket: "student-documents",
        label: "Supporting Document",
        hint: "Upload one document that supports your student status (student ID, enrollment letter, etc.)",
      },
    ];
  }
  // donor + volunteer
  return [
    {
      type: "cnic_front",
      bucket: "cnic-documents",
      label: "CNIC Front",
      hint: "Clear photo of the front of your CNIC",
    },
    {
      type: "cnic_back",
      bucket: "cnic-documents",
      label: "CNIC Back",
      hint: "Clear photo of the back of your CNIC",
    },
  ];
}

export function DocumentUploadForm() {
  const router = useRouter();
  const { user } = useAuthStore();
  const uploadDocument = useUploadDocument();

  const slots = slotsForRole(user?.role);
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [previews, setPreviews] = useState<Record<string, string | null>>({});
  const [uploaded, setUploaded] = useState<Record<string, boolean>>({});
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  function handleFileChange(type: DocumentType, file: File | null) {
    if (!file) return;
    if (!ACCEPTED.split(",").includes(file.type)) {
      toast.error("Only JPEG, PNG, or WebP images are allowed");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Image must be 5MB or smaller");
      return;
    }
    setFiles((prev) => ({ ...prev, [type]: file }));
    setPreviews((prev) => ({ ...prev, [type]: URL.createObjectURL(file) }));
    setUploaded((prev) => ({ ...prev, [type]: false }));
  }

  function clearSlot(type: DocumentType) {
    setFiles((prev) => ({ ...prev, [type]: null }));
    setPreviews((prev) => ({ ...prev, [type]: null }));
    setUploaded((prev) => ({ ...prev, [type]: false }));
    const input = inputRefs.current[type];
    if (input) input.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      toast.error("You must be signed in to upload documents");
      return;
    }

    const missing = slots.filter((s) => !files[s.type]);
    if (missing.length > 0) {
      toast.error(`Please upload: ${missing.map((m) => m.label).join(", ")}`);
      return;
    }

    try {
      for (const slot of slots) {
        const file = files[slot.type];
        if (!file) continue;
        await uploadDocument.mutateAsync({
          file,
          userId: user.id,
          documentType: slot.type,
          bucket: slot.bucket,
        });
        setUploaded((prev) => ({ ...prev, [slot.type]: true }));
      }

      toast.success("Documents uploaded successfully!");
      router.push("/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      toast.error(message);
    }
  }

  const isPending = uploadDocument.isPending;

  return (
    <Card bordered className="max-w-[560px] mx-auto">
      <StepIndicator currentStep={3} />

      <h2 className="text-heading text-2xl font-light tracking-tight text-center mb-2">
        Upload Verification Documents
      </h2>
      <p className="text-body text-sm text-center mb-6">
        {user?.role === "student"
          ? "Upload a supporting document to confirm your student status."
          : "Upload both sides of your CNIC to complete verification."}
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {slots.map((slot) => (
          <div key={slot.type} className="flex flex-col gap-2">
            <label className="flex items-center justify-between text-sm text-heading">
              <span className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-primary" />
                {slot.label}
              </span>
              {uploaded[slot.type] && (
                <span className="flex items-center gap-1 text-xs text-emerald-600">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Uploaded
                </span>
              )}
            </label>
            <p className="text-xs text-body">{slot.hint}</p>

            {previews[slot.type] ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previews[slot.type]!}
                  alt={slot.label}
                  className="w-full max-h-60 object-contain rounded border border-border bg-gray-50"
                />
                <button
                  type="button"
                  onClick={() => clearSlot(slot.type)}
                  className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full p-1 shadow"
                  aria-label="Remove image"
                >
                  <X className="w-4 h-4 text-heading" />
                </button>
              </div>
            ) : (
              <input
                ref={(el) => {
                  inputRefs.current[slot.type] = el;
                }}
                type="file"
                accept={ACCEPTED}
                onChange={(e) =>
                  handleFileChange(slot.type, e.target.files?.[0] ?? null)
                }
                className="w-full text-sm text-body file:mr-3 file:px-3 file:py-1.5 file:rounded file:border-0 file:text-sm file:bg-primary/10 file:text-primary hover:file:bg-primary/20 file:cursor-pointer"
              />
            )}
          </div>
        ))}

        <Button
          type="submit"
          fullWidth
          disabled={isPending || slots.some((s) => !files[s.type])}
        >
          {isPending ? "Uploading..." : "Complete Registration"}
        </Button>
      </form>
    </Card>
  );
}

function StepIndicator({ currentStep }: { currentStep: number }) {
  const steps = [
    { n: 1, label: "Register" },
    { n: 2, label: "Verify Email" },
    { n: 3, label: "Upload Docs" },
  ];

  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {steps.map((s, i) => {
        const isActive = s.n === currentStep;
        const isDone = s.n < currentStep;
        return (
          <div key={s.n} className="flex items-center gap-2">
            <div
              className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium ${
                isActive
                  ? "bg-primary text-white"
                  : isDone
                    ? "bg-emerald-500 text-white"
                    : "bg-gray-200 text-body"
              }`}
            >
              {isDone ? <CheckCircle2 className="w-4 h-4" /> : s.n}
            </div>
            <span
              className={`text-xs ${isActive ? "text-heading font-medium" : "text-body"}`}
            >
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <div className="w-6 h-px bg-border mx-1" />
            )}
          </div>
        );
      })}
    </div>
  );
}
