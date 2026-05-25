import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";

interface ButtonProps {
  children: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  variant?: "primary" | "secondary" | "outline";
  style?: ViewStyle;
}

export const Button = ({
  children,
  onPress,
  disabled,
  loading,
  fullWidth,
  variant = "primary",
  style,
}: ButtonProps) => {
  const buttonStyle = [
    styles.base,
    variant === "primary" && styles.primary,
    variant === "secondary" && styles.secondary,
    variant === "outline" && styles.outline,
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style,
  ];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={buttonStyle}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? "#fff" : "#1f4c9a"} />
      ) : (
        <Text
          style={[
            styles.text,
            variant === "primary" && styles.primaryText,
            variant === "secondary" && styles.secondaryText,
            variant === "outline" && styles.outlineText,
          ]}
        >
          {children}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    minHeight: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  fullWidth: {
    width: "100%",
  },
  primary: {
    backgroundColor: "#1f4c9a",
  },
  secondary: {
    backgroundColor: "#dbeafe",
  },
  outline: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  disabled: {
    opacity: 0.65,
  },
  text: {
    fontSize: 16,
    fontWeight: "700",
  },
  primaryText: {
    color: "#fff",
  },
  secondaryText: {
    color: "#1f4c9a",
  },
  outlineText: {
    color: "#0f172a",
  },
});
