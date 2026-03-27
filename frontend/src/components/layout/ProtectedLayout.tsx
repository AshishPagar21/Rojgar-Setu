import { Outlet } from "react-router-dom";

import { AppLayout } from "./AppLayout";

export const ProtectedLayout = () => {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
};
