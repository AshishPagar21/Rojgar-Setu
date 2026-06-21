import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

import { useAuth } from "../../hooks/useAuth";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import {
  adminService,
  type AdminUser,
  type DisputeItem,
} from "../../modules/admin/admin.service";
import type { AdminDashboardData } from "../../modules/employer/employer.types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (iso: string | null | undefined): string => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const fmtDate = (iso: string): string =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

// ─── Sub-components ───────────────────────────────────────────────────────────

interface MetricCardProps {
  label: string;
  value: number | string;
  accent?: "default" | "emerald" | "amber" | "rose";
  icon: React.ReactNode;
}

const MetricCard = ({
  label,
  value,
  accent = "default",
  icon,
}: MetricCardProps) => {
  const accentMap = {
    default: "bg-slate-50 border-slate-100 text-slate-900",
    amber: "bg-amber-50 border-amber-200 text-amber-900",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-900",
    rose: "bg-rose-50 border-rose-200 text-rose-900",
  };
  const labelMap = {
    default: "text-slate-500",
    amber: "text-amber-700",
    emerald: "text-emerald-700",
    rose: "text-rose-700",
  };
  const iconMap = {
    default: "text-slate-400",
    amber: "text-amber-500",
    emerald: "text-emerald-500",
    rose: "text-rose-500",
  };

  return (
    <div
      className={`rounded-2xl border p-4 transition-all duration-200 hover:shadow-md ${accentMap[accent]}`}
    >
      <div className="flex items-center justify-between">
        <p
          className={`text-xs font-semibold uppercase tracking-wide ${labelMap[accent]}`}
        >
          {label}
        </p>
        <span className={iconMap[accent]}>{icon}</span>
      </div>
      <p className="mt-3 text-3xl font-black">{value}</p>
    </div>
  );
};

// ─── Dispute Ticket ───────────────────────────────────────────────────────────

interface DisputeTicketProps {
  item: DisputeItem;
  resolvingId: number | null;
  onResolve: (id: number, status: "RESOLVED" | "REJECTED") => void;
}

const statusBadge: Record<string, string> = {
  OPEN: "bg-amber-100 text-amber-800",
  COUNTERED: "bg-blue-100 text-blue-800",
  ESCALATED: "bg-orange-100 text-orange-800",
  RESOLVED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-slate-100 text-slate-600",
};

