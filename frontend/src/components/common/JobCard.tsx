import React from "react";
import { useTranslation } from "react-i18next";
import {
  IndianRupee,
  CalendarDays,
  Clock,
  Users,
  Timer,
  Tag,
  MapPin,
  User,
  Star,
  Briefcase,
  HardHat,
  Wrench,
  Sparkles,
  Droplets,
  Zap,
  Hammer,
  PaintRoller,
  Layers,
  ChevronRight,
} from "lucide-react";

interface JobCardProps {
  id: number;
  title: string;
  description?: string;
  locationLine1?: string;
  city?: string;
  landmark?: string;
  location?: string;
  category: string;
  wage: number;
  jobDate: string;
  expectedStartTime?: string;
  expectedEndTime?: string;
  expectedWorkingHours?: number;
  requiredWorkers: number;
  status: "OPEN" | "ASSIGNED" | "COMPLETED" | "CANCELLED";
  employerName: string;
  employerRating?: number;
  distance?: number | null;
  applicationStatus?: string;
  onViewDetails: (jobId: number) => void;
  onSelectWorkers?: (jobId: number) => void;
}

const categoryIcons: Record<string, React.ReactNode> = {
  Construction: <HardHat size={16} />,
  Repairs:      <Wrench size={16} />,
  Cleaning:     <Sparkles size={16} />,
  Plumbing:     <Droplets size={16} />,
  Electrical:   <Zap size={16} />,
  Carpentry:    <Hammer size={16} />,
  Painting:     <PaintRoller size={16} />,
  Masonry:      <Layers size={16} />,
};

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  OPEN:      { bg: "bg-emerald-50 border border-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
  ASSIGNED:  { bg: "bg-amber-50 border border-amber-100", text: "text-amber-700", dot: "bg-amber-500" },
  COMPLETED: { bg: "bg-sky-50 border border-sky-100", text: "text-sky-750", dot: "bg-sky-500" },
  CANCELLED: { bg: "bg-slate-50 border border-slate-200", text: "text-slate-500", dot: "bg-slate-400" },
};

const appStatusConfig: Record<string, { bg: string; text: string }> = {
  APPLIED:   { bg: "bg-indigo-50 text-indigo-700 border border-indigo-100", text: "text-indigo-700" },
  SELECTED:  { bg: "bg-indigo-600 text-white", text: "text-white" },
  REJECTED:  { bg: "bg-rose-50 text-rose-700 border border-rose-100", text: "text-rose-700" },
  COMPLETED: { bg: "bg-sky-50 text-sky-700 border border-sky-100", text: "text-sky-700" },
};

