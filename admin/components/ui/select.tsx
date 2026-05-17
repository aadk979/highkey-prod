import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, children, ...props }, ref) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label ? (
          <label htmlFor={selectId} className="text-sm font-medium text-ink">
            {label}
          </label>
        ) : null}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            "h-10 w-full rounded-md border border-hairline bg-surface-1 px-3 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
            error && "border-error",
            className,
          )}
          {...props}
        >
          {children}
        </select>
        {error ? <p className="text-xs text-error">{error}</p> : null}
      </div>
    );
  },
);
Select.displayName = "Select";
