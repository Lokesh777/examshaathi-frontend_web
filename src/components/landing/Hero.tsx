"use client";

import { Link } from "@/lib/navigation";
import { ArrowRight, Flame, MessageCircle, Sparkles, Target } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Reveal } from "./Reveal";
import { AuthActionsSkeleton } from "./AuthActionsSkeleton";
import { BrandMark } from "@/components/atoms/BrandMark";

function VisualMock() {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-10 opacity-50 blur-3xl"
        style={{
          background:
            "radial-gradient(55% 55% at 65% 35%, color-mix(in oklab, var(--color-primary) 55%, transparent) 0%, transparent 72%)",
        }}
      />

      <div className="relative space-y-3">
        <div className="rounded-2xl border border-border bg-card/95 p-4 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/12 text-primary">
                <Flame className="h-4 w-4" />
              </span>
              <div>
                <div className="text-sm font-semibold">Daily streak</div>
                <div className="text-[11px] text-muted-foreground">20 mixed questions · exam-wide</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold tabular-nums text-primary">7</div>
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">days</div>
            </div>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-[70%] rounded-full bg-primary" />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card/95 p-4 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-muted-foreground">Topic practice · Polity</div>
            <div className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-semibold text-secondary-foreground">
              Ready 3/5
            </div>
          </div>
          <p className="mt-3 text-sm font-semibold leading-snug">
            Which article of the Indian Constitution deals with the Right to Equality?
          </p>
          <div className="mt-3 space-y-1.5">
            {["Article 12", "Article 14", "Article 19", "Article 21"].map((o, i) => (
              <div
                key={o}
                className={
                  i === 1
                    ? "rounded-lg border border-primary bg-primary/10 px-3 py-2 text-sm font-medium"
                    : "rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground"
                }
              >
                {o}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2.5 rounded-2xl border border-border bg-card/95 p-3.5 shadow-[var(--shadow-card)]">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/12 text-primary">
            <MessageCircle className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-muted-foreground">AI Tutor</div>
            <p className="mt-0.5 text-sm leading-snug">
              Article 14 guarantees equality before law — a favourite CET trap with Articles 15–18.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  const { user, isAuthenticated, isReady } = useAuth();

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 90% 55% at 20% -5%, color-mix(in oklab, var(--color-primary) 16%, transparent), transparent 65%)",
        }}
      />

      <div className="relative mx-auto grid w-full max-w-6xl gap-12 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-2 lg:items-center lg:py-24">
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
              <div className="flex items-center gap-2.5">
                <BrandMark className="h-10 w-10 rounded-xl" />
                <span className="text-xl font-bold tracking-tight">ExamSaathi</span>
              </div>
              <h1 className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
                Welcome back, {user?.name ?? "Aspirant"}
              </h1>
              <p className="mt-4 max-w-xl text-base text-muted-foreground">
                Keep your daily streak, finish topic quizzes, or clear a doubt with AI Tutor —
                your prep is waiting.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/exams"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Continue prep
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2.5">
                <BrandMark className="h-11 w-11 rounded-xl" />
                <div>
                  <div className="text-2xl font-bold tracking-tight sm:text-3xl">ExamSaathi</div>
                  <div className="text-xs font-medium text-muted-foreground">
                    AI prep for Rajasthan CET &amp; more
                  </div>
                </div>
              </div>
              <h1 className="mt-6 text-3xl font-bold leading-[1.12] tracking-tight sm:text-4xl md:text-5xl">
                Daily streaks, topic banks &amp; an AI tutor that speaks your language
              </h1>
              <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
                Practice 20 mixed questions every day, generate shared topic quizzes (normal / new
                pattern), take pattern-true mocks, and ask doubts in Hindi or English.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/auth/register"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Start practicing free
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold transition-colors hover:bg-secondary"
                >
                  See how it works
                </a>
              </div>
              <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Flame className="h-3.5 w-3.5 text-primary" /> Daily streak
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Target className="h-3.5 w-3.5 text-primary" /> Topic readiness
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" /> AI Tutor
                </span>
              </div>
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
