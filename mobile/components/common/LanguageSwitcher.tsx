import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";
import { Picker } from "@react-native-picker/picker";

import i18n from "../../i18n";

const languages = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "mr", label: "Marathi" },
] as const;

export const LanguageSwitcher = () => {
  const { t } = useTranslation();
  const selectedLanguage =
    languages.find((language) => i18n.language?.startsWith(language.code))
      ?.code ?? "en";

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t("common.language")}</Text>
      <View style={styles.selectWrap}>
        <Picker
          selectedValue={selectedLanguage}
          onValueChange={(value) => {
            if (typeof value === "string") {
              void i18n.changeLanguage(value);
            }
          }}
          mode="dropdown"
          style={styles.picker}
          itemStyle={styles.pickerItem}
        >
          {languages.map((language) => (
            <Picker.Item
              key={language.code}
              label={language.label}
              value={language.code}
            />
          ))}
        </Picker>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: "500",
    color: "#334155",
  },
  selectWrap: {
    height: 32,
    minWidth: 100,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#fff",
    justifyContent: "center",
    overflow: "hidden",
  },
  picker: {
    height: 32,
    width: 130,
    marginTop: -6,
    color: "#0f172a",
  },
  pickerItem: {
    fontSize: 12,
    fontWeight: "500",
  },
});
