import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

type BrandMarkProps = {
  className?: string;
  iconClassName?: string;
};

/** ExamSaathi logo mark — graduation cap on brand primary (matches app icon). */
export function BrandMark({ className, iconClassName }: BrandMarkProps) {
  return (
    <span
      className={cn(
        "grid place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm",
        className,
      )}
      aria-hidden
    >
      <GraduationCap className={cn("h-5 w-5", iconClassName)} />
    </span>
  );
}
