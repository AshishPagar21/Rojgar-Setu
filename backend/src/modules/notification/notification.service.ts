import { prisma } from "../../config/prisma";
import { emitToUser, SOCKET_EVENTS } from "../../socket/socket.server";

export const notificationService = {
  async createNotification(params: {
    userId: number;
    title: string;
    message: string;
    type: string;
  }) {
    const notification = await prisma.notification.create({ data: params });

    emitToUser(notification.userId, SOCKET_EVENTS.notificationNew, {
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      createdAt: notification.createdAt.toISOString(),
    });

    return notification;
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
