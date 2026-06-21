import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Button } from "../../components/common/Button";
import { LanguageSwitcher } from "../../components/common/LanguageSwitcher";
import { PageHeader } from "../../components/common/PageHeader";
import { useAuth } from "../../hooks/useAuth";
import { routePaths } from "../../routes/routePaths";
import { authService } from "../../modules/auth/auth.service";


export const ProfilePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, token, profile, setAuthData } = useAuth();
  const [loading, setLoading] = useState(!profile);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchLatestProfile = async () => {
      if (!token) return;
      setRefreshing(true);
      try {
        const data = await authService.getProfile();
        setAuthData({
          token,
          user: data.user,
          profile: data.profile,
        });
      } catch (err) {
        console.error("Failed to refresh profile details:", err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

    fetchLatestProfile();
  }, [token, setAuthData]);

  const name = useMemo(() => {
    if (profile?.employer?.name) return profile.employer.name;
    if (profile?.worker?.name) return profile.worker.name;
    return t("common.notAvailable");
  }, [profile]);

  const role = user?.role
    ? user.role === "ADMIN"
      ? t("dashboard.adminFallback")
      : user.role === "EMPLOYER"
      ? t("auth.roleEmployer")
      : t("auth.roleWorker")
    : t("common.notAvailable");

  const ratingValue = useMemo(() => {
    if (user?.role === "EMPLOYER") return profile?.employer?.rating ?? 0;
    if (user?.role === "WORKER") return profile?.worker?.rating ?? 0;
    return 0;
  }, [profile, user]);

  const totalRatings = useMemo(() => {
    if (user?.role === "EMPLOYER") return profile?.employer?.totalRatings ?? 0;
    if (user?.role === "WORKER") return profile?.worker?.totalRatings ?? 0;
    return 0;
  }, [profile, user]);

  const reliabilityScore = useMemo(() => {
    if (user?.role === "WORKER") return profile?.worker?.reliabilityScore ?? 100;
    return 100;
  }, [profile, user]);

  const age = profile?.worker?.age;
  const gender = profile?.worker?.gender;

  const quickActions = useMemo(() => {
    if (user?.role === "EMPLOYER") {
      return [
        { label: t("common.postJob"), onClick: () => navigate("/jobs/create") },
        { label: t("common.myJobs"), onClick: () => navigate("/jobs/my") },
      ];
    }

    if (user?.role === "WORKER") {
      return [
        { label: t("common.findWork"), onClick: () => navigate("/jobs/open") },
        {
          label: t("common.myApplications"),
          onClick: () => navigate("/applications/my"),
        },
      ];
    }

    return [
      {
        label: t("common.dashboard"),
        onClick: () => navigate(routePaths.dashboardAdmin),
      },
    ];
  }, [navigate, t, user?.role]);

  const renderRatingStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    const stars = [];

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<span key={i} className="text-amber-400">★</span>);
      } else if (i === fullStars + 1 && hasHalf) {
        stars.push(<span key={i} className="text-amber-400">★</span>);
      } else {
        stars.push(<span key={i} className="text-slate-200">★</span>);
      }
    }

    return <div className="flex gap-0.5 text-base">{stars}</div>;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-brand-600"></div>
        <p className="text-sm font-medium text-slate-500">{t("profile.loadingProfile")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <PageHeader
        title={t("common.profile")}
        subtitle={t("common.accountDetails")}
      />

      {/* HERO COVER PROFILE CARD (LIGHT THEME) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-50/70 via-brand-100/30 to-amber-50/20 p-6 text-slate-800 border border-brand-100/80 shadow-sm">
        {/* Subtle background glow */}
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-brand-500/5 blur-3xl"></div>
        
        {/* Refreshing loader */}
        {refreshing && (
          <div className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full bg-slate-200/50 px-2.5 py-1 text-[10px] font-semibold text-slate-650 backdrop-blur-sm border border-slate-250/20">
            <div className="h-2.5 w-2.5 animate-spin rounded-full border-2 border-slate-400 border-t-slate-600"></div>
            {t("profile.syncing")}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          {/* Avatar Circle */}
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-2xl font-bold uppercase tracking-wider text-white border border-brand-700/10 shadow-md">
            {name.charAt(0)}
          </div>

          <div className="text-center sm:text-left space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h2 className="text-xl font-bold text-slate-900 leading-tight">{name}</h2>
              <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-brand-850 border border-brand-200/60">
                {role}
              </span>
            </div>
            
            <p className="text-xs text-slate-600 font-semibold mt-0.5">
              {t("common.mobileNumber")}: {user?.mobileNumber}
            </p>
                   {/* Average Rating Stars Row */}
            {user?.role !== "ADMIN" && (
              <div className="mt-2 flex items-center justify-center sm:justify-start gap-2">
                {renderRatingStars(ratingValue)}
                <span className="text-xs font-bold text-slate-655">
                  {ratingValue > 0 ? `${ratingValue.toFixed(1)} / 5.0` : t("profile.noRatings")}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Statistics Section */}
        {user?.role !== "ADMIN" && (
          <div className="mt-6 pt-5 border-t border-brand-200/40">
            {user?.role === "WORKER" ? (
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-white p-3.5 text-center border border-brand-100 shadow-xs">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{t("profile.rating")}</p>
                  <p className="mt-1 text-base font-black text-amber-550">
                    ★ {ratingValue > 0 ? ratingValue.toFixed(1) : "—"}
                  </p>
                  <p className="text-[9px] text-slate-400 font-semibold mt-0.5">{t("profile.reviewsCount", { count: totalRatings })}</p>
                </div>

                <div className="rounded-2xl bg-white p-3.5 text-center border border-brand-100 shadow-xs">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{t("profile.jobsDone")}</p>
                  <p className="mt-1 text-base font-black text-slate-800">
                    {profile?.worker?.totalJobsCompleted ?? 0}
                  </p>
                  <p className="text-[9px] text-slate-400 font-semibold mt-0.5">{t("profile.completed")}</p>
                </div>

                <div className="rounded-2xl bg-white p-3.5 text-center border border-brand-100 shadow-xs">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{t("profile.reliability")}</p>
                  <p className={`mt-1 text-base font-black ${
                    reliabilityScore >= 80 ? "text-emerald-600" : reliabilityScore >= 50 ? "text-amber-550" : "text-red-500"
                  }`}>
                    {reliabilityScore}%
                  </p>
                  <p className="text-[9px] text-slate-400 font-semibold mt-0.5">{t("profile.overallScore")}</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-white p-3.5 text-center border border-brand-100 shadow-xs">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{t("profile.rating")}</p>
                  <p className="mt-1 text-base font-black text-amber-550">
                    ★ {ratingValue > 0 ? ratingValue.toFixed(1) : "—"}
                  </p>
                  <p className="text-[9px] text-slate-400 font-semibold mt-0.5">{t("profile.reviewsCount", { count: totalRatings })}</p>
                </div>

                <div className="rounded-2xl bg-white p-3.5 text-center border border-brand-100 shadow-xs">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{t("profile.jobsPosted")}</p>
                  <p className="mt-1 text-base font-black text-slate-800">
                    {profile?.employer?.totalJobsPosted ?? 0}
                  </p>
                  <p className="text-[9px] text-slate-400 font-semibold mt-0.5">{t("profile.totalPosted")}</p>
                </div>

                <div className="rounded-2xl bg-white p-3.5 text-center border border-brand-100 shadow-xs">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{t("profile.completed")}</p>
                  <p className="mt-1 text-base font-black text-slate-800">
                    {profile?.employer?.totalJobsCompleted ?? 0}
                  </p>
                  <p className="text-[9px] text-slate-400 font-semibold mt-0.5">{t("profile.finishedJobs")}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* QUICK ACTIONS & SETTINGS SECTION */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-slate-800">
            {t("common.quickActions")}
          </p>
          <div className="mt-3 space-y-2">
            {quickActions.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={action.onClick}
                className="block w-full rounded-2xl border border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:border-brand-350 hover:bg-brand-50/40 focus:outline-none"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-slate-800">
            {t("common.settings")}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {t("common.languageSettingHint")}
          </p>
          <div className="mt-3 rounded-2xl bg-slate-50 p-2.5">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
      {/* DETAILED PERSONAL INFORMATION TABLE (WITH INLINE SVG ICONS INSTEAD OF EMOJIS) */}
      <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-slate-800">{t("profile.personalInfo")}</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          
          {/* Full Name */}
          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50/60 border border-slate-100/50">
            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-brand-50 border border-brand-100 text-brand-650 shrink-0">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">{t("profile.fullName")}</p>
              <p className="text-sm font-bold text-slate-800">{name}</p>
            </div>
          </div>

          {/* Mobile Number */}
          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50/60 border border-slate-100/50">
            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-brand-50 border border-brand-100 text-brand-650 shrink-0">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.73.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">{t("profile.mobileNumber")}</p>
              <p className="text-sm font-bold text-slate-800">{user?.mobileNumber ?? "—"}</p>
            </div>
          </div>

          {/* Account Role */}
          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50/60 border border-slate-100/50">
            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-brand-50 border border-brand-100 text-brand-650 shrink-0">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">{t("profile.accountRole")}</p>
              <p className="text-sm font-bold text-slate-800">{role}</p>
            </div>
          </div>

          {/* Age (Worker only) */}
          {user?.role === "WORKER" && age !== undefined && (
            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50/60 border border-slate-100/50">
              <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-brand-50 border border-brand-100 text-brand-655 shrink-0">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">{t("profile.age")}</p>
                <p className="text-sm font-bold text-slate-800">{t("profile.ageValue", { count: age })}</p>
              </div>
            </div>
          )}

          {/* Gender (Worker only) */}
          {user?.role === "WORKER" && gender && (
            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50/60 border border-slate-100/50">
              <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-brand-50 border border-brand-100 text-brand-655 shrink-0">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">{t("profile.gender")}</p>
                <p className="text-sm font-bold text-slate-800">
                  {gender === "MALE" ? t("profile.male") : gender === "FEMALE" ? t("profile.female") : t("profile.other")}
                </p>
              </div>
            </div>
          )}

          {/* Account Status */}
          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50/60 border border-slate-100/50">
            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-brand-50 border border-brand-100 text-brand-655 shrink-0">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">{t("profile.accountStatus")}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <p className="text-sm font-bold text-slate-800">
                  {user?.isActive ? t("profile.active") : t("profile.inactive")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Button
        fullWidth
        variant="outline"
        onClick={() => navigate(routePaths.root)}
      >
        {t("common.goHome")}
      </Button>
    </div>
  );
};
