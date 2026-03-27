import { forwardRef } from "react";
import type { SelectHTMLAttributes } from "react";

import { cn } from "../../utils/helpers";

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, className, ...props }, ref) => {
    return (
      <label className="block w-full">
        <span className="mb-1 block text-sm font-medium text-slate-700">
          {label}
        </span>
        <select
          ref={ref}
          className={cn(
            "h-12 w-full rounded-xl border border-slate-300 px-4 text-base outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100",
            error && "border-red-400 focus:border-red-500 focus:ring-red-100",
            className,
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
      </label>
    );
  },
);

Select.displayName = "Select";
