import type { ComponentProps } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Picker } from "@react-native-picker/picker";

interface SelectOption {
  label: string;
  value: string;
}

type PickerProps = ComponentProps<typeof Picker<string>>;

interface SelectProps extends Omit<PickerProps, "children"> {
  label: string;
  options: SelectOption[];
  error?: string;
}

export const Select = ({
  label,
  options,
  error,
  style,
  ...props
}: SelectProps) => {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.select, error && styles.selectError]}>
        <Picker<string> {...props} style={[styles.picker, style]}>
          {options.map((option) => (
            <Picker.Item
              key={option.value}
              label={option.label}
              value={option.value}
            />
          ))}
        </Picker>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },
  select: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#f8fafc",
    overflow: "hidden",
  },
  picker: {
    height: 56,
  },
  selectError: {
    borderColor: "#ef4444",
    backgroundColor: "#fff1f2",
  },
  error: {
    marginTop: 6,
    color: "#dc2626",
    fontSize: 12,
  },
});
