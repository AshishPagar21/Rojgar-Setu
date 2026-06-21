import React from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle, CheckCircle2, Flag, CornerDownRight } from "lucide-react";
import { Button } from "./Button";
import type { Dispute } from "../../types/common.types";

interface DisputeDetailsPanelProps {
  dispute: Dispute;
  currentUserRole: "EMPLOYER" | "WORKER";
  onCounterClick?: () => void;
}

export const DisputeDetailsPanel: React.FC<DisputeDetailsPanelProps> = ({
  dispute,
  currentUserRole,
  onCounterClick,
}) => {
  const { t } = useTranslation();
  const isSettled = dispute.status === "RESOLVED" || dispute.status === "REJECTED";
  const isCreator = dispute.raisedByType === currentUserRole;

  // Decide colors based on status
  const containerClasses =
    dispute.status === "RESOLVED"
      ? "border-emerald-200 bg-emerald-50/55 text-emerald-900"
      : dispute.status === "REJECTED"
      ? "border-slate-200 bg-slate-50/50 text-slate-700"
      : dispute.status === "COUNTERED"
      ? "border-blue-200 bg-blue-50/30 text-blue-900"
      : "border-amber-200 bg-amber-50/40 text-amber-900";

  const headerIcon =
    isSettled ? (
      <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
    ) : (
      <AlertTriangle size={16} className="text-amber-500 animate-pulse shrink-0" />
    );

  const statusLabel =
    dispute.status === "RESOLVED"
      ? t("admin.disputeStatus", { status: t("status.APPROVED") || "RESOLVED" })
      : dispute.status === "REJECTED"
      ? t("admin.disputeStatus", { status: t("status.DISPUTED") || "REJECTED" })
      : dispute.status === "COUNTERED"
      ? t("notifications.types.DISPUTE_COUNTERED.title") || "Counter Dispute Submitted"
      : t("notifications.types.DISPUTE_CREATED.title") || "Dispute Under Review";

  return (
    <div className={`rounded-xl border p-4 shadow-sm space-y-4 ${containerClasses}`}>
      {/* Panel Header */}
      <div className="flex items-center gap-2 border-b border-black/5 pb-2">
        {headerIcon}
        <h4 className="text-xs font-bold uppercase tracking-wider">{statusLabel}</h4>
      </div>

      {/* Reason & Date */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1">
          <span className="text-slate-500 font-medium">{t("common.reason")}:</span>
          <span className="rounded-full bg-red-100 px-2.5 py-0.5 font-bold uppercase text-red-700 text-[10px]">
            {dispute.reason}
          </span>
        </div>
        <span className="text-slate-400 text-[10px]">
          {t("admin.filedOn", { date: new Date(dispute.createdAt).toLocaleDateString() })}
        </span>
      </div>

      {/* Initial Grievance */}
      <div className="rounded-lg bg-black/5 p-3 space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
          <Flag size={12} className="text-slate-400" />
          {t("admin.initialGrievance", { type: dispute.raisedByType })}
        </p>
        <p className="text-xs italic leading-relaxed text-slate-700">
          "{dispute.initialDescription}"
        </p>
      </div>

      {/* Counter Grievance */}
      <div className="rounded-lg bg-black/5 p-3 space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
          <CornerDownRight size={12} className="text-slate-400" />
          {t("admin.defenseCounter")}
        </p>
        {dispute.counterDescription ? (
          <p className="text-xs italic leading-relaxed text-slate-700">
            "{dispute.counterDescription}"
          </p>
        ) : (
          <div className="space-y-3">
            <p className="text-xs italic text-slate-400">{t("admin.noCounterYet")}</p>
            {!isCreator && !isSettled && onCounterClick && (
              <Button
                variant="outline"
                className="w-full border-blue-300 text-blue-600 hover:bg-blue-50/50 py-1.5 text-xs h-auto"
                onClick={onCounterClick}
              >
                {t("jobDetails.raiseDispute") || "Submit Counter Claim"}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
