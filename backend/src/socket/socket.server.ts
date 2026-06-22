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

export const activeWorkerLocations = new Map<number, { latitude: number; longitude: number }>();


export const SOCKET_EVENTS = {
  attendanceCheckedIn: "attendance:checked-in",
  attendanceCheckedOut: "attendance:checked-out",
  attendanceApproved: "attendance:approved",
  attendanceIssueReported: "attendance:issue-reported",
  notificationNew: "notification:new",
  disputeCreated: "dispute:created",
  disputeUpdated: "dispute:updated",
  disputeCountered: "dispute:countered",
  paymentPaid: "payment:paid",
  paymentConfirmed: "payment:confirmed",
  jobNew: "job:new",
  jobApplied: "job:applied",
  jobUpdated: "job:updated",
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
        console.log("[Socket] Connection rejected: No token provided");
        return next(new Error("Unauthorized socket connection"));
      }

      const payload = verifyToken(token);

      (socket.data as SocketData).user = {
        userId: payload.userId,
        role: payload.role,
        mobileNumber: payload.mobileNumber,
      };

      console.log(`[Socket] Authentication successful for User ID: ${payload.userId}`);
      return next();
    } catch (error) {
      console.error("[Socket] Authentication failed:", error);
      return next(new Error("Unauthorized socket connection"));
    }
  });

  socketServer.on("connection", (socket) => {
    const user = (socket.data as SocketData).user;
    console.log(`[Socket] New connection established. User ID: ${user?.userId}, Role: ${user?.role}`);

    if (!user) {
      console.log(`[Socket] Connection rejected: No user payload in socket.data`);
      socket.disconnect(true);
      return;
    }

    socket.join(`${USER_ROOM_PREFIX}${user.userId}`);
    console.log(`[Socket] User ${user.userId} joined room: ${USER_ROOM_PREFIX}${user.userId}`);

    if (user.role === "WORKER") {
      socket.on("location:update", (coords: { latitude: number; longitude: number }) => {
        if (coords && typeof coords.latitude === "number" && typeof coords.longitude === "number") {
          activeWorkerLocations.set(user.userId, {
            latitude: coords.latitude,
            longitude: coords.longitude,
          });
        }
      });
    }

    socket.on("disconnect", () => {
      if (user.role === "WORKER") {
        const roomName = `${USER_ROOM_PREFIX}${user.userId}`;
        const roomClients = socketServer?.sockets.adapter.rooms.get(roomName);
        if (!roomClients || roomClients.size === 0) {
          activeWorkerLocations.delete(user.userId);
        }
      }
    });
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
