import { useEffect } from "react";
import type { ReactNode } from "react";

import { AppNavbar } from "./AppNavbar";
import { BottomNav } from "./BottomNav";
import { useAuth } from "../../hooks/useAuth";
import { getCurrentLocation } from "../../utils/geolocation";
import { socketService } from "../../services/socket.service";

export const AppLayout = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();

  useEffect(() => {
    if (user?.role !== "WORKER") return;

    const reportLocation = async () => {
      try {
        const loc = await getCurrentLocation();
        socketService.emit("location:update", {
          latitude: loc.latitude,
          longitude: loc.longitude,
        });
      } catch (err) {
        console.error("Failed to report location to socket server", err);
      }
    };

    reportLocation();

    const interval = setInterval(reportLocation, 60000);

    const handleConnect = () => {
      reportLocation();
    };

    const socket = socketService.getSocket();
    if (socket) {
      socket.on("connect", handleConnect);
    }

    return () => {
      clearInterval(interval);
      if (socket) {
        socket.off("connect", handleConnect);
      }
    };
  }, [user]);

  return (
    <div className="min-h-screen bg-slate-50">
      <AppNavbar />

      {/* pb-24 leaves room above the bottom nav bar */}
      <div className="px-4 py-5 pb-24">
        <div className="mx-auto w-full max-w-md">{children}</div>
      </div>

      <BottomNav />
    </div>
  );
};
