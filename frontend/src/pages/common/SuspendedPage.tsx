import { useTranslation } from "react-i18next";
import { ShieldAlert, LogOut, PhoneCall } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/common/Button";

export const SuspendedPage = () => {
  const { t } = useTranslation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-red-100 bg-white p-8 text-center shadow-xl">
        {/* Glow effect */}
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-red-500/10 blur-2xl"></div>
        <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-amber-500/5 blur-2xl"></div>

        {/* Icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600 shadow-sm border border-red-100 mb-6">
          <ShieldAlert size={36} />
        </div>

        {/* Text */}
        <h2 className="text-2xl font-black text-slate-900 leading-tight">
          {t("auth.suspendedTitle", "Account Suspended")}
        </h2>
        <p className="mt-3 text-sm text-slate-600 leading-relaxed">
          {t(
            "auth.suspendedMessage",
            "Your account has been suspended due to policy violations or admin action. Please contact the system administrator to resolve this issue.",
          )}
        </p>

        {/* Contact info card */}
        <div className="mt-6 flex items-center justify-center gap-3 rounded-2xl bg-red-50/50 border border-red-100/50 px-4 py-3 text-left">
          <PhoneCall size={18} className="text-red-500 shrink-0" />
          <div>
            <p className="text-[10px] font-bold text-red-700 uppercase tracking-wider">
              {t("auth.contactAdmin", "Contact Support")}
            </p>
            <p className="text-xs font-bold text-slate-700 font-mono">
              support@rojgarsetu.gov.in
            </p>
          </div>
        </div>

        {/* Logout Button */}
        <div className="mt-8">
          <Button
            fullWidth
            onClick={handleLogout}
            className="bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center gap-2"
          >
            <LogOut size={16} />
            {t("common.logout", "Sign Out")}
          </Button>
        </div>
      </div>
    </div>
  );
};
