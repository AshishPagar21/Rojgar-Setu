import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { cn } from "../../utils/helpers";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  fullWidth?: boolean;
  variant?: "primary" | "secondary" | "outline";
  loading?: boolean;
}

export const Button = ({
  children,
  className,
  fullWidth,
  variant = "primary",
  loading,
  disabled,
  ...props
}: ButtonProps) => {
  const { t } = useTranslation();

  const baseStyle =
    "h-14 rounded-xl px-4 text-base font-semibold transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60";

  const variantStyle = {
    primary: "bg-brand-600 text-white hover:bg-brand-700",
    secondary: "bg-brand-100 text-brand-700 hover:bg-brand-200",
    outline:
      "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50",
  }[variant];

  return (
    <button
      className={cn(baseStyle, variantStyle, fullWidth && "w-full", className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? t("common.pleaseWait") : children}
    </button>
  );
};
