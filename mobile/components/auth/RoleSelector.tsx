import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { Button } from "../common/Button";

interface Props {
  onSelect: (role: "EMPLOYER" | "WORKER") => void;
}

export const RoleSelector = ({ onSelect }: Props) => {
  const { t } = useTranslation();

  return (
    <View style={{ gap: 12 }}>
      <Button fullWidth onPress={() => onSelect("EMPLOYER")}>
        {t("auth.roleEmployer")}
      </Button>
      <Button fullWidth variant="secondary" onPress={() => onSelect("WORKER")}>
        {t("auth.roleWorker")}
      </Button>
    </View>
  );
};
