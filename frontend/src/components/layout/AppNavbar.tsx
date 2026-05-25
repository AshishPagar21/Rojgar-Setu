import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useAuth } from "../../hooks/useAuth";
import { routePaths } from "../../routes/routePaths";
import { LanguageSwitcher } from "../common/LanguageSwitcher";

const roleLabel: Record<string, string> = {
  ADMIN: "Admin",
  EMPLOYER: "Employer",
  WORKER: "Worker",
};

export const AppNavbar = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, profile, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const displayName = useMemo(() => {
    if (profile?.employer?.name) return profile.employer.name;
    if (profile?.worker?.name) return profile.worker.name;
    return user?.mobileNumber ?? t("common.user");
  }, [profile, user]);

  const userRoleLabel = user?.role ? roleLabel[user.role] : t("common.user");

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

  const goToProfile = () => {
    setMenuOpen(false);
    navigate(routePaths.profile);
  };

  const goToDashboard = () => {
    setMenuOpen(false);
    navigate(
      user?.role === "EMPLOYER"
        ? routePaths.dashboardEmployer
        : user?.role === "WORKER"
          ? routePaths.dashboardWorker
          : routePaths.dashboardAdmin,
    );
  };

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate(routePaths.login, { replace: true });
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <nav className="sticky top-0 z-20 mb-4 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
      <div className="mx-auto flex w-full max-w-md items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate(routePaths.root)}
          className="flex items-center gap-3 text-left"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-amber-500 text-white shadow-sm">
            <span className="text-lg font-black">R</span>
          </div>
          <div>
            <p className="text-sm font-bold tracking-wide text-slate-900">
              {t("common.appName")}
            </p>
            <p className="text-xs text-slate-500">{t("common.subtitle")}</p>
          </div>
        </button>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 shadow-sm transition hover:bg-slate-100"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label={t("common.accountMenu")}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              className="h-6 w-6"
            >
              <path
                d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z"
                fill="currentColor"
              />
            </svg>
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-3 w-80 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
              <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-4">
                <p className="text-sm font-semibold text-slate-900 line-clamp-1">
                  {displayName}
                </p>
                <p className="mt-1 text-xs text-slate-500">{userRoleLabel}</p>
              </div>

              <div className="p-2">
                <button
                  type="button"
                  onClick={goToProfile}
                  className="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  <span>{t("common.profile")}</span>
                  <span className="text-xs text-slate-400">
                    {t("common.account")}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={goToDashboard}
                  className="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  <span>{t("common.dashboard")}</span>
                  <span className="text-xs text-slate-400">
                    {t("common.goTo")}
                  </span>
                </button>

                <div className="mt-2 rounded-2xl bg-slate-50 px-3 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {t("common.settings")}
                  </p>
                  <div className="mt-3">
                    <LanguageSwitcher />
                  </div>
                </div>

                <div className="mt-2 rounded-2xl bg-brand-50 px-3 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {t("common.quickActions")}
                  </p>
                  <div className="mt-2 space-y-1">
                    {quickActions.map((action) => (
                      <button
                        key={action.label}
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          action.onClick();
                        }}
                        className="block w-full rounded-xl px-3 py-2 text-left text-sm text-brand-700 transition hover:bg-white"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-2 flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left text-sm text-rose-600 transition hover:bg-rose-50"
                >
                  <span>{t("common.logout")}</span>
                  <span className="text-xs text-rose-400">
                    {t("common.signOut")}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
