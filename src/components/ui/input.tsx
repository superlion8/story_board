import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  isInvalid?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, isInvalid, type = "text", ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "flex h-11 w-full rounded-2xl border border-neutral-200 bg-white px-4 text-sm text-fg shadow-sm transition placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          isInvalid && "border-error focus-visible:ring-error",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };
