import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type Props = React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean };

export const OtpDigitBox = forwardRef<HTMLInputElement, Props>(
  ({ className, invalid, ...props }, ref) => (
    <input
      ref={ref}
      inputMode="numeric"
      autoComplete="one-time-code"
      maxLength={1}
      className={cn(
        "h-12 w-10 rounded-xl border bg-background text-center text-lg font-bold tabular-nums outline-none transition sm:h-14 sm:w-12",
        "border-input focus:border-primary focus:ring-2 focus:ring-primary/30",
        invalid && "border-destructive focus:border-destructive focus:ring-destructive/30",
        className,
      )}
      {...props}
    />
  ),
);
OtpDigitBox.displayName = "OtpDigitBox";