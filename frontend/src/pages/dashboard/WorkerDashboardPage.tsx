import { Button } from "../../components/common/Button";
import { PageHeader } from "../../components/common/PageHeader";
import { useAuth } from "../../hooks/useAuth";

export const WorkerDashboardPage = () => {
  const { user, profile, logout } = useAuth();

  return (
    <div className="mx-auto w-full max-w-md rounded-panel bg-white p-5 shadow-panel">
      <PageHeader
        title="Worker Dashboard"
        subtitle={`Welcome ${profile?.worker?.name || user?.mobileNumber || ""}`}
      />
      <p className="mb-5 text-sm text-slate-600">
        Job updates will appear here.
      </p>
      <Button fullWidth onClick={logout}>
        Logout
      </Button>
    </div>
  );
};
