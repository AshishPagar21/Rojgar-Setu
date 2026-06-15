import { useEffect, useState } from "react";

import { PageHeader } from "../../components/common/PageHeader";
import { StatusBadge } from "../../components/common/StatusBadge";
import { notificationService } from "../../modules/notification/notification.service";

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true);
        const data = await notificationService.getMyNotifications();
        setNotifications(data);
      } catch (err) {
        setError("Failed to load notifications");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
  };

  if (loading) {
    return <div className="py-12 text-center text-slate-600">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        subtitle="Latest updates from your jobs"
      />

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleMarkAllRead}
          className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Mark all read
        </button>
      </div>

      {error && (
        <div className="rounded bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {notifications.length === 0 ? (
        <div className="rounded-panel bg-white p-8 text-center shadow-panel">
          <p className="text-slate-600">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`rounded-panel bg-white p-4 shadow-panel ${notification.isRead ? "opacity-70" : "border border-brand-200"}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <p className="font-semibold text-slate-900">
                    {notification.title}
                  </p>
                  <p className="text-sm text-slate-600">
                    {notification.message}
                  </p>
                  <div className="flex items-center gap-2">
                    <StatusBadge
                      status={
                        notification.type === "PAYMENT_COMPLETED"
                          ? "COMPLETED"
                          : "PENDING"
                      }
                    />
                    <span className="text-xs text-slate-400">
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
                {!notification.isRead ? (
                  <button
                    type="button"
                    onClick={async () => {
                      await notificationService.markAsRead(notification.id);
                      setNotifications((prev) =>
                        prev.map((item) =>
                          item.id === notification.id
                            ? { ...item, isRead: true }
                            : item,
                        ),
                      );
                    }}
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700"
                  >
                    Mark read
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
