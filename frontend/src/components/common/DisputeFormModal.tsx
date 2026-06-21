import React, { useState } from "react";
import { Button } from "./Button";

// ── Reason lists per role ────────────────────────────────────────────────────

const EMPLOYER_REASONS = [
  "Absent / No Show",
  "Late Arrival",
  "Left Early Without Notice",
  "Unsatisfactory Work Quality",
  "Incorrect Hours Claimed",
  "Behavioral / Safety Issue",
  "Other",
] as const;

const WORKER_REASONS = [
  "Work Was Completed as Required",
  "Attendance Correctly Recorded",
  "Incorrect Hours Claimed by Employer",
  "Payment Amount Incorrect",
  "Unfair Treatment / Wrongful Rejection",
  "Other",
] as const;

// ── Props ────────────────────────────────────────────────────────────────────

export interface DisputeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called when form is submitted. Throw to show inline error. */
  onSubmit: (data: { reason: string; description: string }) => Promise<void>;
  isSubmitting: boolean;
  /**
   * Controls which reason list is shown.
   * @default "EMPLOYER"
   */
  callerRole?: "EMPLOYER" | "WORKER";
  title?: string;
}

// ── Component ────────────────────────────────────────────────────────────────

export const DisputeFormModal: React.FC<DisputeFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  callerRole = "EMPLOYER",
  title,
}) => {
  const reasons = callerRole === "EMPLOYER" ? EMPLOYER_REASONS : WORKER_REASONS;

  const [reason, setReason] = useState<string>(reasons[0]);
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string>();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);

    if (description.trim().length < 10) {
      setError("Please provide at least 10 characters of detail.");
      return;
    }

    try {
      await onSubmit({ reason, description: description.trim() });
      setDescription("");
      setReason(reasons[0]);
    } catch {
      setError("Failed to submit. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b bg-red-50 border-red-100">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-lg">⚖️</span>
            <h3 className="text-base font-bold text-red-900">{title || "Raise Dispute"}</h3>
          </div>
          <p className="text-xs text-slate-500 leading-snug">
            Provide accurate details. Your statement will be reviewed by admin.
          </p>
        </div>

        <div className="px-6 py-5">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Reason */}
            <div>
              <label
                htmlFor="dispute-reason"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Reason
              </label>
              <select
                id="dispute-reason"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={isSubmitting}
              >
                {reasons.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="dispute-description"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Detailed Description
              </label>
              <textarea
                id="dispute-description"
                rows={5}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                placeholder={
                  callerRole === "EMPLOYER"
                    ? "Describe the issue in detail (e.g. Worker left 2 hours early without informing me)..."
                    : "Explain why you are disputing this record (e.g. I worked the full shift as agreed but my hours were incorrectly recorded)..."
                }
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
              />
              <p className="mt-1 text-right text-[10px] text-slate-400">
                {description.length} characters
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white"
                loading={isSubmitting}
              >
                File Dispute
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
