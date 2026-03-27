import { useTranslation } from "react-i18next";

import { Button } from "../common/Button";

interface RoleSelectorProps {
  onSelect: (role: "EMPLOYER" | "WORKER") => void;
}

export const RoleSelector = ({ onSelect }: RoleSelectorProps) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      <Button fullWidth className="h-14" onClick={() => onSelect("EMPLOYER")}>
        {t("auth.roleEmployer")}
      </Button>
      <Button
        fullWidth
        className="h-14"
        variant="secondary"
        onClick={() => onSelect("WORKER")}
      >
        {t("auth.roleWorker")}
      </Button>
    </div>
  );
};
