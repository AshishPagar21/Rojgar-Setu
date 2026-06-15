import { prisma } from "../../config/prisma";

export const notificationService = {
  async createNotification(params: {
    userId: number;
    title: string;
    message: string;
    type: string;
  }) {
    return prisma.notification.create({ data: params });
  },

  async getMyNotifications(userId: number) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  },

  async getUnreadCount(userId: number) {
    return prisma.notification.count({ where: { userId, isRead: false } });
  },

  async markAsRead(notificationId: number, userId: number) {
    return prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  },

  async markAllAsRead(userId: number) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  },
};
