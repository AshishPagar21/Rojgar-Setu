import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { 
  Briefcase, 
  UserCheck, 
  CheckCircle2, 
  Unlock, 
  User, 
  TrendingUp, 
  Plus, 
  List, 
  Calendar, 
  Layers 
} from "lucide-react";

import { Button } from "../../components/common/Button";
import { useAuth } from "../../hooks/useAuth";
import { employerService } from "../../modules/employer/employer.service";
import type {
  EmployerDashboardData,
  EmployerDashboardRecentJob,
} from "../../modules/employer/employer.types";

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
      return "bg-emerald-50 text-emerald-700 border border-emerald-100";
    case "ASSIGNED":
      return "bg-amber-50 text-amber-700 border border-amber-100";
    case "COMPLETED":
      return "bg-blue-50 text-blue-700 border border-blue-100";
    case "SELECTED":
      return "bg-indigo-50 text-indigo-700 border border-indigo-100";
    case "PENDING":
      return "bg-slate-50 text-slate-600 border border-slate-200";
    case "REJECTED":
      return "bg-rose-50 text-rose-700 border border-rose-100";
    default:
      return "bg-slate-50 text-slate-600 border border-slate-200";
  }
};

const StatCard = ({
  label,
  value,
  icon: Icon,
  iconColor,
  bgColor,
}: {
  label: string;
  value: string | number;
  icon: any;
  iconColor: string;
  bgColor: string;
}) => {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-10 blur-xl transition-all duration-300 group-hover:scale-125 ${bgColor}`} />
      
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
          <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${bgColor} ${iconColor} transition-transform duration-300 group-hover:scale-110`}>
          <Icon className="h-5 w-5" strokeWidth={2.2} />
        </div>
      </div>
    </div>
  );
};

export const EmployerDashboardPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [dashboard, setDashboard] = useState<EmployerDashboardData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const response =
          (await employerService.getDashboard()) as EmployerDashboardData;
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
        <div className="flex items-center gap-2 rounded-2xl bg-white px-5 py-4 text-sm font-semibold text-indigo-600 shadow-sm border border-slate-100">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          {t("dashboard.loadingDashboard")}
        </div>
      </div>
    );
  }

  const recentJobs: EmployerDashboardRecentJob[] = dashboard?.recentJobs || [];
  const welcomeName = profile?.employer?.name || user?.mobileNumber || "";

  return (
    <div className="space-y-6">
      {/* Greeting Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 p-6 text-white shadow-lg shadow-indigo-100">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-500/20 blur-2xl animate-pulse" />
        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-indigo-400/25 blur-2xl" />

        <div className="relative flex items-center justify-between">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold tracking-wide text-indigo-100">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {t("dashboard.atAGlance")}
            </span>
            <h1 className="text-2xl font-extrabold tracking-tight mt-2.5">
              {t("dashboard.welcome", { name: welcomeName })}
            </h1>
            <p className="max-w-[280px] text-xs leading-relaxed text-indigo-100/80 mt-1">
              {t("dashboard.employerText")}
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-amber-300">
            <User className="h-6 w-6" />
          </div>
        </div>

        <div className="relative mt-5 flex items-center gap-2 rounded-2xl bg-white/5 p-3 text-xs text-indigo-100">
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-white/10 text-amber-300">
            <TrendingUp className="h-3.5 w-3.5" />
          </div>
          <span className="font-medium text-white/95">
            {t("dashboard.employerNextStep")}
          </span>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      {dashboard && (
        <div className="grid gap-4 grid-cols-2">
          <StatCard
            label={t("dashboard.totalJobsPosted")}
            value={numberFormat.format(dashboard.totalJobsPosted)}
            icon={Briefcase}
            iconColor="text-indigo-600"
            bgColor="bg-indigo-50"
          />
          <StatCard
            label={t("dashboard.openJobs")}
            value={numberFormat.format(dashboard.openJobsCount)}
            icon={Unlock}
            iconColor="text-emerald-600"
            bgColor="bg-emerald-50"
          />
          <StatCard
            label={t("dashboard.assignedJobs")}
            value={numberFormat.format(dashboard.assignedJobsCount)}
            icon={UserCheck}
            iconColor="text-amber-600"
            bgColor="bg-amber-50"
          />
          <StatCard
            label={t("dashboard.completedJobs")}
            value={numberFormat.format(dashboard.completedJobsCount)}
            icon={CheckCircle2}
            iconColor="text-sky-600"
            bgColor="bg-sky-50"
          />
        </div>
      )}

      {/* Quick Action Buttons */}
      <div className="grid gap-3 grid-cols-2">
        <Button 
          fullWidth 
          onClick={() => navigate("/jobs/create")}
          className="flex items-center justify-center gap-2 shadow-sm shadow-indigo-100 transition-all hover:shadow-indigo-200"
        >
          <Plus className="h-5 w-5" strokeWidth={2.5} />
          {t("dashboard.postNewJob")}
        </Button>
        <Button
          fullWidth
          variant="secondary"
          onClick={() => navigate("/jobs/my")}
          className="flex items-center justify-center gap-2 border border-indigo-100 hover:bg-indigo-50 transition-all"
        >
          <List className="h-5 w-5" />
          {t("dashboard.viewAllJobs")}
        </Button>
      </div>

      {/* Recent Jobs Section */}
      <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-50 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {t("dashboard.recentJobs")}
              </h2>
              <p className="text-xs text-slate-400">
                {t("dashboard.employerTitle")}
              </p>
            </div>
          </div>
          <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
            {recentJobs.length}
          </span>
        </div>

        {recentJobs.length === 0 ? (
          <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-500 text-center font-medium">
            {t("dashboard.noJobs")}
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {recentJobs.map((job) => {
              const statusBorder = {
                OPEN: "border-l-4 border-l-emerald-500",
                ASSIGNED: "border-l-4 border-l-amber-500",
                COMPLETED: "border-l-4 border-l-blue-500",
                SELECTED: "border-l-4 border-l-indigo-500",
                PENDING: "border-l-4 border-l-slate-400",
                REJECTED: "border-l-4 border-l-rose-500",
              }[job.status] || "border-l-4 border-l-slate-300";

              return (
                <div
                  key={job.id}
                  className={`group flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-200 hover:shadow-md ${statusBorder}`}
                  onClick={() => navigate(`/jobs/${job.id}`)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                      {job.title}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-50 px-2 py-0.5 font-medium text-slate-600">
                        <Layers className="h-3 w-3 shrink-0 text-slate-400" />
                        {job.category || t("dashboard.browseJobs")}
                      </span>
                      {job.createdAt && (
                        <span className="inline-flex items-center gap-1 text-slate-400">
                          <Calendar className="h-3.5 w-3.5 shrink-0" />
                          {t("dashboard.postedOn", {
                            date: formatDate(job.createdAt),
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2 text-right">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xxs font-extrabold uppercase tracking-wide ${getStatusTone(
                        job.status,
                      )}`}
                    >
                      {getStatusLabel(job.status, t)}
                    </span>
                    {job.wage != null && (
                      <p className="text-sm font-extrabold text-slate-900 tracking-tight">
                        ₹{numberFormat.format(job.wage)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

