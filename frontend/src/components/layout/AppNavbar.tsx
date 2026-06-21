import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useAuth } from "../../hooks/useAuth";
import { notificationService } from "../../modules/notification/notification.service";
import { routePaths } from "../../routes/routePaths";
import {
  socketService,
  type NotificationSocketPayload,
} from "../../services/socket.service";
import { LanguageSwitcher } from "../common/LanguageSwitcher";
import { getLocalizedNotification } from "../../utils/notificationUtils";

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
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const notificationsRef = useRef<HTMLDivElement | null>(null);

  const displayName = useMemo(() => {
    if (profile?.employer?.name) return profile.employer.name;
    if (profile?.worker?.name) return profile.worker.name;
    return user?.mobileNumber ?? t("common.user");
  }, [profile, user, t]);

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
    const loadNotifications = async () => {
      try {
        const [countData, notificationsData] = await Promise.all([
          notificationService.getUnreadCount(),
          notificationService.getMyNotifications(),
        ]);
        setUnreadCount(countData.unreadCount);
        setNotifications(notificationsData.slice(0, 5));
      } catch (error) {
        console.error(error);
      }
    };

    loadNotifications();
  }, []);

  useEffect(() => {
    const handleNewNotification = (payload: NotificationSocketPayload) => {
      setUnreadCount((prev) => prev + 1);
      setNotifications((prev) =>
        [
          {
            ...payload,
            isRead: false,
          },
          ...prev.filter((item) => item.id !== payload.id),
        ].slice(0, 5),
      );
    };

    socketService.on("notification:new", handleNewNotification);

    return () => {
      socketService.off("notification:new", handleNewNotification);
    };
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
      if (!notificationsRef.current?.contains(event.target as Node)) {
        setNotificationsOpen(false);
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

        <div className="flex items-center gap-2">
          {user?.role !== "ADMIN" && (
            <div className="relative" ref={notificationsRef}>
              <button
                type="button"
                className="relative flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 shadow-sm transition hover:bg-slate-100"
                onClick={() => setNotificationsOpen((prev) => !prev)}
                aria-label="Notifications"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                  className="h-6 w-6"
                >
                  <path
                    d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7-6V11a7 7 0 1 0-14 0v5l-2 2v1h18v-1Z"
                    fill="currentColor"
                  />
                </svg>
                {unreadCount > 0 ? (
                  <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                ) : null}
              </button>

              {notificationsOpen ? (
                <div className="absolute right-0 mt-3 w-80 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
                  <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-4">
                    <p className="text-sm font-semibold text-slate-900">
                      {t("notifications.title")}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {t("notifications.latestUpdates")}
                    </p>
                  </div>
                  <div className="max-h-96 overflow-auto p-2">
                    {notifications.length === 0 ? (
                      <p className="rounded-2xl bg-slate-50 px-3 py-4 text-sm text-slate-500">
                        {t("notifications.noNotifications")}
                      </p>
                    ) : (
                      notifications.map((item) => {
                        const localized = getLocalizedNotification(item, t);
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={async () => {
                              await notificationService.markAsRead(item.id);
                              setUnreadCount((prev) => Math.max(prev - 1, 0));
                              setNotifications((prev) =>
                                prev.map((notification) =>
                                  notification.id === item.id
                                    ? { ...notification, isRead: true }
                                    : notification,
                                ),
                              );
                            }}
                            className="block w-full rounded-2xl px-3 py-3 text-left transition hover:bg-slate-50"
                          >
                            <p className="text-sm font-semibold text-slate-900">
                              {localized.title}
                            </p>
                            <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                              {localized.message}
                            </p>
                            <p className="mt-2 text-[11px] text-slate-400">
                              {new Date(item.createdAt).toLocaleString()}
                            </p>
                          </button>
                        );
                      })
                    )}
                  </div>
                  <div className="border-t border-slate-100 p-2">
                    <button
                      type="button"
                      onClick={() => {
                        setNotificationsOpen(false);
                        navigate(routePaths.notifications);
                      }}
                      className="w-full rounded-2xl px-3 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
                    >
                      {t("notifications.viewAll")}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          )}

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

            {menuOpen ? (
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
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  );
};
