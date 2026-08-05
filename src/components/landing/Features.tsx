import {
  CalendarCheck2,
  FileText,
  Flame,
  Library,
  MessagesSquare,
  Trophy,
} from "lucide-react";
import { Reveal } from "./Reveal";

const features = [
  {
    icon: Flame,
    title: "Daily streak challenge",
    body: "Twenty mixed questions from your whole exam every day. Build consistency with an IST streak that resets cleanly at midnight.",
  },
  {
    icon: Library,
    title: "Shared topic question bank",
    body: "Generate once, practice together. Normal, new-pattern, or mixed batches (10–20 Qs) land in a shared bank for every student.",
  },
  {
    icon: CalendarCheck2,
    title: "Topic quizzes & readiness",
    body: "Create frozen practice quizzes per topic, re-attempt when you want, and watch readiness climb toward exam-ready (5 quizzes).",
  },
  {
    icon: MessagesSquare,
    title: "AI Tutor (Hindi & English)",
    body: "Topic-aware answers that match your language. Short, exam-focused explanations — no broken source links cluttering the chat.",
  },
  {
    icon: FileText,
    title: "Mocks & official old papers",
    body: "Full-length mocks matched to the real pattern, plus official previous papers when available — timed like the real thing.",
  },
  {
    icon: Trophy,
    title: "Leaderboard & progress",
    body: "See Top ranks on every quiz, keep your attempt history, and know exactly where you stand before exam day.",
  },
];

export function Features() {
  return (
    <section id="features" className="scroll-mt-20 border-t border-border bg-muted/40">
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <Reveal>
          <h2 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
            Built for how aspirants actually prepare
          </h2>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Streaks for habit, topic banks for depth, mocks for stamina, and a tutor for the doubts
            that stop you mid-revision.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 60}>
              <article className="h-full rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-[var(--shadow-card)]">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                  <f.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
