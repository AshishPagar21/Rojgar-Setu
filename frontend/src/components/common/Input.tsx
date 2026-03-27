import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";

import { cn } from "../../utils/helpers";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <label className="block w-full">
        <span className="mb-1 block text-sm font-medium text-slate-700">
          {label}
        </span>
        <input
          ref={ref}
          className={cn(
            "h-14 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 text-base outline-none focus:border-brand-600 focus:bg-white focus:ring-2 focus:ring-brand-100",
            error && "border-red-400 focus:border-red-500 focus:ring-red-100",
            className,
          )}
          {...props}
        />
        {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
      </label>
    );
  },
);

Input.displayName = "Input";
