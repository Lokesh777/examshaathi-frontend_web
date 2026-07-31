import type { ReactNode } from "react";
import { Link } from "@/lib/navigation";
import { GraduationCap, ArrowLeft } from "lucide-react";

export function AuthShell({
  title,
  subtitle,
  backTo,
  children,
  footer,
}: {
  title: string;
  subtitle?: ReactNode;
  backTo?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[55vh] opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 0%, var(--color-primary) 0%, transparent 65%), radial-gradient(45% 45% at 85% 20%, var(--color-accent) 0%, transparent 60%)",
          maskImage: "linear-gradient(180deg, black, transparent)",
          WebkitMaskImage: "linear-gradient(180deg, black, transparent)",
        }}
      />

      <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 py-10">
        <div className="mb-8 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg ring-1 ring-primary/30">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <div className="text-lg font-bold tracking-tight">ExamSaathi</div>
            <div className="text-xs text-muted-foreground">Your AI study partner</div>
          </div>
        </div>

        {backTo && (
          <Link
            to={backTo as "/auth"}
            className="mb-4 inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        )}

        <h1 className="text-3xl font-bold leading-tight tracking-tight">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}

        <div className="mt-8">{children}</div>

        {footer && <div className="mt-6">{footer}</div>}

        <p className="mt-auto pt-10 text-center text-[11px] text-muted-foreground">
          By continuing you agree to our Terms & Privacy Policy.
        </p>
      </div>
    </div>
  );
}