export const JobCard: React.FC<JobCardProps> = ({
  id,
  title,
  description,
  locationLine1,
  city,
  landmark,
  location,
  category,
  wage,
  jobDate,
  expectedStartTime,
  expectedEndTime,
  expectedWorkingHours,
  requiredWorkers,
  status,
  employerName,
  employerRating,
  distance,
  applicationStatus,
  onViewDetails,
  onSelectWorkers,
}) => {
  const { t } = useTranslation();

  const locationDisplay = (() => {
    const parts = [locationLine1, city, landmark].filter(Boolean);
    if (parts.length > 0) return parts.join(", ");
    return location || null;
  })();

  const formattedDate = (() => {
    try {
      return new Date(jobDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return jobDate;
    }
  })();

  const statusStyle    = statusConfig[status] ?? { bg: "bg-slate-50 border border-slate-200", text: "text-slate-600", dot: "bg-slate-400" };
  const appStyle       = applicationStatus ? (appStatusConfig[applicationStatus] ?? { bg: "bg-indigo-50", text: "text-indigo-700" }) : null;
  const categoryIcon   = categoryIcons[category] ?? <Briefcase size={16} />;

  return (
    <div
      className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-300 overflow-hidden cursor-pointer group"
      onClick={() => onViewDetails(id)}
    >
      {/* Top Status Accent Bar */}
      <div
        className={`h-1.5 w-full ${
          status === "OPEN"      ? "bg-gradient-to-r from-emerald-400 to-emerald-500"  :
          status === "ASSIGNED"  ? "bg-gradient-to-r from-amber-400 to-amber-500"  :
          status === "COMPLETED" ? "bg-gradient-to-r from-sky-400 to-sky-500"                                   :
                                   "bg-slate-300"
        }`}
      />

      <div className="p-5">
        {/* Header Area */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Category Icon Badge */}
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-650 flex-shrink-0 border border-indigo-100">
              {categoryIcon}
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-extrabold text-slate-900 leading-snug line-clamp-1 group-hover:text-indigo-600 transition-colors">
                {title}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                <User size={12} className="flex-shrink-0 text-slate-350" />
                <span className="truncate font-medium text-slate-500">{employerName}</span>
                {employerRating !== undefined && employerRating > 0 && (
                  <span className="font-semibold text-amber-500 flex items-center gap-0.5">
                    · <Star size={10.5} className="fill-amber-400 text-amber-400" /> {employerRating.toFixed(1)}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full flex-shrink-0 text-xxs font-extrabold uppercase tracking-wider ${statusStyle.bg} ${statusStyle.text}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
            <span>
              {t(`status.${status}`)}
            </span>
          </div>
        </div>

        {/* Application Status Alert */}
        {appStyle && applicationStatus && (
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-2xl text-xxs font-extrabold uppercase tracking-wide mb-4 ${appStyle.bg} ${appStyle.text}`}>
            <ChevronRight size={10} strokeWidth={2.5} />
            {t(`status.${applicationStatus}`, applicationStatus)}
          </div>
        )}

        {/* Job Description */}
        {description && (
          <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed font-medium">{description}</p>
        )}

        {/* Info Cards Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {/* Wage info box */}
          <div className="flex items-center gap-2.5 bg-indigo-50/50 rounded-2xl px-3 py-2 border border-indigo-50/60">
            <IndianRupee size={15} className="text-indigo-600 flex-shrink-0" />
            <div>
              <p className="text-[9px] text-indigo-500 font-extrabold uppercase tracking-wider leading-none mb-0.5">{t("jobs.wage")}</p>
              <p className="text-sm font-black text-indigo-950">₹{wage}</p>
            </div>
          </div>

          {/* Date info box */}
          <div className="flex items-center gap-2.5 bg-amber-50/50 rounded-2xl px-3 py-2 border border-amber-50/60">
            <CalendarDays size={15} className="text-amber-600 flex-shrink-0" />
            <div>
              <p className="text-[9px] text-amber-500 font-extrabold uppercase tracking-wider leading-none mb-0.5">{t("jobs.jobDate")}</p>
              <p className="text-sm font-black text-amber-950">{formattedDate}</p>
            </div>
          </div>

          {/* Timing details */}
          {expectedStartTime && expectedEndTime && (
            <div className="flex items-center gap-2 bg-slate-50/80 rounded-2xl px-3 py-2 border border-slate-100">
              <Clock size={15} className="text-slate-400 flex-shrink-0" />
              <div>
                <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider leading-none mb-0.5">{t("jobs.timing", "Timing")}</p>
                <p className="text-xs font-bold text-slate-800">{expectedStartTime} – {expectedEndTime}</p>
              </div>
            </div>
          )}

          {/* Required workers count */}
          <div className="flex items-center gap-2 bg-slate-50/80 rounded-2xl px-3 py-2 border border-slate-100">
            <Users size={15} className="text-slate-400 flex-shrink-0" />
            <div>
              <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider leading-none mb-0.5">{t("jobs.requiredWorkers")}</p>
              <p className="text-xs font-bold text-slate-800">{requiredWorkers}</p>
            </div>
          </div>

          {/* Working hours duration */}
          {expectedWorkingHours && (
            <div className="flex items-center gap-2 bg-slate-50/80 rounded-2xl px-3 py-2 border border-slate-100">
              <Timer size={15} className="text-slate-400 flex-shrink-0" />
              <div>
                <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider leading-none mb-0.5">{t("jobs.hours", "Hours")}</p>
                <p className="text-xs font-bold text-slate-800">{expectedWorkingHours}h</p>
              </div>
            </div>
          )}

          {/* Category detail tag */}
          <div className="flex items-center gap-2 bg-slate-50/80 rounded-2xl px-3 py-2 border border-slate-100">
            <Tag size={15} className="text-slate-400 flex-shrink-0" />
            <div>
              <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider leading-none mb-0.5">{t("jobs.category")}</p>
              <p className="text-xs font-bold text-slate-800">{t(`jobs.categories.${category}`, category)}</p>
            </div>
          </div>
        </div>

        {/* Location Info Banner */}
        {locationDisplay && (
          <div className="flex items-start gap-2.5 mb-4 bg-indigo-50/30 border border-indigo-100/50 rounded-2xl px-3 py-2">
            <MapPin size={15} className="text-indigo-500 flex-shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="text-[9px] text-indigo-500 font-extrabold uppercase tracking-wider leading-none mb-0.5">{t("jobDetails.location")}</p>
              <p className="text-xs font-semibold text-indigo-900 line-clamp-2 leading-tight">{locationDisplay}</p>
            </div>
            {distance != null && (
              <span className="flex-shrink-0 text-[10px] font-extrabold text-indigo-750 bg-indigo-50/80 border border-indigo-100 px-2 py-0.5 rounded-full whitespace-nowrap self-center">
                {distance.toFixed(1)} km
              </span>
            )}
          </div>
        )}

        {/* Bottom Actions Area */}
        <div className="flex gap-2 mt-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onViewDetails(id)}
            className="flex-1 h-10 bg-indigo-50 hover:bg-indigo-100/80 text-indigo-700 text-sm font-bold rounded-xl transition-all border border-indigo-100"
          >
            {t("jobs.viewDetails")}
          </button>
          {onSelectWorkers && (
            <button
              onClick={() => onSelectWorkers(id)}
              className="flex-1 h-10 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm shadow-indigo-100 hover:shadow-md"
            >
              {t("jobs.selectWorkersBtn")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

