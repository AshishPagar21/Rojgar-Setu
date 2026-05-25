import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { Button } from "../../components/common/Button";
import { useAuth } from "../../hooks/useAuth";
import { workerService } from "../../modules/worker/worker.service";
import type {
  WorkerDashboardData,
  WorkerDashboardRecentApplication,
  WorkerDashboardRecentAssignedJob,
} from "../../modules/worker/worker.types";

const numberFormat = new Intl.NumberFormat();

const formatDate = (value?: string) => {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

const getStatusLabel = (status: string, t: (key: string) => string) => {
  switch (status) {
    case "OPEN":
      return t("dashboard.statusOpen");
    case "ASSIGNED":
      return t("dashboard.statusAssigned");
    case "COMPLETED":
      return t("dashboard.statusCompleted");
    case "SELECTED":
      return t("dashboard.statusSelected");
    case "PENDING":
      return t("dashboard.statusPending");
    case "REJECTED":
      return t("dashboard.statusRejected");
    default:
      return status;
  }
};

const getStatusTone = (status: string) => {
  switch (status) {
    case "OPEN":
      return "bg-emerald-50 text-emerald-700";
    case "ASSIGNED":
      return "bg-amber-50 text-amber-700";
    case "COMPLETED":
      return "bg-blue-50 text-blue-700";
    case "SELECTED":
      return "bg-brand-50 text-brand-700";
    case "PENDING":
      return "bg-slate-100 text-slate-700";
    case "REJECTED":
      return "bg-rose-50 text-rose-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
};

const StatCard = ({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone: string;
}) => {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className={`mb-3 h-2 w-14 rounded-full ${tone}`} />
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
};

const SectionCard = ({
  title,
  count,
  emptyText,
  children,
}: {
  title: string;
  count: number;
  emptyText: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">{title}</h2>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          {count}
        </span>
      </div>
      {count === 0 ? (
        <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
          {emptyText}
        </p>
      ) : (
        <div className="mt-4 space-y-3">{children}</div>
      )}
    </div>
  );
};

export const WorkerDashboardPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [dashboard, setDashboard] = useState<WorkerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const response =
          (await workerService.getDashboard()) as WorkerDashboardData;
        setDashboard(response);
      } catch (err) {
        setError(t("dashboard.failedToLoadDashboard"));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [t]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="rounded-2xl bg-white px-5 py-4 text-sm font-medium text-slate-600 shadow-sm">
          {t("dashboard.loadingDashboard")}
        </div>
      </div>
    );
  }

  const recentApplications: WorkerDashboardRecentApplication[] =
    dashboard?.recentApplications || [];
  const recentAssignedJobs: WorkerDashboardRecentAssignedJob[] =
    dashboard?.recentAssignedJobs || [];
  const welcomeName = profile?.worker?.name || user?.mobileNumber || "";

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-amber-500 p-5 text-white shadow-lg shadow-brand-100">
        <p className="text-sm font-medium text-white/90">
          {t("dashboard.atAGlance")}
        </p>
        <h1 className="mt-1 text-2xl font-bold">
          {t("dashboard.welcome", { name: welcomeName })}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/90">
          {t("dashboard.workerText")}
        </p>
        <div className="mt-4 inline-flex rounded-full bg-white/15 px-3 py-1 text-sm font-medium text-white">
          {t("dashboard.workerNextStep")}
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      {dashboard && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label={t("dashboard.totalApplications")}
            value={numberFormat.format(dashboard.totalApplications)}
            tone="bg-brand-500"
          />
          <StatCard
            label={t("dashboard.selectedJobs")}
            value={numberFormat.format(dashboard.selectedJobsCount)}
            tone="bg-emerald-500"
          />
          <StatCard
            label={t("dashboard.completedJobs")}
            value={numberFormat.format(dashboard.totalJobsCompleted)}
            tone="bg-sky-500"
          />
          <StatCard
            label={t("dashboard.paymentsReceived")}
            value={numberFormat.format(dashboard.paymentReceivedCount)}
            tone="bg-amber-500"
          />
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <Button fullWidth onClick={() => navigate("/jobs/open")}>
          {t("dashboard.findWork")}
        </Button>
        <Button
          fullWidth
          variant="secondary"
          onClick={() => navigate("/applications/my")}
        >
          {t("dashboard.myApplications")}
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title={t("dashboard.recentApplications")}
          count={recentApplications.length}
          emptyText={t("dashboard.noApplications")}
        >
          {recentApplications.map((app) => (
            <div
              key={app.id}
              className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4 transition hover:border-brand-200 hover:bg-brand-50/40"
              onClick={() => navigate("/applications/my")}
            >
              <div className="flex-1">
                <p className="font-semibold text-slate-900">{app.job.title}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {app.job.category || t("dashboard.browseJobs")}
                </p>
                {app.appliedAt ? (
                  <p className="mt-1 text-xs text-slate-400">
                    {t("dashboard.appliedOn", {
                      date: formatDate(app.appliedAt),
                    })}
                  </p>
                ) : null}
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusTone(
                  app.status,
                )}`}
              >
                {getStatusLabel(app.status, t)}
              </span>
            </div>
          ))}
        </SectionCard>

        <SectionCard
          title={t("dashboard.recentAssignedJobs")}
          count={recentAssignedJobs.length}
          emptyText={t("dashboard.noAssignedJobs")}
        >
          {recentAssignedJobs.map((job) => (
            <div
              key={job.id}
              className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4 transition hover:border-brand-200 hover:bg-brand-50/40"
              onClick={() => navigate("/jobs/assigned")}
            >
              <div className="flex-1">
                <p className="font-semibold text-slate-900">{job.job.title}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {job.job.employer.name || t("dashboard.viewAssignedJobs")}
                </p>
                {job.job.jobDate ? (
                  <p className="mt-1 text-xs text-slate-400">
                    {t("dashboard.jobDate", {
                      date: formatDate(job.job.jobDate),
                    })}
                  </p>
                ) : null}
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusTone(
                  job.status,
                )}`}
              >
                {getStatusLabel(job.status, t)}
              </span>
            </div>
          ))}
        </SectionCard>
      </div>
    </div>
  );
};
