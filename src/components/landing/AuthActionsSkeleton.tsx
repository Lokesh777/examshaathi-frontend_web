import { cn } from "@/lib/utils";

export function AuthActionsSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)} aria-hidden>
      <div className="h-9 w-[4.5rem] animate-pulse rounded-full bg-muted" />
      <div className="h-9 w-[7.5rem] animate-pulse rounded-full bg-muted" />
    </div>
  );
}
