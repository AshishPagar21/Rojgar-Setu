import { io, type Socket } from "socket.io-client";

import { authStorage } from "../modules/auth/auth.storage";

export type NotificationSocketPayload = {
  id: number;
  title: string;
  message: string;
  type: string;
  createdAt: string;
};

export type AttendanceSocketPayload = {
  id: number;
  jobId: number;
  workerId: number;
  status: string;
  checkInTime?: string;
  checkOutTime?: string;
  totalHours?: number | null;
  reviewedAt?: string | null;
  notes?: string | null;
};

export type DisputeSocketPayload = {
  id: number;
  jobId: number;
  attendanceId?: number | null;
  workerId?: number | null;
  employerId?: number | null;
  raisedById: number;
  reason: string;
  description: string;
  status: string;
  createdAt: string;
};

const getSocketBaseUrl = () => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;

  if (!apiBaseUrl) {
    return window.location.origin;
  }

  return apiBaseUrl.replace(/\/api\/?$/, "");
};

let socket: Socket | null = null;

const getSocket = (): Socket | null => socket;

const connect = (token?: string | null): Socket | null => {
  const authToken = token ?? authStorage.getToken();

  if (!authToken) {
    disconnect();
    return null;
  }

  const socketAuth = socket?.auth as { token?: string } | undefined;

  if (socket?.connected && socketAuth?.token === authToken) {
    return socket;
  }

  if (socket) {
    socket.disconnect();
    socket = null;
  }

  socket = io(getSocketBaseUrl(), {
    transports: ["websocket"],
    autoConnect: true,
    auth: {
      token: authToken,
    },
  });

  return socket;
};

const disconnect = () => {
  if (!socket) {
    return;
  }

  socket.disconnect();
  socket = null;
};

const on = <T>(event: string, handler: (payload: T) => void) => {
  socket?.on(event, handler);
};

const off = <T>(event: string, handler: (payload: T) => void) => {
  socket?.off(event, handler);
};

const emit = <T>(event: string, data: T) => {
  socket?.emit(event, data);
};

export const socketService = {
  connect,
  disconnect,
  on,
  off,
  emit,
  getSocket,
};
