import type { ButtonHTMLAttributes, ReactNode } from "react";

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
  const baseStyle =
    "h-12 rounded-xl px-4 text-base font-semibold transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60";

  const variantStyle = {
    primary: "bg-brand-600 text-white hover:bg-brand-700",
    secondary: "bg-accent-500 text-slate-900 hover:bg-accent-600",
    outline:
      "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50",
  }[variant];

  return (
    <button
      className={cn(baseStyle, variantStyle, fullWidth && "w-full", className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? "Please wait..." : children}
    </button>
  );
};