const DisputeTicket = ({ item, resolvingId, onResolve }: DisputeTicketProps) => {
  const { t } = useTranslation();
  const isSettled = item.status === "RESOLVED" || item.status === "REJECTED";
  const isProcessing = resolvingId === item.id;

  const workerName = item.worker?.name ?? item.attendance?.worker?.name ?? t("admin.unknownWorker");
  const workerPhone = item.worker?.user?.mobileNumber ?? item.attendance?.worker?.user?.mobileNumber ?? "—";
  const employerName =
    item.employer?.name ?? item.attendance?.job?.employer?.name ?? t("admin.unknownEmployer");
  const employerPhone =
    item.employer?.user?.mobileNumber ?? item.attendance?.job?.employer?.user?.mobileNumber ?? "—";

  return (
    <div
      className={`overflow-hidden rounded-2xl border shadow-sm transition-all duration-300 ${
        isSettled
          ? "border-slate-200 opacity-60"
          : "border-slate-200 hover:shadow-md"
      }`}
    >
      {/* ── Dark slate header: Job title + rate badge ─────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-800 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              {t("admin.disputedJob")}
            </p>
            <p className="text-base font-bold text-white">
              {item.job?.title ?? item.attendance?.job?.title ?? t("admin.unknownJob")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-amber-400/20 px-3 py-1 text-sm font-bold text-amber-300">
            ₹
            {(item.job?.wage ?? item.attendance?.job?.wage ?? 0).toLocaleString(
              "en-IN",
            )}
            /hr
          </span>
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              statusBadge[item.status] ?? "bg-slate-100 text-slate-600"
            }`}
          >
            {item.status}
          </span>
        </div>
      </div>

      <div className="space-y-4 bg-white p-5">
        {/* ── Reason chip ──────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-500">{t("common.reason")}:</span>
          <span className="rounded-full bg-red-100 px-3 py-0.5 font-bold uppercase text-red-700">
            {item.reason}
          </span>
          <span className="ml-auto text-slate-400">
            {t("admin.filedOn", { date: fmtDate(item.createdAt) })}
          </span>
        </div>

        {/* ── Symmetrical Worker ↔ Employer info blocks ────────────────── */}
        <div className="grid gap-3 sm:grid-cols-2">
          {/* Worker block */}
          <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs text-white">
                W
              </span>
              <p className="text-[10px] font-bold uppercase tracking-widest text-blue-700">
                {t("rating.worker")}
              </p>
            </div>
            <p className="text-sm font-bold text-slate-900">{workerName}</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
              <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 00-2-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span className="font-mono">{workerPhone}</span>
            </p>
          </div>

          {/* Employer block */}
          <div className="rounded-xl border border-violet-100 bg-violet-50/50 p-4">
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600 text-xs text-white">
                E
              </span>
              <p className="text-[10px] font-bold uppercase tracking-widest text-violet-700">
                {t("rating.employer")}
              </p>
            </div>
            <p className="text-sm font-bold text-slate-900">{employerName}</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
              <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 00-2-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span className="font-mono">{employerPhone}</span>
            </p>
          </div>
        </div>

        {/* ── Digital verification timestamps ──────────────────────────── */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t("admin.loggedCheckIn")}
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {fmt(item.attendance?.checkInTime)}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t("admin.loggedCheckOut")}
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {fmt(item.attendance?.checkOutTime)}
            </p>
          </div>
        </div>

        {/* ── Statement boxes ───────────────────────────────────────────── */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-red-100 bg-red-50/40 p-4">
            <p className="mb-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-red-600">
              <svg className="h-3.5 w-3.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {t("admin.initialGrievance", { type: item.raisedByType })}
            </p>
            <p className="text-xs italic leading-relaxed text-slate-700">
              "{item.initialDescription}"
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
            <p className="mb-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              {t("admin.defenseCounter")}
            </p>
            {item.counterDescription ? (
              <p className="text-xs italic leading-relaxed text-slate-700">
                "{item.counterDescription}"
              </p>
            ) : (
              <p className="text-xs italic text-slate-400">
                {t("admin.noCounterYet")}
              </p>
            )}
          </div>
        </div>

        {/* ── Decision buttons ──────────────────────────────────────────── */}
        {!isSettled && (
          <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              disabled={resolvingId !== null}
              onClick={() => onResolve(item.id, "RESOLVED")}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-emerald-700 hover:shadow-md active:scale-95 disabled:opacity-50"
            >
              {isProcessing ? (
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
              {t("admin.releasePayout")}
            </button>
            <button
              disabled={resolvingId !== null}
              onClick={() => onResolve(item.id, "REJECTED")}
              className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-rose-700 hover:shadow-md active:scale-95 disabled:opacity-50"
            >
              {isProcessing ? (
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              {t("admin.approveAdjustment")}
            </button>
          </div>
        )}

        {isSettled && (
          <p className="mt-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">
            {t("admin.disputeStatus", { status: item.status })}
          </p>
        )}
      </div>
    </div>
  );
};

// ─── Users Tab ────────────────────────────────────────────────────────────────

interface UsersTabProps {
  users: AdminUser[];
  onSuspend: (id: number) => void;
  onReactivate: (id: number) => void;
  actioningId: number | null;
}

const UsersTab = ({
  users,
  onSuspend,
  onReactivate,
  actioningId,
}: UsersTabProps) => {
  const { t } = useTranslation();
  const roleBadge: Record<string, string> = {
    ADMIN: "bg-violet-100 text-violet-850",
    EMPLOYER: "bg-blue-100 text-blue-800",
    WORKER: "bg-emerald-100 text-emerald-800",
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "ADMIN":
        return t("dashboard.adminFallback");
      case "EMPLOYER":
        return t("auth.roleEmployer");
      case "WORKER":
        return t("auth.roleWorker");
      default:
        return role;
    }
  };

  return (
    <div className="space-y-3">
      {users.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-400">
          {t("admin.noUsersFound")}
        </div>
      ) : (
        users.map((u) => {
          const displayName =
            u.employer?.name ?? u.worker?.name ?? u.mobileNumber;
          const isSuspended = u.status === "SUSPENDED";
          const isActioning = actioningId === u.id;

          return (
            <div
              key={u.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white ${
                    isSuspended ? "bg-slate-400" : "bg-gradient-to-br from-brand-600 to-amber-500"
                  }`}
                >
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {displayName}
                  </p>
                  <p className="text-xs text-slate-550 font-mono">
                    {u.mobileNumber}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    roleBadge[u.role] ?? "bg-slate-100 text-slate-650"
                  }`}
                >
                  {getRoleLabel(u.role)}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    isSuspended
                      ? "bg-rose-100 text-rose-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {isSuspended ? t("profile.inactive") : t("profile.active")}
                </span>
                {u.role !== "ADMIN" && (
                  isSuspended ? (
                    <button
                      disabled={isActioning}
                      onClick={() => onReactivate(u.id)}
                      className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
                    >
                      {isActioning ? "…" : t("admin.reactivate")}
                    </button>
                  ) : (
                    <button
                      disabled={isActioning}
                      onClick={() => onSuspend(u.id)}
                      className="rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-700 active:scale-95 disabled:opacity-50"
                    >
                      {isActioning ? "…" : t("admin.suspend")}
                    </button>
                  )
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

type Tab = "overview" | "disputes" | "users";

export const AdminDashboardPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [dashboard, setDashboard] = useState<AdminDashboardData | null>(null);
  const [disputes, setDisputes] = useState<DisputeItem[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);

  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<number | null>(null);
  const [actioningUserId, setActioningUserId] = useState<number | null>(null);

  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const openDisputes = disputes.filter(
    (d) => d.status !== "RESOLVED" && d.status !== "REJECTED",
  );
  const settledDisputes = disputes.filter(
    (d) => d.status === "RESOLVED" || d.status === "REJECTED",
  );

  const loadAll = async () => {
    try {
      const [dashResponse, disputeResponse, usersResponse] = await Promise.all([
        adminService.getDashboard(),
        adminService.listDisputes(),
        adminService.listUsers(),
      ]);
      setDashboard(dashResponse);
      setDisputes(disputeResponse);
      setUsers(usersResponse);
    } catch (error) {
      console.error("Error loading admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleResolve = async (
    disputeId: number,
    status: "RESOLVED" | "REJECTED",
  ) => {
    const message =
      status === "RESOLVED"
        ? t("admin.releasePayoutConfirm")
        : t("admin.approveAdjustmentConfirm");

    setConfirmState({
      isOpen: true,
      title: t("admin.resolveDisputeTitle", "Resolve Dispute"),
      message,
      onConfirm: async () => {
        setConfirmState((prev) => ({ ...prev, isOpen: false }));
        setResolvingId(disputeId);
        try {
          await adminService.resolveDispute(disputeId, status);
          toast.success(t("admin.resolveSuccess", "Dispute resolved successfully"));
          await loadAll();
        } catch (error) {
          console.error("Failed to resolve dispute:", error);
          toast.error(t("admin.errorResolving"));
        } finally {
          setResolvingId(null);
        }
      },
    });
  };

  const handleSuspend = async (userId: number) => {
    setConfirmState({
      isOpen: true,
      title: t("admin.suspendUserTitle", "Suspend User"),
      message: t("admin.suspendUserConfirm"),
      onConfirm: async () => {
        setConfirmState((prev) => ({ ...prev, isOpen: false }));
        setActioningUserId(userId);
        try {
          await adminService.suspendUser(userId);
          toast.success(t("admin.suspendSuccess", "User account suspended"));
          await loadAll();
        } catch {
          toast.error(t("admin.failedToSuspend"));
        } finally {
          setActioningUserId(null);
        }
      },
    });
  };

  const handleReactivate = async (userId: number) => {
    setConfirmState({
      isOpen: true,
      title: t("admin.reactivateUserTitle", "Reactivate User"),
      message: t("admin.reactivateUserConfirm"),
      onConfirm: async () => {
        setConfirmState((prev) => ({ ...prev, isOpen: false }));
        setActioningUserId(userId);
        try {
          await adminService.reactivateUser(userId);
          toast.success(t("admin.reactivateSuccess", "User account reactivated"));
          await loadAll();
        } catch {
          toast.error(t("admin.failedToReactivate"));
        } finally {
          setActioningUserId(null);
        }
      },
    });
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: "overview",
      label: t("admin.overviewTab"),
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      id: "disputes",
      label: t("admin.disputesTab"),
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
        </svg>
      ),
      badge: openDisputes.length > 0 ? openDisputes.length : undefined,
    },
    {
      id: "users",
      label: t("admin.usersTab"),
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      badge: users.length > 0 ? users.length : undefined,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 pb-10">
      {/* ── Hero Banner ─────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 p-6 text-white shadow-xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              {t("dashboard.atAGlance")}
            </p>
            <h1 className="mt-1 text-2xl font-black text-white">
              {t("dashboard.adminTitle")}
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              {t("dashboard.welcome", {
                name: user?.mobileNumber ?? t("dashboard.adminFallback"),
              })}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {dashboard ? (
              <>
                <div className="rounded-2xl bg-white/10 px-4 py-2 text-center backdrop-blur">
                  <p className="text-xs text-slate-400">{t("admin.openDisputes")}</p>
                  <p className="text-xl font-black text-amber-300">
                    {openDisputes.length}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 px-4 py-2 text-center backdrop-blur">
                  <p className="text-xs text-slate-400">{t("admin.completion")}</p>
                  <p className="text-xl font-black text-emerald-300">
                    {dashboard.charts.completionRate.toFixed(0)}%
                  </p>
                </div>
              </>
            ) : null}
          </div>
        </div>

        {/* Tab bar inside hero */}
        <div className="mt-5 flex gap-1 rounded-2xl bg-white/10 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex-1 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === tab.id
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold ${
                    activeTab === tab.id
                      ? "bg-slate-800 text-white"
                      : "bg-amber-400 text-slate-900"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Loading skeleton ─────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center rounded-3xl border border-slate-100 bg-white py-16 shadow-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-slate-200 border-t-brand-600" />
            <p className="text-sm text-slate-400">{t("admin.loadingAdmin")}</p>
          </div>
        </div>
      ) : (
        <>
          {/* ── OVERVIEW TAB ──────────────────────────────────────────── */}
          {activeTab === "overview" && dashboard && (
            <div className="space-y-5">
              {/* Metric cards */}
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <MetricCard
                  label={t("admin.totalJobs")}
                  value={dashboard.totalJobs}
                  icon={
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  }
                />
                <MetricCard
                  label={t("admin.activeWorkers")}
                  value={dashboard.activeWorkers}
                  icon={
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  }
                  accent="emerald"
                />
                <MetricCard
                  label={t("admin.activeEmployers")}
                  value={dashboard.activeEmployers}
                  icon={
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  }
                  accent="default"
                />
                <MetricCard
                  label={t("admin.completedJobs")}
                  value={dashboard.completedJobs}
                  icon={
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                  accent="emerald"
                />
                <MetricCard
                  label={t("admin.openDisputes")}
                  value={openDisputes.length}
                  icon={
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                    </svg>
                  }
                  accent="amber"
                />
                <MetricCard
                  label={t("admin.paymentsPending")}
                  value={dashboard.paymentsPending}
                  icon={
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                  accent="rose"
                />
              </div>

              {/* Historical Trend */}
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {t("admin.jobsPerDay")}
                  </h3>
                  <div className="mt-4 space-y-2">
                    {dashboard.charts.jobsPerDay.length === 0 ? (
                      <p className="text-sm text-slate-400">{t("admin.noData")}</p>
                    ) : (
                      dashboard.charts.jobsPerDay.slice(-7).map((item) => {
                        const maxCount = Math.max(
                          ...dashboard.charts.jobsPerDay.map((i) => i.count),
                        );
                        const pct = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                        return (
                          <div key={item.date} className="flex items-center gap-3">
                            <span className="w-24 shrink-0 text-xs text-slate-500">
                              {item.date}
                            </span>
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                              <div
                                  className="h-full rounded-full bg-gradient-to-r from-brand-500 to-amber-400 transition-all duration-500"
                                  style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="w-6 text-right text-xs font-bold text-slate-700">
                              {item.count}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    {t("admin.registrationsPerDay")}
                  </h3>
                  <div className="mt-4 space-y-2">
                    {dashboard.charts.registrations.length === 0 ? (
                      <p className="text-sm text-slate-400">{t("admin.noData")}</p>
                    ) : (
                      dashboard.charts.registrations.slice(-7).map((item) => {
                        const maxCount = Math.max(
                          ...dashboard.charts.registrations.map((i) => i.count),
                        );
                        const pct = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                        return (
                          <div key={item.date} className="flex items-center gap-3">
                            <span className="w-24 shrink-0 text-xs text-slate-500">
                              {item.date}
                            </span>
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                              <div
                                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-400 transition-all duration-500"
                                  style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="w-6 text-right text-xs font-bold text-slate-700">
                              {item.count}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── DISPUTES TAB ──────────────────────────────────────────── */}
          {activeTab === "disputes" && (
            <div className="space-y-5">
              {/* Active escalations */}
              <div className="rounded-3xl border border-amber-100 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
                      <svg className="h-5 w-5 text-amber-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      {t("admin.activeEscalations")}
                      {openDisputes.length > 0 && (
                        <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-amber-100 px-2 text-xs font-bold text-amber-800">
                          {openDisputes.length}
                        </span>
                      )}
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      {t("admin.reviewDisputeHelp")}
                    </p>
                  </div>
                </div>

                {openDisputes.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center flex flex-col items-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 mb-3">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-sm font-semibold text-slate-650">
                      {t("admin.allClear")}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {t("admin.noOpenDisputesHelp")}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {openDisputes.map((item) => (
                      <DisputeTicket
                        key={item.id}
                        item={item}
                        resolvingId={resolvingId}
                        onResolve={handleResolve}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Settled disputes archive */}
              {settledDisputes.length > 0 && (
                <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                  <h3 className="mb-4 text-sm font-bold text-slate-500 uppercase tracking-wide">
                    {t("admin.settledDisputesArchive", { count: settledDisputes.length })}
                  </h3>
                  <div className="space-y-4">
                    {settledDisputes.map((item) => (
                      <DisputeTicket
                        key={item.id}
                        item={item}
                        resolvingId={resolvingId}
                        onResolve={handleResolve}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── USERS TAB ─────────────────────────────────────────────── */}
          {activeTab === "users" && (
            <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
                    <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {t("admin.platformUsers")}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    {t("admin.manageUsersHelp")}
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-655">
                  {t("admin.totalUsers", { count: users.length })}
                </span>
              </div>
              <UsersTab
                users={users}
                onSuspend={handleSuspend}
                onReactivate={handleReactivate}
                actioningId={actioningUserId}
              />
            </div>
          )}
        </>
      )}
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        onConfirm={confirmState.onConfirm}
        onCancel={() => setConfirmState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
