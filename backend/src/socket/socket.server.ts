import type { Server as HttpServer } from "http";

import { Server as SocketIOServer } from "socket.io";

import { verifyToken } from "../utils/jwt";

type SocketAuthPayload = {
  userId: number;
  role: string;
  mobileNumber: string;
};

type SocketData = {
  user?: SocketAuthPayload;
};

const USER_ROOM_PREFIX = "user:";

let socketServer: SocketIOServer | null = null;

export const SOCKET_EVENTS = {
  attendanceCheckedIn: "attendance:checked-in",
  attendanceCheckedOut: "attendance:checked-out",
  attendanceApproved: "attendance:approved",
  attendanceIssueReported: "attendance:issue-reported",
  notificationNew: "notification:new",
  disputeCreated: "dispute:created",
  disputeUpdated: "dispute:updated",
} as const;

const extractToken = (value?: string): string | null => {
  if (!value) {
    return null;
  }

  if (value.startsWith("Bearer ")) {
    return value.replace("Bearer ", "").trim() || null;
  }

  return value.trim() || null;
};

export const initializeSocketServer = (
  httpServer: HttpServer,
): SocketIOServer => {
  socketServer = new SocketIOServer(httpServer, {
    cors: {
      origin: true,
      credentials: true,
    },
  });

  socketServer.use((socket, next) => {
    try {
      const rawToken =
        socket.handshake.auth?.token ?? socket.handshake.headers.authorization;
      const token = extractToken(rawToken);

      if (!token) {
        return next(new Error("Unauthorized socket connection"));
      }

      const payload = verifyToken(token);

      (socket.data as SocketData).user = {
        userId: payload.userId,
        role: payload.role,
        mobileNumber: payload.mobileNumber,
      };

      return next();
    } catch (_error) {
      return next(new Error("Unauthorized socket connection"));
    }
  });

  socketServer.on("connection", (socket) => {
    const user = (socket.data as SocketData).user;

    if (!user) {
      socket.disconnect(true);
      return;
    }

    socket.join(`${USER_ROOM_PREFIX}${user.userId}`);
  });

  return socketServer;
};

export const getSocketServer = (): SocketIOServer | null => socketServer;

export const emitToUser = <T>(
  userId: number,
  event: string,
  payload: T,
): void => {
  socketServer?.to(`${USER_ROOM_PREFIX}${userId}`).emit(event, payload);
};

export const emitToUsers = <T>(
  userIds: number[],
  event: string,
  payload: T,
): void => {
  userIds.forEach((userId) => emitToUser(userId, event, payload));
};
