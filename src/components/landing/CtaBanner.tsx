"use client";

import { Link } from "@/lib/navigation";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Reveal } from "./Reveal";

export function CtaBanner() {
  const { isAuthenticated, isReady } = useAuth();

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
      <Reveal>
        <div
          className="flex flex-col items-center gap-6 rounded-3xl px-6 py-12 text-center"
          style={{ background: "var(--gradient-hero)" }}
        >
          <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
            {isReady && isAuthenticated
              ? "Protect your streak — practice today"
              : "Start your streak. Fill your first topic bank."}
          </h2>
          <p className="max-w-lg text-sm text-primary-foreground/85">
            {isReady && isAuthenticated
              ? "Daily challenge, topic quizzes, mocks, and AI Tutor — all in one place."
              : "Free to start. No credit card. Built for CET aspirants in Rajasthan."}
          </p>
          {!isReady ? (
            <div className="h-12 w-44 animate-pulse rounded-full bg-background/40" aria-hidden />
          ) : isAuthenticated ? (
            <Link
              to="/exams"
              className="inline-flex items-center gap-2 rounded-full bg-background px-6 py-3 text-sm font-semibold text-foreground transition-transform hover:scale-[1.02]"
            >
              Open dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <Link
              to="/auth/register"
              className="inline-flex items-center gap-2 rounded-full bg-background px-6 py-3 text-sm font-semibold text-foreground transition-transform hover:scale-[1.02]"
            >
              Get started free
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </Reveal>
    </section>
  );
}
