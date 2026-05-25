import { forwardRef } from "react";
import type { ComponentProps } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

type TextInputProps = ComponentProps<typeof TextInput>;

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, style, ...props }, ref) => {
    return (
      <View style={styles.wrapper}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
          ref={ref}
          style={[styles.input, error && styles.inputError, style]}
          {...props}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    );
  },
);

Input.displayName = "Input";

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
  input: {
    minHeight: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 16,
    color: "#0f172a",
    fontSize: 16,
  },
  inputError: {
    borderColor: "#ef4444",
    backgroundColor: "#fff1f2",
  },
  error: {
    marginTop: 6,
    color: "#dc2626",
    fontSize: 12,
  },
});
