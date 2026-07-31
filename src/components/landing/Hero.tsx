"use client";

import { Link } from "@/lib/navigation";
import { ArrowRight, BarChart3, BookOpenCheck, Sparkles, Trophy } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Reveal } from "./Reveal";
import { AuthActionsSkeleton } from "./AuthActionsSkeleton";

function VisualMock() {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-8 opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(50% 50% at 60% 40%, var(--color-primary) 0%, transparent 70%)",
        }}
      />
      <div className="relative rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold text-muted-foreground">Topic quiz · Polity</div>
          <div className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
            08:42
          </div>
        </div>
        <p className="mt-4 text-sm font-semibold leading-relaxed">
          Which article of the Indian Constitution deals with the Right to Equality?
        </p>
        <div className="mt-4 space-y-2">
          {["Article 12", "Article 14", "Article 19", "Article 21"].map((o, i) => (
            <div
              key={o}
              className={
                i === 1
                  ? "rounded-xl border border-primary bg-primary/10 px-3 py-2.5 text-sm font-medium"
                  : "rounded-xl border border-border px-3 py-2.5 text-sm text-muted-foreground"
              }
            >
              {o}
            </div>
          ))}
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
          {[
            { icon: BookOpenCheck, label: "24 topics" },
            { icon: Trophy, label: "Rank #12" },
            { icon: BarChart3, label: "78% avg" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="rounded-xl bg-muted px-2 py-3">
              <Icon className="mx-auto h-4 w-4 text-primary" />
              <div className="mt-1 text-[11px] font-medium text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  const { user, isAuthenticated, isReady } = useAuth();

  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-2 lg:items-center">
        <Reveal>
          {!isReady ? (
            <div>
              <div className="h-6 w-48 animate-pulse rounded-full bg-muted" />
              <div className="mt-5 h-24 w-full animate-pulse rounded-2xl bg-muted" />
              <div className="mt-5 h-16 w-full max-w-xl animate-pulse rounded-2xl bg-muted" />
              <div className="mt-8">
                <AuthActionsSkeleton className="sm:gap-3" />
              </div>
            </div>
          ) : isAuthenticated ? (
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Your prep dashboard is ready
              </div>
              <h1 className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
                Welcome back, {user?.name ?? "Aspirant"} 👋
              </h1>
              <p className="mt-4 max-w-xl text-base text-muted-foreground">
                Pick up right where you stopped — fresh questions, mock papers and your rank are
                waiting.
              </p>
              <div className="mt-8">
                <Link
                  to="/exams"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Go to Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ) : (
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Built for CET 12th Level — and every exam next
              </div>
              <h1 className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl">
                Crack your exam with an AI study partner that never runs out of questions
              </h1>
              <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
                ExamSaathi generates unlimited topic-wise practice questions, full-length mock
                papers matching the real exam pattern, and answers your doubts instantly — all
                built for CET 12th Level and growing to every competitive exam.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/auth/register"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Start Practicing Free
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold transition-colors hover:bg-secondary"
                >
                  See How It Works
                </a>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Free to start · No credit card needed
              </p>
            </div>
          )}
        </Reveal>

        <Reveal delay={120}>
          <VisualMock />
        </Reveal>
      </div>
    </section>
  );
}
