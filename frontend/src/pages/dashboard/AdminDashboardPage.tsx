import { Button } from "../../components/common/Button";
import { PageHeader } from "../../components/common/PageHeader";
import { useAuth } from "../../hooks/useAuth";

export const AdminDashboardPage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="mx-auto w-full max-w-md rounded-panel bg-white p-5 shadow-panel">
      <PageHeader
        title="Admin Dashboard"
        subtitle={`Welcome ${user?.mobileNumber || "Admin"}`}
      />
      <p className="mb-5 text-sm text-slate-600">
        Admin tools will be added here.
      </p>
      <Button fullWidth onClick={logout}>
        Logout
      </Button>
    </div>
  );
};
