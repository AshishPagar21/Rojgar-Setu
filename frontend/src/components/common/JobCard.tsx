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
  Construction: <HardHat size={18} />,
  Repairs:      <Wrench size={18} />,
  Cleaning:     <Sparkles size={18} />,
  Plumbing:     <Droplets size={18} />,
  Electrical:   <Zap size={18} />,
  Carpentry:    <Hammer size={18} />,
  Painting:     <PaintRoller size={18} />,
  Masonry:      <Layers size={18} />,
};

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  OPEN:      { bg: "bg-brand-50",   text: "text-brand-600", dot: "bg-brand-500" },
  ASSIGNED:  { bg: "bg-brand-100",  text: "text-brand-700", dot: "bg-brand-600" },
  COMPLETED: { bg: "bg-brand-800",  text: "text-white",     dot: "bg-brand-300" },
  CANCELLED: { bg: "bg-slate-100",  text: "text-slate-500", dot: "bg-slate-400" },
};

const appStatusConfig: Record<string, { bg: string; text: string }> = {
  APPLIED:   { bg: "bg-brand-50",  text: "text-brand-600" },
  SELECTED:  { bg: "bg-brand-500", text: "text-white"     },
  REJECTED:  { bg: "bg-slate-100", text: "text-slate-600" },
  COMPLETED: { bg: "bg-brand-800", text: "text-white"     },
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

  const statusStyle    = statusConfig[status] ?? { bg: "bg-slate-50", text: "text-slate-600", dot: "bg-slate-400" };
  const appStyle       = applicationStatus ? (appStatusConfig[applicationStatus] ?? { bg: "bg-brand-50", text: "text-brand-600" }) : null;
  const categoryIcon   = categoryIcons[category] ?? <Briefcase size={18} />;

  return (
    <div
      className="bg-white rounded-2xl border border-brand-100 shadow-sm hover:shadow-lg hover:border-brand-200 transition-all duration-200 overflow-hidden cursor-pointer group"
      onClick={() => onViewDetails(id)}
    >
      {/* Status accent bar — brand shades */}
      <div
        className={`h-1 w-full ${
          status === "OPEN"      ? "bg-gradient-to-r from-brand-400 to-brand-500"  :
          status === "ASSIGNED"  ? "bg-gradient-to-r from-brand-500 to-brand-700"  :
          status === "COMPLETED" ? "bg-brand-800"                                   :
                                   "bg-slate-300"
        }`}
      />

      <div className="p-4">
        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Category icon tile — brand-50 background */}
            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-500 flex-shrink-0 border border-brand-100">
              {categoryIcon}
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-slate-900 leading-tight line-clamp-1 group-hover:text-brand-600 transition-colors">
                {title}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                <User size={11} className="flex-shrink-0" />
                <span className="truncate">{employerName}</span>
                {employerRating !== undefined && employerRating > 0 && (
                  <span className="font-medium text-brand-400 flex items-center gap-0.5">
                    · <Star size={10} className="fill-brand-400 text-brand-400" /> {employerRating.toFixed(1)}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Status badge */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full flex-shrink-0 ${statusStyle.bg}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
            <span className={`text-xs font-semibold ${statusStyle.text}`}>
              {t(`status.${status}`)}
            </span>
          </div>
        </div>

        {/* Application status pill */}
        {appStyle && applicationStatus && (
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium mb-3 ${appStyle.bg} ${appStyle.text}`}>
            <ChevronRight size={10} />
            {t(`status.${applicationStatus}`, applicationStatus)}
          </div>
        )}

        {/* Description */}
        {description && (
          <p className="text-xs text-slate-500 mb-3 line-clamp-2 leading-relaxed">{description}</p>
        )}

        {/* ── Info tiles — all brand shades ── */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {/* Wage — brand-50 / brand-600 */}
          <div className="flex items-center gap-2 bg-brand-50 rounded-xl px-3 py-2">
            <IndianRupee size={15} className="text-brand-500 flex-shrink-0" />
            <div>
              <p className="text-[10px] text-brand-500 font-semibold uppercase tracking-wide">{t("jobs.wage")}</p>
              <p className="text-sm font-bold text-brand-700">₹{wage}</p>
            </div>
          </div>

          {/* Date — brand-100 / brand-700 */}
          <div className="flex items-center gap-2 bg-brand-100 rounded-xl px-3 py-2">
            <CalendarDays size={15} className="text-brand-600 flex-shrink-0" />
            <div>
              <p className="text-[10px] text-brand-600 font-semibold uppercase tracking-wide">{t("jobs.jobDate")}</p>
              <p className="text-sm font-bold text-brand-800">{formattedDate}</p>
            </div>
          </div>

          {/* Timing — brand-150 / brand-700 */}
          {expectedStartTime && expectedEndTime && (
            <div className="flex items-center gap-2 bg-brand-150 rounded-xl px-3 py-2">
              <Clock size={15} className="text-brand-600 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-brand-600 font-semibold uppercase tracking-wide">{t("jobs.timing", "Timing")}</p>
                <p className="text-sm font-bold text-brand-800">{expectedStartTime} – {expectedEndTime}</p>
              </div>
            </div>
          )}

          {/* Workers — brand-200 / brand-800 */}
          <div className="flex items-center gap-2 bg-brand-200 rounded-xl px-3 py-2">
            <Users size={15} className="text-brand-600 flex-shrink-0" />
            <div>
              <p className="text-[10px] text-brand-700 font-semibold uppercase tracking-wide">{t("jobs.requiredWorkers")}</p>
              <p className="text-sm font-bold text-brand-800">{requiredWorkers}</p>
            </div>
          </div>

          {/* Hours — brand-100 */}
          {expectedWorkingHours && (
            <div className="flex items-center gap-2 bg-brand-100 rounded-xl px-3 py-2">
              <Timer size={15} className="text-brand-600 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-brand-600 font-semibold uppercase tracking-wide">{t("jobs.hours", "Hours")}</p>
                <p className="text-sm font-bold text-brand-800">{expectedWorkingHours}h</p>
              </div>
            </div>
          )}

          {/* Category — slate-50 with brand icon */}
          <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2 border border-brand-50">
            <Tag size={15} className="text-brand-400 flex-shrink-0" />
            <div>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">{t("jobs.category")}</p>
              <p className="text-sm font-bold text-slate-700">{t(`jobs.categories.${category}`, category)}</p>
            </div>
          </div>
        </div>

        {/* Location — brand-50 with brand-600 icon */}
        {locationDisplay && (
          <div className="flex items-start gap-2 mb-3 bg-brand-50 border border-brand-100 rounded-xl px-3 py-2">
            <MapPin size={15} className="text-brand-500 flex-shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-brand-500 font-semibold uppercase tracking-wide">{t("jobDetails.location")}</p>
              <p className="text-xs font-medium text-brand-700 line-clamp-2">{locationDisplay}</p>
            </div>
            {distance != null && (
              <span className="flex-shrink-0 text-[10px] font-bold text-brand-600 bg-brand-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                {distance.toFixed(1)} km
              </span>
            )}
          </div>
        )}

        {/* ── Action buttons ── */}
        <div className="flex gap-2 mt-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onViewDetails(id)}
            className="flex-1 h-10 bg-brand-50 hover:bg-brand-100 text-brand-600 text-sm font-semibold rounded-xl transition-colors border border-brand-100"
          >
            {t("jobs.viewDetails")}
          </button>
          {onSelectWorkers && (
            <button
              onClick={() => onSelectWorkers(id)}
              className="flex-1 h-10 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
            >
              {t("jobs.selectWorkersBtn")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
