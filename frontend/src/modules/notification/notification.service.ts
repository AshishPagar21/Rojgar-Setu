import { apiClient } from "../../services/apiClient";

export const notificationService = {
  async getMyNotifications() {
    const response = await apiClient.get("/notifications/my");
    return response.data.data;
  },

  async getUnreadCount() {
    const response = await apiClient.get("/notifications/unread-count");
    return response.data.data as { unreadCount: number };
  },

  async markAsRead(notificationId: number) {
    const response = await apiClient.patch(
      `/notifications/${notificationId}/read`,
    );
    return response.data.data;
  },

  async markAllAsRead() {
    const response = await apiClient.patch("/notifications/read-all");
    return response.data.data;
  },
};
